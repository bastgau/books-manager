var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var st=function(){return q("#sync").textContent},dirty=function(){return localStorage.getItem(SK+LIBID+".dirty")};
window.__pending=(async function(){try{
  await sleep(1500);
  o["1_au_démarrage_sans_réseau"]={livres_affichés_depuis_la_mémoire_du_navigateur:books.length,tableau_visible:document.querySelectorAll("#tbody tr, tr.grp").length>0,nom_de_la_bibliothèque:q("#bSync").textContent,statut:st().slice(0,110)};
  /* modification sans réseau */
  q("tr.grp[data-l=A]").click();
  edit(0);q("#f_titre").value="Titre modifié hors ligne";q("#f_localisation").value="Cave";q("#f_a_garder").value="oui";q("#bSave").click();
  await sleep(500);
  var cache=JSON.parse(localStorage.getItem("livrotheque.v1."+LIBID));
  o["2_modification_hors_ligne"]={enregistrée_dans_le_navigateur:cache[0].titre+" / "+cache[0].localisation+" / "+cache[0].a_garder,à_envoyer_plus_tard:dirty()==="1",statut:st().slice(0,140)};
  /* 3 : les outils qui demandent Internet */
  q("#verHist").click();await sleep(800);var h=q("#hDb").textContent;q("#hClose").click();
  o["3_historique_des_modifications_hors_ligne"]=h.slice(0,80);
  /* 4 : retour du réseau */
  var avant=N.puts;N.up=true;window.dispatchEvent(new Event("online"));
  for(var k=0;k<60&&N.puts===avant;k++)await sleep(250);
  for(var z=0;z<20&&!/synchronisé/.test(st());z++)await sleep(250);
  o["4_retour_du_réseau"]={envois_au_dépôt:N.puts-avant,statut:st(),modifications_restantes:dirty()};
  /* 5 : plusieurs modifications hors ligne, puis un seul envoi */
  N.up=false;N.puts=0;edit(1);q("#f_titre").value="B";q("#bSave").click();await sleep(300);edit(2);q("#f_titre").value="C";q("#bSave").click();await sleep(300);
  var c2=JSON.parse(localStorage.getItem("livrotheque.v1."+LIBID));
  o["5_deux_modifications_de_plus"]={gardées:c2[1].titre+" et "+c2[2].titre,à_envoyer:dirty()==="1"};
  N.puts=0;N.up=true;window.dispatchEvent(new Event("online"));for(var y=0;y<60&&N.puts===0;y++)await sleep(250);
  o["5_après_retour_du_réseau"]="envois="+N.puts+" (toutes les modifications partent dans un seul fichier)";
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,400)}})();
window.__result=o;
