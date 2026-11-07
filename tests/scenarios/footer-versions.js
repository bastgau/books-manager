var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
window.__pending=(async function(){await sleep(1200);
 o.A_hors_ligne_au_démarrage={app:q("#verApp").textContent,base:q("#verDb").textContent,appels_GitHub:N.calls.length};
 edit(0);q("#f_titre").value="M1";q("#bSave").click();await sleep(300);edit(1);q("#f_titre").value="M2";q("#bSave").click();await sleep(300);
 o.B_après_2_modifications={base:q("#verDb").textContent};
 q("#offSw").checked=false;q("#offSw").dispatchEvent(new Event("change"));await sleep(5000);
 o.C_en_ligne={app:q("#verApp").textContent,base:q("#verDb").textContent};
})();window.__result=o;
