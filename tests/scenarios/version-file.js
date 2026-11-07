// Published version read from version.json (same site) instead of the GitHub API; the API stays as a fallback.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var ver=null,api=0,f0=window.fetch;   // ver: content of version.json (null = absent, 404)
window.fetch=function(u,opt){var s=String(u);
  if(/^version\.json\?t=\d+$/.test(s))return Promise.resolve(ver?new Response(JSON.stringify(ver),{status:200,headers:{"Content-Type":"application/json"}}):new Response("Not Found",{status:404}));
  if(/commits\?path=index\.html/.test(s))api++;return f0(u,opt)};
var check=async function(v){ver=v;api=0;staleCheckedAt=0;appStale=false;appInfo="";appCheck="";await appVersion();return {page_périmée:appStale,pied_de_page:q("#verApp").textContent,appels_API_GitHub:api}};
var later=function(ms){return new Date(new Date(APP_BUILD).getTime()+ms).toISOString().replace(/\.\d+Z$/,"Z")};
window.__pending=(async function(){try{
  await sleep(1200);
  o["A_version.json_identique_à_la_page"]=await check({build:APP_BUILD,commit:"abc1234def"});
  o["B_version.json_plus_récent_d_1_min"]=await check({build:later(60000),commit:"fed4321abc"});
  books[0].titre="Modifié";save();await sleep(3500);
  o["B2_envoi_bloqué"]={envois:N.puts.length,statut:q("#sync").textContent.trim().slice(0,40)};
  o["C_pas_de_version.json_(publication_depuis_la_branche)"]=await check(null);
  /* neither version.json nor the API answers: the footer says so instead of showing an old value */
  localStorage.setItem("livrotheque.appinfo","01/01/2026 12:00 (0ld0000)");var f1=window.fetch;
  window.fetch=function(u,opt){var s=String(u);if(/version\.json|commits\?path=index\.html/.test(s))return Promise.reject(new TypeError("NetworkError"));return f1(u,opt)};
  ver=null;staleCheckedAt=0;appStale=false;appInfo="";appCheck="";await appVersion();window.fetch=f1;
  o["D_aucune_réponse"]={pied_de_page:q("#verApp").textContent,ancienne_valeur_affichée:/0ld0000/.test(q("#verApp").textContent)};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
