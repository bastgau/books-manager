// The version check through version.json shows in the "Requêtes GitHub" log, with its result.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
var ver=null,f0=window.fetch;   // ver: content of version.json (null = absent, 404)
window.fetch=function(u,opt){var s=String(u);
  if(/^version\.json\?t=\d+$/.test(s))return Promise.resolve(ver?new Response(JSON.stringify(ver),{status:200,headers:{"Content-Type":"application/json"}}):new Response("Not Found",{status:404}));
  return f0(u,opt)};
var lines=function(){renderGhLog();return Array.from(q("#gBody").querySelectorAll(".ge")).slice(0,3).map(function(e){var c=e.children;return c[1].textContent.replace(/\s+/g," ").trim()+" → "+c[2].textContent})};
var check=async function(v){ver=v;ghLog=[];staleCheckedAt=0;await appVersion();return lines()};
window.__pending=(async function(){try{
  await sleep(1200);
  o["A_version.json_présent"]=await check({build:APP_BUILD,commit:"abc1234def"});
  o["B_version.json_absent_(secours_par_l_API)"]=await check(null);
  o["C_jamais_l_adresse_dans_le_stockage"]=!/version\.json|\?t=/.test(localStorage.getItem("livrotheque.ghlog")||"");
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
