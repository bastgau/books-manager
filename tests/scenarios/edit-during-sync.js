// A book is open in a dialog while a sync from another device reorders the list: Save / Delete / "vérifié" must act on that same book.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var ans=[],asked=[];window.confirm=function(m){asked.push(m.split("\n")[0]);return ans.length?ans.shift():true};
var idx=function(t){return books.findIndex(function(b){return b.titre===t})};
var titles=function(){return books.map(function(b){return b.titre}).join(" | ")};
var remoteTitles=function(){return parseCsv(new TextEncoder().encode(N.text).buffer).map(function(b){return b.titre+" ["+b.id.slice(-2)+"]"}).join(" | ")};
var synced=async function(){for(var k=0;k<60&&!(localStorage.getItem(SK+LIBID+".dirty")!=="1"&&/synchronisé/.test(q("#sync").textContent));k++)await sleep(150)};
// the other device changes the file, then the user comes back to the tab (visibilitychange -> pull)
var syncFromElsewhere=async function(f){var n=books.length;__remoteEdit(f);document.dispatchEvent(new Event("visibilitychange"));for(var k=0;k<40&&books.length===n&&!/conflit/.test(q("#sync").textContent);k++)await sleep(100);await sleep(300)};
var del=function(t){return function(l){var i=l.findIndex(function(b){return b.titre===t});if(i>=0)l.splice(i,1)}};
window.__pending=(async function(){try{
  await sleep(1200);await synced();
  /* A. edit "Livre 1", "Livre 0" deleted elsewhere meanwhile, save */
  edit(idx("Livre 1"));await syncFromElsewhere(del("Livre 0"));
  q("#f_titre").value="Livre 1 corrigé";q("#bSave").click();await sleep(200);await synced();
  o["A_enregistrer_après_une_synchro"]={livres:titles(),fichier_envoyé:remoteTitles(),livre_2_conservé:idx("Livre 2")>=0};
  /* B. delete "Livre 3", "Livre 2" deleted elsewhere meanwhile */
  edit(idx("Livre 3"));await syncFromElsewhere(del("Livre 2"));
  q("#bDel").click();await sleep(200);await synced();
  o["B_supprimer_après_une_synchro"]={livres:titles(),livre_3_supprimé:idx("Livre 3")<0,livre_4_conservé:idx("Livre 4")>=0};
  /* C. "vérifié" on "Livre 5", "Livre 4" deleted elsewhere meanwhile */
  view(idx("Livre 5"));await syncFromElsewhere(del("Livre 4"));
  q("#vOk").click();await sleep(200);await synced();
  o["C_marquer_vérifié_après_une_synchro"]={livre_5_vérifié:!books[idx("Livre 5")].a_verifier,autres_inchangés:books.filter(function(b){return b.titre!=="Livre 5"}).every(function(b){return !b.a_verifier})};
  /* D. the edited book is deleted elsewhere: question, then nothing saved when refused */
  asked.length=0;ans=[false];edit(idx("Livre 5"));await syncFromElsewhere(del("Livre 5"));
  q("#f_titre").value="Livre 5 corrigé";q("#bSave").click();await sleep(200);await synced();
  o["D_livre_supprimé_ailleurs_(refus)"]={question:asked[0]||"aucune",livres:titles()};
  /* E. the edited book is changed elsewhere: question, remote version kept when refused */
  asked.length=0;ans=[false];edit(idx("Livre 1 corrigé"));await syncFromElsewhere(function(l){l[0].titre="Livre 1 renommé ailleurs"});
  q("#f_titre").value="Livre 1 local";q("#bSave").click();await sleep(200);await synced();
  o["E_livre_modifié_ailleurs_(refus)"]={question:asked[0]||"aucune",livres:titles()};
  /* E2. same, accepted: local version replaces the remote one */
  asked.length=0;ans=[true];edit(idx("Livre 1 renommé ailleurs"));await syncFromElsewhere(function(l){l[0].auteur="AUTEUR CHANGÉ AILLEURS"});
  q("#f_titre").value="Livre 1 local";q("#bSave").click();await sleep(200);await synced();
  o["E2_livre_modifié_ailleurs_(accepté)"]={question:asked[0]||"aucune",livres:titles(),fichier_envoyé:remoteTitles()};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
