// File above 1 MB on a new device: the books must be read through the blob, and a failed read must never look like an empty library.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var ans=[],asked=[];window.confirm=function(m){asked.push(m.split("\n")[0]);return ans.length?ans.shift():false};
var st=function(){return q("#sync").textContent.trim()};
window.__pending=(async function(){try{
  await sleep(1200);for(var k=0;k<40&&!/synchronisé|erreur/.test(st());k++)await sleep(150);
  o["A_poste_neuf_fichier_de_plus_de_1_Mo"]={livres:books.length,statut:st(),type_demandé:N.accepts[0],lectures_du_blob:N.blobCalls,type_du_blob:N.blobAccept||"–"};
  /* B. same new device, blob read fails, then the user adds a book */
  N.blobFail=true;localStorage.removeItem(ck());localStorage.removeItem(SK+LIBID+".sha");localStorage.removeItem(SK+LIBID+".count");localStorage.removeItem(SK+LIBID+".etag");books=[];render();
  await pull();
  o["B_lecture_du_blob_en_échec"]={livres:books.length,statut:st(),sha_enregistré:localStorage.getItem(SK+LIBID+".sha")||"aucun"};
  N.puts.length=0;asked.length=0;edit(null);q("#f_auteur").value="NOUVEAU Livre";q("#f_titre").value="Premier ajout";q("#bSave").click();await sleep(4000);
  o["B2_ajout_d_un_livre_ensuite"]={envois:N.puts.length,sha_envoyé:N.puts.length?N.puts[0].sha||"aucun":"–",question:asked[0]||"aucune",statut:st()};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
