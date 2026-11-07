// Coming back to the tab checks for a newer published version, at most once every 10 minutes, never offline.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
var reads=0,fail=false,f0=window.fetch,MIN=60*1000;
window.fetch=function(u,opt){var s=String(u);
  if(/^version\.json\?t=\d+$/.test(s)){reads++;return fail?Promise.reject(new TypeError("NetworkError")):Promise.resolve(new Response(JSON.stringify({build:new Date(new Date(APP_BUILD).getTime()+MIN).toISOString(),commit:"fed4321abc"}),{status:200}))}
  if(fail&&/commits\?path=index\.html/.test(s))return Promise.reject(new TypeError("NetworkError"));
  return f0(u,opt)};
var back=async function(){reads=0;document.dispatchEvent(new Event("visibilitychange"));await sleep(300);return reads};
var tried=function(v){if(typeof appTriedAt!=="undefined")appTriedAt=v};   // absent from the code before this change
window.__pending=(async function(){try{
  await sleep(1200);
  staleCheckedAt=Date.now()-2*MIN;tried(0);
  o["A_retour_2_min_après_la_dernière_vérification"]={lectures:await back()};
  staleCheckedAt=Date.now()-11*MIN;tried(0);
  o["B_retour_11_min_après"]={lectures:await back(),page_périmée:appStale,alerte:/nouvelle version disponible/.test(q("#verApp").textContent)};
  staleCheckedAt=0;fail=true;tried(0);
  o["C_vérification_en_échec"]={premier_retour:await back(),retour_suivant:await back()};
  fail=false;staleCheckedAt=0;tried(0);localStorage.setItem("livrotheque.offline","1");
  o["D_mode_hors_ligne"]={lectures:await back()};localStorage.removeItem("livrotheque.offline");
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
