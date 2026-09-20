(() => {
  'use strict';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const clock = document.querySelector('[data-clock]');
  if (clock && typeof Intl !== 'undefined') {
    clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' IST';
  }
  const sample = document.querySelector('.lab-sample');
  document.querySelectorAll('input[name="grid"]').forEach(input => {
    input.addEventListener('change', () => { if (sample && input.checked) sample.dataset.grid = input.value; });
  });
  // Keep the native disclosure interaction in browsers without exclusive details support.
  const stages = [...document.querySelectorAll('.matrix-stages details')];
  stages.forEach(stage => stage.addEventListener('toggle', () => {
    if (stage.open) stages.forEach(other => { if (other !== stage) other.open = false; });
  }));
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.site-header nav a')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    links.forEach(link => { const target = document.getElementById(link.hash.slice(1)); if (target) observer.observe(target); });
  }
  console.info('Curious enough to inspect the code? We should probably work together. — MSK');
})();
