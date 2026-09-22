const STATUSES = ['new', 'contacted', 'completed'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();
class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new ApiError(status, message); };
async function hash(value) { return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))); }
async function secretMatches(a, b) {
  const [left, right] = await Promise.all([hash(a), hash(b)]);
  let difference = 0; for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}
async function body(request) {
  if (!(request.headers.get('content-type') || '').startsWith('application/json')) fail(415, 'Use JSON.');
  if (Number(request.headers.get('content-length')) > 12000) fail(413, 'Message is too large.');
  const reader = request.body?.getReader(); if (!reader) fail(400, 'Missing request body.');
  let size = 0; const chunks = [];
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length;
    if (size > 12000) { await reader.cancel(); fail(413, 'Message is too large.'); } chunks.push(part.value); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { const data = JSON.parse(new TextDecoder().decode(bytes)); if (!data || Array.isArray(data) || typeof data !== 'object') throw Error(); return data; }
  catch { fail(400, 'Invalid JSON.'); }
}
function text(value, label, min, max) {
  if (typeof value !== 'string') fail(400, `Check ${label}.`);
  const clean = value.trim(); if (clean.length < min || clean.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(clean)) fail(400, `Check ${label}.`);
  return clean;
}
const allowed = (value, item) => !!item && String(value || '').split(',').map(s => s.trim()).includes(item);
function ready(env) { return env.DB && env.INQUIRY_LIMITER && env.ADMIN_LIMITER && env.TURNSTILE_SECRET_KEY && env.ADMIN_TOKEN?.length >= 32 && env.ALLOWED_ORIGIN && env.TURNSTILE_HOSTNAME; }
async function limit(binding, request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!(await binding.limit({key: ip})).success) fail(429, 'Too many requests. Please wait a minute.');
}
async function authorize(request, env) {
  await limit(env.ADMIN_LIMITER, request);
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ') || auth.length > 300 || !(await secretMatches(auth.slice(7), env.ADMIN_TOKEN))) fail(401, 'Access key was not accepted.');
}
export async function route(request, env, fetcher = fetch) {
  const url = new URL(request.url); const origin = request.headers.get('origin');
  if (origin && !allowed(env.ALLOWED_ORIGIN, origin)) fail(403, 'Origin not allowed.');
  if (request.method === 'OPTIONS') return {status: 204};
  if (!ready(env)) fail(503, 'Inquiries are not available yet. Please use email.');
  if (url.pathname === '/api/health' && request.method === 'GET') {
    await env.DB.prepare('SELECT id FROM inquiries LIMIT 1').first();
    return {data: {ready: true}};
  }
  if (url.pathname === '/api/inquiries' && request.method === 'POST') {
    if (!allowed(env.ALLOWED_ORIGIN, origin)) fail(403, 'Origin not allowed.');
    await limit(env.INQUIRY_LIMITER, request);
    const data = await body(request);
    if (data.website) fail(400, 'Submission could not be accepted.');
    if (data.consent !== true) fail(400, 'Please agree to being contacted about this inquiry.');
    const name = text(data.name, 'your name', 2, 100);
    const email = text(data.email, 'your email', 3, 254).toLowerCase();
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n]/.test(email)) fail(400, 'Check your email address.');
    const message = text(data.message, 'your project description (20–4000 characters)', 20, 4000);
    const budget = text(data.budget || 'Not sure yet', 'budget', 1, 80);
    if (!UUID.test(data.requestId || '')) fail(400, 'Invalid submission reference.');
    const fingerprint = [...await hash(JSON.stringify([name,email,message,budget]))].map(b=>b.toString(16).padStart(2,'0')).join('');
    // A lost response can be retried without duplicating the inquiry or consuming a used challenge.
    const previous = await env.DB.prepare('SELECT id, fingerprint FROM inquiries WHERE request_id = ?').bind(data.requestId).first();
    if (previous) { if (previous.fingerprint !== fingerprint) fail(409, 'This submission changed. Start a new inquiry.'); return {data:{saved:true,reference:previous.id}}; }
    const token = text(data.turnstileToken, 'verification', 1, 2048);
    let verified;
    try {
      const result = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method:'POST', body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get('CF-Connecting-IP') || ''}), signal:AbortSignal.timeout(10000)
      });
      if (!result.ok) fail(503, 'Verification is unavailable. Please try again.');
      verified = await result.json();
    } catch { fail(503, 'Verification is unavailable. Please try again.'); }
    if (!verified.success || (!allowed(env.TURNSTILE_HOSTNAME, verified.hostname) || verified.hostname !== new URL(origin).hostname) || verified.action !== 'inquiry') fail(400, 'Verification expired or failed. Please try again.');
    const id = crypto.randomUUID(); const now = new Date().toISOString();
    await env.DB.prepare('INSERT INTO inquiries (id,request_id,fingerprint,name,email,budget,message,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,\'new\',?,?) ON CONFLICT(request_id) DO NOTHING')
      .bind(id,data.requestId,fingerprint,name,email,budget,message,now,now).run();
    const saved = await env.DB.prepare('SELECT id, fingerprint FROM inquiries WHERE request_id = ?').bind(data.requestId).first();
    if (!saved || saved.fingerprint !== fingerprint) fail(409, 'This submission changed. Start a new inquiry.');
    return {status:201,data:{saved:true,reference:saved.id}};
  }
  if (url.pathname.startsWith('/api/admin/')) {
    await authorize(request, env);
    if (url.pathname === '/api/admin/inquiries' && request.method === 'GET') {
      const status = url.searchParams.get('status') || '';
      if (status && !STATUSES.includes(status)) fail(400, 'Invalid status.');
      const after = url.searchParams.get('after') || '';
      if (after && !UUID.test(after)) fail(400, 'Invalid page cursor.');
      const clauses = [], params = [];
      if (status) {clauses.push('status = ?');params.push(status);}
      if (after) {
        const cursor = await env.DB.prepare('SELECT created_at FROM inquiries WHERE id = ?').bind(after).first();
        if (!cursor) fail(400, 'That page changed. Refresh the inquiry list.');
        clauses.push('(created_at < ? OR (created_at = ? AND id < ?))');params.push(cursor.created_at,cursor.created_at,after);
      }
      const rows = await env.DB.prepare('SELECT id,name,email,budget,message,status,created_at,updated_at FROM inquiries'+(clauses.length?' WHERE '+clauses.join(' AND '):'')+' ORDER BY created_at DESC, id DESC LIMIT 26').bind(...params).all();
      return {data:{inquiries:rows.results.slice(0,25),next:rows.results.length>25?rows.results[24].id:null}};
    }
    const match = url.pathname.match(/^\/api\/admin\/inquiries\/([0-9a-f-]+)$/i);
    if (match && UUID.test(match[1])) {
      if (request.method === 'PATCH') {
        const data = await body(request); if (!STATUSES.includes(data.status)) fail(400, 'Invalid status.');
        const result = await env.DB.prepare('UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?').bind(data.status,new Date().toISOString(),match[1]).run();
        if (!result.meta.changes) fail(404, 'Inquiry not found.'); return {data:{updated:true}};
      }
      if (request.method === 'DELETE') {
        const result = await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(match[1]).run();
        if (!result.meta.changes) fail(404, 'Inquiry not found.');return {data:{deleted:true}};
      }
    }
  }
  fail(404, 'Endpoint not found.');
}
export default {
  async fetch(request, env) {
    const origin=request.headers.get('origin');
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Origin'};
    if(allowed(env.ALLOWED_ORIGIN, origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Methods']='GET, POST, PATCH, DELETE, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, Authorization';}
    try {const result=await route(request,env);return new Response(result.status===204?null:JSON.stringify(result.data),{status:result.status||200,headers});}
    catch(error){const status=error instanceof ApiError?error.status:503;if(status===429)headers['Retry-After']='60';return new Response(JSON.stringify({error:status===503?'Service is unavailable. Please try again or use email.':error.message}),{status,headers});}
  }
};
