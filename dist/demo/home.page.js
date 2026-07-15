"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHomePage = renderHomePage;
function renderHomePage(cfg) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SCIM — Live</title>
<style>
  :root{ --bg:#f4f6fb; --panel:#fff; --ink:#12203a; --muted:#5b6b85; --line:#e3e8f2; --brand:#1662dd;
    --ok-bg:#e5f6ec; --ok:#1c7a45; --off-bg:#fdeaea; --off:#b3261e; --chip:#eef2fb; --chip-ink:#33507f;
    --okta:#1662dd; --keycloak:#7b3ff2; --scim:#12a150; --code:#0f1830; --code-ink:#cdd8ef;
    --shadow:0 1px 3px rgba(18,32,58,.07),0 8px 24px rgba(18,32,58,.05); }
  @media (prefers-color-scheme:dark){ :root{ --bg:#0c1120; --panel:#121a2e; --ink:#e8eefb; --muted:#93a1bf;
    --line:#22304d; --brand:#4b8bf5; --ok-bg:#123726; --ok:#5fd490; --off-bg:#3a1615; --off:#f19b95;
    --chip:#1b2740; --chip-ink:#a8bce6; --okta:#4b8bf5; --keycloak:#a882ff; --scim:#3ddc84;
    --code:#0a1020; --code-ink:#bccbe8; --shadow:0 1px 3px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.3); } }
  *{box-sizing:border-box;} body{margin:0;background:var(--bg);color:var(--ink);
    font:14.5px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
  .wrap{max-width:1360px;margin:0 auto;padding:22px 22px 48px;}
  header.top{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
  .logo{width:34px;height:34px;border-radius:9px;background:var(--brand);display:grid;place-items:center;color:#fff;font-weight:700;}
  h1{font-size:18px;margin:0;font-weight:650;} .sub{color:var(--muted);font-size:12.5px;margin:1px 0 0;}
  .grow{flex:1;}
  .btn{background:transparent;border:1px solid var(--line);color:var(--muted);border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer;text-decoration:none;}
  .btn:hover{color:var(--ink);border-color:var(--muted);}
  .btn.danger{color:var(--off);border-color:var(--off);} .btn.danger:hover{background:var(--off-bg);}
  a.btn.docs{color:var(--brand);border-color:var(--brand);}

  .layout{display:grid;grid-template-columns:minmax(0,1fr) 460px;gap:20px;align-items:start;}
  @media (max-width:1040px){.layout{grid-template-columns:1fr;}}

  /* small stat strip */
  .stats{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
  .stat{background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:10px 16px;box-shadow:var(--shadow);min-width:92px;}
  .stat .n{font-size:22px;font-weight:700;line-height:1;} .stat .l{color:var(--muted);font-size:11.5px;margin-top:4px;}
  .stat.active .n{color:var(--ok);} .stat.off .n{color:var(--off);}

  .section-head{display:flex;align-items:center;justify-content:space-between;margin:2px 0 10px;}
  .section-head h2{font-size:14px;margin:0;} .live{display:inline-flex;align-items:center;gap:7px;color:var(--muted);font-size:12px;}
  .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;animation:pulse 1.8s infinite;}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.5);}70%{box-shadow:0 0 0 7px rgba(34,197,94,0);}100%{box-shadow:0 0 0 0 rgba(34,197,94,0);}}

  .tablecard{background:var(--panel);border:1px solid var(--line);border-radius:13px;box-shadow:var(--shadow);overflow:hidden;}
  .scroll{overflow-x:auto;} table{width:100%;border-collapse:collapse;font-size:13.5px;min-width:640px;}
  thead th{text-align:left;padding:11px 15px;color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid var(--line);}
  tbody td{padding:12px 15px;border-bottom:1px solid var(--line);vertical-align:middle;} tbody tr:last-child td{border-bottom:none;}
  tbody tr.new{animation:flash 2.4s ease-out;} @keyframes flash{from{background:rgba(22,98,221,.16);}to{background:transparent;}}
  .name{font-weight:600;} .email{color:var(--muted);}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:600;}
  .badge.on{background:var(--ok-bg);color:var(--ok);} .badge.off{background:var(--off-bg);color:var(--off);}
  .badge .d{width:6px;height:6px;border-radius:50%;background:currentColor;}
  .chip{display:inline-block;background:var(--chip);color:var(--chip-ink);border-radius:6px;padding:2px 8px;font-size:11.5px;margin:2px 3px 2px 0;}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;color:var(--muted);}
  .empty{padding:40px 20px;text-align:center;color:var(--muted);} .empty .big{font-size:14px;color:var(--ink);margin-bottom:3px;font-weight:600;}

  /* activity log */
  aside.log{position:sticky;top:16px;background:var(--panel);border:1px solid var(--line);border-radius:13px;box-shadow:var(--shadow);display:flex;flex-direction:column;max-height:calc(100vh - 32px);}
  .log-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line);}
  .log-head h2{font-size:14px;margin:0;} .legend{display:flex;gap:9px;margin-top:5px;font-size:10.5px;color:var(--muted);}
  .legend span{display:inline-flex;align-items:center;gap:4px;} .lg{width:8px;height:8px;border-radius:2px;}
  .lg.okta{background:var(--okta);} .lg.keycloak{background:var(--keycloak);} .lg.scim{background:var(--scim);}
  /* block flow (NOT flex) so cards keep their natural height and never get
     squished; the column itself scrolls. */
  .log-body{flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px;}
  .log-empty{padding:40px 16px;text-align:center;color:var(--muted);font-size:12.5px;}

  /* the clear event template */
  .ev{border:1px solid var(--line);border-radius:11px;overflow:hidden;animation:slidein .3s ease-out;}
  .ev+.ev{margin-top:11px;}
  @keyframes slidein{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}
  .ev-hd{display:flex;align-items:center;gap:8px;padding:9px 12px;border-left:4px solid var(--line);}
  .ev.okta .ev-hd{border-left-color:var(--okta);} .ev.keycloak .ev-hd{border-left-color:var(--keycloak);} .ev.scim .ev-hd{border-left-color:var(--scim);}
  .dir{font-weight:700;font-size:12.5px;} .ev.okta .dir{color:var(--okta);} .ev.keycloak .dir{color:var(--keycloak);} .ev.scim .dir{color:var(--scim);}
  .kind{font-size:10px;font-weight:700;letter-spacing:.05em;padding:2px 7px;border-radius:5px;text-transform:uppercase;}
  .kind.req{background:var(--chip);color:var(--chip-ink);} .kind.res{background:var(--ok-bg);color:var(--ok);} .kind.res.err{background:var(--off-bg);color:var(--off);}
  .ts{color:var(--muted);font-size:10.5px;font-family:ui-monospace,monospace;margin-left:auto;}
  .ev-line{padding:8px 12px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;word-break:break-all;}
  .st{display:inline-block;font-weight:700;border-radius:5px;padding:0 6px;font-size:11px;margin-right:6px;}
  .st.ok{background:var(--ok-bg);color:var(--ok);} .st.err{background:var(--off-bg);color:var(--off);}
  .sub-h{font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:700;margin:9px 12px 3px;}
  /* pre blocks: force long tokens/URLs to WRAP (not scroll sideways) so the
     body/headers are fully readable. break-all + overflow-wrap:anywhere break
     continuous no-space strings like the 900-char bearer token. */
  .pl{background:var(--code);border:1px solid var(--line);border-radius:8px;margin:2px 12px 12px;padding:10px 12px;
    font-size:11.5px;line-height:1.6;white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;
    max-height:280px;overflow-y:auto;overflow-x:hidden;color:var(--code-ink);
    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
  .pl.hdr{color:var(--code-ink);}
  .pl .kk{color:var(--scim);}
  footer{color:var(--muted);font-size:11px;margin-top:20px;text-align:center;}
  .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:7px 14px;border-radius:7px;font-size:12.5px;opacity:0;transition:opacity .2s;pointer-events:none;}
  .toast.show{opacity:1;}
</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div class="logo">S</div>
    <div><h1>SCIM — Live</h1><p class="sub">Provisioned users &amp; the Okta ⇄ Keycloak ⇄ SCIM traffic.</p></div>
    <div class="grow"></div>
    <a class="btn docs" href="/docs">📘 Docs</a>
    <button class="btn danger" id="clearDb">🗑 Clear database</button>
  </header>

  <div class="layout">
    <div>
      <div class="stats">
        <div class="stat"><div class="n" id="s-total">–</div><div class="l">Users</div></div>
        <div class="stat active"><div class="n" id="s-active">–</div><div class="l">Active</div></div>
        <div class="stat off"><div class="n" id="s-off">–</div><div class="l">Deactivated</div></div>
        <div class="stat"><div class="n" id="s-groups">–</div><div class="l">Groups</div></div>
      </div>

      <div class="section-head">
        <h2>Provisioned users</h2>
        <span class="live"><span class="dot"></span><span id="updated">—</span></span>
      </div>
      <div class="tablecard"><div class="scroll">
        <table>
          <thead><tr><th>Status</th><th>Username</th><th>Name</th><th>Email</th><th>Groups</th><th>Okta ID</th><th>Created</th></tr></thead>
          <tbody id="rows"><tr><td colspan="7" class="empty"><div class="big">Loading…</div></td></tr></tbody>
        </table>
      </div></div>
    </div>

    <aside class="log">
      <div class="log-head">
        <div>
          <h2>Activity log</h2>
          <div class="legend"><span><span class="lg okta"></span>Okta</span><span><span class="lg keycloak"></span>Keycloak</span><span><span class="lg scim"></span>SCIM</span></div>
        </div>
        <button class="btn" id="clearLog">Clear</button>
      </div>
      <div class="log-body" id="log"><div class="log-empty">Waiting for traffic…<br>Assign a user in Okta to see the flow.</div></div>
    </aside>
  </div>

  <footer>Reads directly from the SCIM server · <a href="/docs" style="color:var(--muted)">docs</a> · build <span class="mono">${cfg.buildId}</span></footer>
</div>
<div class="toast" id="toast"></div>

<script>
  const esc=(s)=>String(s??'').replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmt=(iso)=>{try{return new Date(iso).toLocaleString();}catch{return '—';}};
  const time=(iso)=>{try{return new Date(iso).toLocaleTimeString();}catch{return '';}};
  function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1200);}

  // ---- users ----
  const seen=new Set(); let firstUsers=true,lastSig=null;
  const sig=(d)=>JSON.stringify({g:d.totalGroups,u:d.users.map(u=>[u.id,u.active,u.updatedAt,u.email,u.givenName,u.familyName,(u.groups||[]).join(','),u.externalId])});
  function renderUsers(d){
    s_total.textContent=d.totalUsers; s_active.textContent=d.activeUsers; s_off.textContent=d.totalUsers-d.activeUsers; s_groups.textContent=d.totalGroups;
    document.getElementById('updated').textContent='updated '+time(d.updatedAt);
    const tb=document.getElementById('rows');
    if(!d.users.length){tb.innerHTML='<tr><td colspan="7" class="empty"><div class="big">No users provisioned yet</div>Assign a user to the SCIM app in Okta.</td></tr>';return;}
    tb.innerHTML=d.users.map(u=>{
      const isNew=!firstUsers&&!seen.has(u.id);
      const name=[u.givenName,u.familyName].filter(Boolean).join(' ')||'—';
      const groups=u.groups.length?u.groups.map(g=>'<span class="chip">'+esc(g)+'</span>').join(''):'<span class="mono">—</span>';
      const badge=u.active?'<span class="badge on"><span class="d"></span>Active</span>':'<span class="badge off"><span class="d"></span>Deactivated</span>';
      return '<tr class="'+(isNew?'new':'')+'"><td>'+badge+'</td><td class="name">'+esc(u.userName)+'</td><td>'+esc(name)+'</td><td class="email">'+(u.email?esc(u.email):'<span class="mono">—</span>')+'</td><td>'+groups+'</td><td class="mono">'+(u.externalId?esc(u.externalId):'—')+'</td><td class="mono">'+fmt(u.createdAt)+'</td></tr>';
    }).join('');
    d.users.forEach(u=>seen.add(u.id)); firstUsers=false;
  }
  const s_total=document.getElementById('s-total'),s_active=document.getElementById('s-active'),s_off=document.getElementById('s-off'),s_groups=document.getElementById('s-groups');

  // ---- activity log (clear request/response template) ----
  function pretty(p){ if(p==null) return ''; return typeof p==='string'?p:JSON.stringify(p,null,2); }
  function card(e){
    const isReq=e.kind==='request';
    const kindCls=isReq?'req':((e.status>=200&&e.status<300)?'res':'res err');
    const kindTxt=isReq?'Request':('Response');
    const line=isReq
      ? '<span class="mono">'+esc(e.method||'')+' '+esc(e.path||'')+'</span>'
      : '<span class="st '+((e.status>=200&&e.status<300)?'ok':'err')+'">'+esc(e.status)+'</span><span class="mono">'+esc((e.method||'')+' '+(e.path||''))+'</span>';
    const hdr=(e.headers&&Object.keys(e.headers).length)
      ? '<div class="sub-h">Headers</div><pre class="pl hdr">'+Object.entries(e.headers).map(([k,v])=>'<span class="kk">'+esc(k)+'</span>: '+esc(v)).join('\\n')+'</pre>' : '';
    const bodyLabel=isReq?'Request body (input)':'Response body (output)';
    const body=(e.payload!==undefined&&e.payload!==null&&pretty(e.payload)!=='')
      ? '<div class="sub-h">'+bodyLabel+'</div><pre class="pl">'+esc(pretty(e.payload))+'</pre>' : '';
    return '<div class="ev '+esc(e.source)+'">'
      +'<div class="ev-hd"><span class="dir">'+esc(e.actor)+'</span><span class="kind '+kindCls+'">'+kindTxt+'</span><span class="ts">'+time(e.ts)+'</span></div>'
      +'<div class="ev-line">'+line+'</div>'+hdr+body+'</div>';
  }
  let renderedSeq=0;
  function logEmpty(){document.getElementById('log').innerHTML='<div class="log-empty">Waiting for traffic…<br>Assign a user in Okta to see the flow.</div>';renderedSeq=0;}
  function updateLog(events){
    const el=document.getElementById('log');
    if(!events.length){if(!el.querySelector('.log-empty'))logEmpty();return;}
    const fresh=events.filter(e=>e.seq>renderedSeq); if(!fresh.length)return;
    if(el.querySelector('.log-empty'))el.innerHTML='';
    fresh.sort((a,b)=>a.seq-b.seq).forEach(e=>el.insertAdjacentHTML('afterbegin',card(e)));
    renderedSeq=events[events.length-1].seq;
  }

  async function poll(){
    try{
      const [u,ev]=await Promise.all([
        fetch('/home/api/users',{cache:'no-store'}).then(r=>r.ok?r.json():null),
        fetch('/home/api/events',{cache:'no-store'}).then(r=>r.ok?r.json():null),
      ]);
      if(u){const s=sig(u);if(s!==lastSig){lastSig=s;renderUsers(u);}}
      if(ev)updateLog(ev.events);
    }catch(e){}
  }
  document.getElementById('clearLog').addEventListener('click',async()=>{try{await fetch('/home/api/events',{method:'DELETE'});}catch(e){}logEmpty();});
  document.getElementById('clearDb').addEventListener('click',async()=>{
    if(!confirm('Delete ALL provisioned users and groups? This cannot be undone.'))return;
    try{const r=await fetch('/home/api/data',{method:'DELETE'});if(r.ok){toast('Database cleared');lastSig=null;seen.clear();poll();}else toast('Clear failed ('+r.status+')');}catch(e){toast('Clear failed');}
  });
  poll(); setInterval(poll,2000);
</script>
</body>
</html>`;
}
//# sourceMappingURL=home.page.js.map