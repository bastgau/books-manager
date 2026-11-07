// Search box: accents and case ignored, punctuation kept; export file name taken from the open library.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
var plain=function(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()};
var search=async function(t){q("#q").value=t;q("#q").dispatchEvent(new Event("input"));await sleep(200);return +q("#info").textContent.split(" / ")[0]};   // the table follows 150 ms after the last key press
var dl=null;window.downloadCsv=function(t,n){dl=n};
window.__pending=(async function(){try{
  await sleep(500);
  var emilie=books.filter(function(b){return /Émilie/.test(b.auteur)}).length;
  o["A_prénom_sans_accent_« emilie »"]={résultats:await search("emilie"),livres_d_Émilie:emilie};
  o["A2_en_majuscules_« EMILIE »"]=await search("EMILIE");
  o["A3_avec_l_accent_« Émilie »"]=await search("Émilie");
  o["B_« resume fictif »"]={résultats:await search("resume fictif"),livres_avec_résumé:books.filter(function(b){return b.resume}).length};
  o["C_apostrophe_conservée_« d'exemple 12 »"]={résultats:await search("d'exemple 12"),attendu:books.filter(function(b){return / 12\d?$/.test(b.titre)}).length};
  o["D_ISBN"]=await search(books[1].isbn);
  o["E_texte_absent"]=await search("zzzz");
  o["F_« undefined » (champ manquant)"]=await (async function(){var b=books[0];delete b.a_garder;save();var n=await search("undefined");b.a_garder="";save();return n})();
  /* field prefixes */
  var count=function(f){return books.filter(f).length};
  o["I_auteur:emilie"]={résultats:await search("auteur:emilie"),attendu:emilie};
  o["I2_titre:emilie_(prénom_absent_des_titres)"]=await search("titre:emilie");
  o["I3_Résumé:FICTIF_(préfixe_avec_accent_et_majuscules)"]={résultats:await search("Résumé:FICTIF"),attendu:books.filter(function(b){return b.resume}).length};
  o["I4_localisation:chalet"]={résultats:await search("localisation:chalet"),attendu:count(function(b){return b.localisation==="Chalet"})};
  o["I5_auteur:emilie_titre:exemple_1_(les_deux)"]={résultats:await search("auteur:emilie titre:exemple 1"),attendu:count(function(b){return /Émilie/.test(b.auteur)&&/exemple 1/.test(b.titre)})};
  var i1=books[1].isbn,dashed=i1.slice(0,3)+"-"+i1.slice(3,4)+"-"+i1.slice(4,9)+"-"+i1.slice(9);
  o["I6_isbn_avec_tirets"]={recherche:"isbn:"+dashed,résultats:await search("isbn:"+dashed)};
  o["I7_auteur:_vide"]={résultats:await search("auteur:"),tous:books.length};
  /* plain text: no longer in the cover URL nor in the two flags */
  var b0=books[0],keep={g:b0.a_garder,c:b0.couverture,v:b0.a_verifier};b0.a_garder="oui";b0.couverture="https://covers.example/a.jpg";b0.a_verifier="1";save();
  o["J_texte_libre_hors_URL_et_indicateurs"]={"oui":await search("oui"),"covers.example":await search("covers.example"),"http://x_(préfixe_inconnu_=_texte)":await search("http://x")};
  b0.a_garder=keep.g;b0.couverture=keep.c;b0.a_verifier=keep.v;save();
  await search("");
  /* typing quickly: one rebuild of the table for the whole word */
  var n=0,mo=new MutationObserver(function(){n++});mo.observe(q("#tbody"),{childList:true});   // one batch per rebuild of the table
  for(var c of ["m","me","mem","memo","memoi","memoir","memoire"]){q("#q").value=c;q("#q").dispatchEvent(new Event("input"));await sleep(60)}
  await sleep(200);mo.disconnect();o["H_7_lettres_tapées_vite_(60_ms_d_écart)"]={reconstructions_du_tableau:n};
  await search("");
  q("#bExport").onclick();o["G_export_sans_bibliothèque"]=dl;
  localStorage.setItem(SK+"lib",LIBID);localStorage.setItem(SK+LIBID+".meta",JSON.stringify({name:"Bibliothèque de Lecture n°2"}));
  q("#bExport").onclick();o["G2_export_bibliothèque_ouverte"]=dl;localStorage.removeItem(SK+"lib");
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
