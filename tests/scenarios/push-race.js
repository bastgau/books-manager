// A change made while an upload is in flight must stay "to send" when that upload ends (page-close warning kept, sent next).
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var dirty=function(){return localStorage.getItem(SK+LIBID+".dirty")};
var st=function(){return q("#sync").textContent};
var closeWarns=function(){var e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented};
window.__pending=(async function(){try{
  await sleep(1200);for(var k=0;k<40&&!/synchronisé/.test(st());k++)await sleep(150);
  N.putDelay=2000;
  books[0].titre="Livre 0 modifié";save();                                   // 1st change: upload starts after 2.5 s
  for(var k=0;k<60&&!/envoi…/.test(st());k++)await sleep(100);
  books[1].titre="Livre 1 modifié";save();                                   // 2nd change, during the upload
  for(var k=0;k<60&&!(N.n>=1);k++)await sleep(100);await sleep(50);         // 1st upload just ended
  o["A_juste_après_le_1er_envoi"]={envois_terminés:N.n,dirty:dirty(),statut:st().trim(),alerte_à_la_fermeture:closeWarns(),fichier_du_dépôt_contient_la_2e_modif:/Livre 1 modifié/.test(N.text)};
  await sleep(4000);for(var k=0;k<80&&!(dirty()==="0"&&/synchronisé/.test(st()));k++)await sleep(150);
  o["B_après_le_2e_envoi"]={envois:N.puts.length,dirty:dirty(),statut:st().trim(),fichier_du_dépôt_contient_les_2_modifs:/Livre 0 modifié/.test(N.text)&&/Livre 1 modifié/.test(N.text)};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
