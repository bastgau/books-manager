// Upload refused (409: the file changed on another device): the conflict dialog must open, and each choice must do what it says.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var asked=[];window.confirm=function(m){asked.push(m.split("\n")[0]);return false};
var st=function(){return q("#sync").textContent.trim()},dirty=function(){return localStorage.getItem(SK+LIBID+".dirty")};
var remote=function(){return parseCsv(new TextEncoder().encode(N.text).buffer).map(function(b){return b.titre})};
var dlg=async function(){for(var k=0;k<60&&!q("#dlgK").open;k++)await sleep(100);return q("#dlgK").open};
var synced=async function(){for(var k=0;k<60&&!(dirty()==="0"&&/synchronisé/.test(st()));k++)await sleep(150)};
var conflictNow=async function(local,elsewhere){__remoteEdit(elsewhere);books[0].titre=local;save();return await dlg()};
window.__pending=(async function(){try{
  await sleep(1200);await synced();
  /* A. cancel: nothing sent, local change kept */
  asked.length=0;var open=await conflictNow("Livre 0 local A",function(l){l[2].titre="Livre 2 changé ailleurs A"});
  var body=q("#kBody").textContent.replace(/\s+/g," ");
  q("#kCancel").click();await sleep(400);
  o["A_annuler"]={fenêtre_de_conflit:open,différences_listées:/Modifiés \(version différente\) \(\d+\)/.test(body),questions_confirm:asked.length?asked:"aucune",dirty:dirty(),modif_locale_gardée:books[0].titre==="Livre 0 local A",statut:st()};
  /* B. keep this device's version: it replaces the repository file */
  asked.length=0;push();var openB=await dlg();q("#kLocal").click();await sleep(300);await synced();
  o["B_garder_ma_version"]={fenêtre_de_conflit:openB,fichier_du_dépôt:remote().slice(0,3).join(" | "),dirty:dirty(),statut:st()};
  /* C. keep the repository version */
  asked.length=0;var openC=await conflictNow("Livre 0 local C",function(l){l[3].titre="Livre 3 changé ailleurs C"});
  q("#kRemote").click();await sleep(400);
  o["C_garder_la_version_du_dépôt"]={fenêtre_de_conflit:openC,livres:books.slice(0,4).map(function(b){return b.titre}).join(" | "),dirty:dirty(),questions_confirm:asked.length?asked:"aucune",statut:st()};
  o["refus_409_reçus"]=N.conflicts||0;
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
