const V='segment-1794837397';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const q=e.request,u=new URL(q.url);
  const page=q.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
  if(page){   // network first (3 s) so an online launch always gets the newest build; cache when offline or slow
    e.respondWith(new Promise(res=>{
      let done=false;const fb=()=>caches.match('index.html').then(r=>r||caches.match('./')).then(r=>{if(!done){done=true;res(r||Response.error())}});
      const t=setTimeout(fb,3000);
      fetch(q,{cache:'no-store'}).then(n=>{clearTimeout(t);if(done)return;done=true;const c=n.clone();caches.open(V).then(x=>x.put('index.html',c));res(n)}).catch(()=>{clearTimeout(t);fb()});
    }));
    return;
  }
  e.respondWith(caches.match(q,{ignoreSearch:true}).then(r=>r||fetch(q).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(q,c));return n}).catch(()=>caches.match('index.html'))));
});
