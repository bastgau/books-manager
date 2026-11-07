// Search box: accents and case ignored, punctuation kept; export file name taken from the open library.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
var plain=function(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()};
var search=function(t){q("#q").value=t;q("#q").dispatchEvent(new Event("input"));return +q("#info").textContent.split(" / ")[0]};
var dl=null;window.downloadCsv=function(t,n){dl=n};
window.__pending=(async function(){try{
  await sleep(500);
  var emilie=books.filter(function(b){return /Émilie/.test(b.auteur)}).length;
  o["A_prénom_sans_accent_« emilie »"]={résultats:search("emilie"),livres_d_Émilie:emilie};
  o["A2_en_majuscules_« EMILIE »"]=search("EMILIE");
  o["A3_avec_l_accent_« Émilie »"]=search("Émilie");
  o["B_« resume fictif »"]={résultats:search("resume fictif"),livres_avec_résumé:books.filter(function(b){return b.resume}).length};
  o["C_apostrophe_conservée_« d'exemple 12 »"]={résultats:search("d'exemple 12"),attendu:books.filter(function(b){return / 12\d?$/.test(b.titre)}).length};
  o["D_ISBN"]=search(books[1].isbn);
  o["E_texte_absent"]=search("zzzz");
  o["F_« undefined » (champ manquant)"]=(function(){var b=books[0];delete b.a_garder;save();var n=search("undefined");b.a_garder="";save();return n})();
  search("");
  q("#bExport").onclick();o["G_export_sans_bibliothèque"]=dl;
  localStorage.setItem(SK+"lib",LIBID);localStorage.setItem(SK+LIBID+".meta",JSON.stringify({name:"Bibliothèque de Lecture n°2"}));
  q("#bExport").onclick();o["G2_export_bibliothèque_ouverte"]=dl;localStorage.removeItem(SK+"lib");
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
