import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('dist',{recursive:true});
for(const path of ['index.html','admin.html','404.html','assets','projects','robots.txt','sitemap.xml','site.webmanifest']) cpSync(path,'dist/'+path,{recursive:true});
