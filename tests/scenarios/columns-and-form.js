var q=function(s){return document.querySelector(s)},qa=function(s){return document.querySelectorAll(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
window.__pending=(async function(){try{
  var cfgOn=function(){localStorage.setItem(SK+"repo","demo/depot");localStorage.setItem(SK+"token","FAUX");localStorage.setItem(SK+"lib",LIBID);localStorage.setItem(metaKey(LIBID),JSON.stringify(__gh.meta))};
  /* 1. tableau */
  var th=[].map.call(qa("#thead th"),function(t){return t.textContent.trim()}).filter(Boolean);
  o["1_colonnes_du_tableau"]=th.join(" | ");
  o["1_acheté_le_absent"]=th.indexOf("Acheté le")<0;
  o["1_à_garder_après_localisation"]=th.indexOf("À garder")===th.indexOf("Localisation")+1;
  books[0].a_garder="oui";books[1].a_garder="non";books[2].a_garder="";
  q("a.foldlink[data-a=open]").click();
  var cells=[].map.call(qa("#tbody tr[data-i] td.keep-oui, #tbody tr[data-i] td.keep-non"),function(c){return c.textContent});
  o["1_badges"]="oui="+cells.filter(function(c){return /Oui/.test(c)}).length+" non="+cells.filter(function(c){return /Non/.test(c)}).length;
  /* 2. tri par « À garder » : les « non » avant les « oui », les vides en premier */
  [].find.call(qa("#thead th"),function(t){return t.dataset.k==="a_garder"}).click();
  var vals=[].map.call(qa("#tbody tr[data-i]"),function(r){return books[+r.dataset.i].a_garder});
  var ordre=vals.every(function(v,i){return i===0||vals[i-1]<=v});
  o["2_tri_par_À_garder_croissant"]=ordre+" (premier vide="+(vals[0]==="")+", dernier="+vals[vals.length-1]+")";
  /* 3. formulaire */
  cfgOn();
  var iSC=books.findIndex(function(b){return b.localisation==="Chalet"});
  edit(iSC);
  var sel=q("#f_localisation");
  o["3_champ_localisation"]=sel.tagName+" ; options : "+[].map.call(sel.options,function(x){return x.textContent}).join(" / ");
  o["3_valeur_actuelle_sélectionnée"]=sel.value;
  o["3_champ_acheté_le_absent"]=!q("#f_date_achat");
  o["3_champ_à_garder"]=q("#f_a_garder").tagName+" ; options : "+[].map.call(q("#f_a_garder").options,function(x){return x.textContent}).join(" / ");
  q("#dlg").close();
  /* valeur hors liste conservée */
  var iX=books.findIndex(function(b){return !b.localisation});books[iX].localisation="Cave";edit(iX);
  o["3_hors_liste"]=[].map.call(q("#f_localisation").options,function(x){return x.textContent}).slice(-1)[0]+" ; sélectionnée="+q("#f_localisation").value;
  q("#bSave").click();
  o["3_hors_liste_conservée_après_enregistrement"]=books[iX].localisation;
  /* 4. enregistrement : rien choisi / choisi */
  edit(iX);q("#f_localisation").value="Étagère 1";q("#f_a_garder").value="oui";q("#bSave").click();
  o["4_après_choix_dans_la_liste"]=books[iX].localisation+" / à garder="+books[iX].a_garder;
  edit(iX);q("#f_localisation").value="";q("#f_a_garder").value="";q("#bSave").click();
  o["4_après_« aucune »"]="localisation=« "+books[iX].localisation+" » à garder=« "+books[iX].a_garder+" »";
  /* 5. export CSV */
  var csv=toCsv(),lines=csv.replace(/^﻿/,"").split("\r\n"),hdr=lines[0].split("\t").map(function(x){return x.replace(/"/g,"")});
  o["5_en_tête_du_CSV"]=hdr.join(", ");
  o["5_sans_date_achat"]=hdr.indexOf("date_achat")<0;
  o["5_colonnes_par_ligne_identiques"]=lines.slice(1).every(function(l){return l.split("\t").length===hdr.length});
  o["5_lignes"]=lines.length-1;
  var rt=parseCsv(new TextEncoder().encode(csv));o["5_aller_retour_identique"]=JSON.stringify(rt)===JSON.stringify(books);
  /* 6. import d'un ancien CSV (avec date_achat) */
  var old='﻿"auteur"\t"titre"\t"date_lecture"\t"nb_pages"\t"localisation"\t"resume"\t"isbn"\t"date_achat"\t"date_entree"\t"couverture"\t"a_verifier"\r\n"ZOLA Émile"\t"Germinal"\t""\t""\t"Chalet"\t""\t""\t"03/10/2019"\t"04/10/2019"\t""\t""\r\n';
  var imp=parseCsv(new TextEncoder().encode(old))[0];
  o["6_ancien_CSV_importé"]="titre="+imp.titre+" localisation="+imp.localisation+" entrée="+imp.date_entree+" date_achat="+(imp.date_achat===undefined?"ignorée":imp.date_achat)+" à_garder=« "+imp.a_garder+" »";
  /* 7. fiche en lecture */
  books[0].a_garder="non";view(0);
  o["7_fiche"]="« Acheté » absent="+!/Acheté/.test(q("#vBody").textContent)+" ; « À garder » présent="+/À garder\s*Non/.test(q("#vBody").textContent.replace(/\s+/g," ").replace("À garder Non","À garder Non"));
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
