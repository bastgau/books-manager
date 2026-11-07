var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var st=function(){return q("#sync").textContent},lastGet=function(){return N.gets[N.gets.length-1]||{}};
var K=function(s){return SK+LIBID+"."+s};
window.__pending=(async function(){try{
  await sleep(1500);
  o["A_première_lecture_(aucun_ETag_mémorisé)"]={requêtes_conditionnelles:N.gets.filter(function(g){return g.inm}).length,lectures_complètes:N.fullBodies,etag_mémorisé:JSON.parse(localStorage.getItem(K("etag"))||"null")&&JSON.parse(localStorage.getItem(K("etag"))).e,livres:books.length,statut:st()};
  var ref=books;N.gets.length=0;N.fullBodies=0;N.notModified=0;
  await pull();
  o["B_deuxième_lecture_(fichier_inchangé)"]={en_tête_If_None_Match:lastGet().inm,cache_navigateur:lastGet().cache,lectures_complètes:N.fullBodies,réponses_304:N.notModified,liste_intacte:books===ref,statut:st(),paramètre_anti_cache_t:/[&?]t=/.test(lastGet().url||"")};
  document.dispatchEvent(new Event("visibilitychange"));await sleep(500);
  o["C_retour_sur_l_onglet"]={réponses_304:N.notModified,lectures_complètes:N.fullBodies};
  N.mode="changed";N.fullBodies=0;N.notModified=0;await pull();
  o["D_fichier_modifié_ailleurs"]={lectures_complètes:N.fullBodies,livres:books.length,titre_nouveau_présent:books.some(function(b){return b.titre==="Ajouté ailleurs"}),etag_mémorisé:JSON.parse(localStorage.getItem(K("etag"))).e};
  N.fullBodies=0;N.notModified=0;await pull();
  o["D2_puis_inchangé"]={réponses_304:N.notModified,lectures_complètes:N.fullBodies};
  /* E. modification locale puis lecture inchangée : rien à télécharger, l'envoi part */
  edit(0);q("#f_titre").value="Modif locale";q("#bSave").click();await sleep(300);
  N.puts.length=0;N.fullBodies=0;N.notModified=0;await pull();
  for(var k=0;k<30&&!N.puts.length;k++)await sleep(250);
  o["E_modifs_locales_+_fichier_inchangé"]={lectures_complètes:N.fullBodies,réponses_304:N.notModified,envois:N.puts.length,etag_effacé_après_envoi:localStorage.getItem(K("etag"))===null,statut:st()};
  /* F. après mon propre envoi : lecture complète (l'ETag a été effacé) */
  N.gets.length=0;N.fullBodies=0;N.notModified=0;N.mode="same";
  await pull();
  o["F_lecture_après_mon_envoi"]={en_tête_If_None_Match:lastGet().inm,lectures_complètes:N.fullBodies};
  /* G. format de fichier différent : pas de requête conditionnelle */
  localStorage.setItem(K("etag"),JSON.stringify({e:"W/\"e1\"",s:"ancien,format"}));N.gets.length=0;N.fullBodies=0;
  await pull();
  o["G_ancien_format_de_l_ETag_mémorisé"]={en_tête_If_None_Match:lastGet().inm,lectures_complètes:N.fullBodies};
  /* H. copie locale absente : pas de requête conditionnelle */
  localStorage.removeItem(ck());N.gets.length=0;N.fullBodies=0;
  await pull();
  o["H_copie_locale_effacée"]={en_tête_If_None_Match:lastGet().inm,lectures_complètes:N.fullBodies,livres:books.length};
  /* I. hors ligne : aucune lecture */
  setOffline(true);await sleep(200);N.gets.length=0;await pull();
  o["I_mode_hors_ligne"]={lectures:N.gets.length};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
