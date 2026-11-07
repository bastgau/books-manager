var q=function(s){return document.querySelector(s)},qa=function(s){return document.querySelectorAll(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
var G=window.__gh,confirms=[],answer=true;
window.confirm=function(m){confirms.push(m);return answer};
window.prompt=function(){return window.__promptAnswer};
var count=function(v){return books.filter(function(b){return b.localisation===v}).length};
window.__pending=(async function(){try{
  localStorage.setItem(SK+"repo","demo/depot");localStorage.setItem(SK+"token","FAUX");localStorage.setItem(SK+"lib",LIBID);localStorage.setItem(metaKey(LIBID),JSON.stringify(G.meta));
  var avant={sc:count("Chalet"),pm:count("Prêté Léa"),b1:count("Bureau")};
  o["0_livres_par_localisation_avant"]="Chalet="+avant.sc+" Prêté Léa="+avant.pm+" Bureau="+avant.b1;
  /* A. ajouts */
  var r=await addLocation("  Cave   humide ");o["A1_ajout_« Cave humide »"]=r.ok+" → nom enregistré : « "+r.name+" »";
  var m=G.metaPuts[0];o["A1_fichier_d_infos_écrit"]="nom="+m.json.name+" | propriétaire="+m.json.owner+" | description="+m.json.description+" | liste="+m.json.locations.join(", ");
  o["A1_empreinte_envoyée_(sha)"]=m.sha;
  o["A1_liste_triée"]=JSON.stringify(m.json.locations)===JSON.stringify(m.json.locations.slice().sort(function(a,b){return a.localeCompare(b,"fr")}));
  r=await addLocation("etagere 1");o["A2_doublon_(accents/casse)"]=r.ok+" — "+r.msg;
  r=await addLocation("   ");o["A3_vide"]=r.ok+" — "+r.msg;
  r=await addLocation("x".repeat(41));o["A4_trop_long"]=r.ok+" — "+r.msg;
  o["A5_écritures_après_les_refus"]=G.metaPuts.length+" (attendu 1)";
  /* B. une autre personne a ajouté une localisation entre-temps : on ne l'écrase pas */
  G.meta.locations.push("Ajoutée ailleurs");G.metaSha="mX";
  r=await addLocation("Grenier");var last=G.metaPuts[G.metaPuts.length-1];
  o["B_modification_concurrente_conservée"]=(last.json.locations.indexOf("Ajoutée ailleurs")>-1)+" ; empreinte utilisée="+last.sha+" ; liste="+last.json.locations.join(", ");
  /* C. suppression d'une localisation inutilisée */
  var np=G.metaPuts.length,nc=G.csvPuts.length;confirms.length=0;
  r=await removeLocation("Grenier");
  o["C_suppression_inutilisée"]=r.ok+" ; message : "+confirms[0]+" ; livres modifiés=0 ; CSV envoyé="+(G.csvPuts.length>nc);
  /* D. refus de l'utilisateur */
  confirms.length=0;answer=false;np=G.metaPuts.length;
  r=await removeLocation("Prêté Léa");
  o["D_refus_de_la_confirmation"]="écritures="+(G.metaPuts.length-np)+" ; livres Prêté Léa="+count("Prêté Léa")+" ; message affiché : "+confirms[0].replace(/\n/g," ");
  answer=true;
  /* E. échec de l'écriture des infos : aucun livre modifié */
  G.failMeta=true;confirms.length=0;
  r=await removeLocation("Chalet");
  o["E_échec_GitHub_(500)"]=r.ok+" — "+r.msg+" ; livres Chalet restants="+count("Chalet")+" (attendu "+avant.sc+")";
  G.failMeta=false;
  /* F. suppression d'une localisation utilisée : confirmation, infos d'abord, puis livres vidés */
  G.calls.length=0;nc=G.csvPuts.length;confirms.length=0;
  var autres=books.filter(function(b){return b.localisation&&b.localisation!=="Prêté Léa"}).length;
  r=await removeLocation("Prêté Léa");
  o["F_message"]=confirms[0].replace(/\n/g," ");
  o["F_résultat"]=r.ok+" ; livres vidés="+r.used+" ; restants avec « Prêté Léa »="+count("Prêté Léa")+" ; autres localisations intactes="+(books.filter(function(b){return b.localisation}).length===autres);
  o["F_liste_enregistrée_sans_elle"]=(G.meta.locations.indexOf("Prêté Léa")<0)+" ; "+G.meta.locations.join(", ");
  for(var k=0;k<80&&G.csvPuts.length===nc;k++)await sleep(200);
  o["F_ordre_des_écritures"]=G.calls.join(" → ")+" (infos avant le CSV)";
  var csv=G.csvPuts[G.csvPuts.length-1].csv;o["F_CSV_envoyé_sans_la_localisation"]=!/Prêté Léa/.test(csv)+" ; contient encore Chalet="+/Chalet/.test(csv);
  /* G. « Enregistrer les infos » conserve la liste */
  q("#bSync").click();await sleep(100);
  q("#sName").value="Nouveau nom";q("#sOwner").value="Alice B.";q("#sRepo").value="demo/depot";q("#sToken").value="FAUX";q("#sMeta").click();
  for(var z=0;z<50&&G.metaPuts[G.metaPuts.length-1].json.name!=="Nouveau nom";z++)await sleep(100);
  var lm=G.metaPuts[G.metaPuts.length-1].json;o["G_infos_enregistrées"]="nom="+lm.name+" ; propriétaire="+lm.owner+" ; liste conservée="+(lm.locations.length>0)+" ("+lm.locations.length+" localisations)";
  /* H. fenêtre Synchro : liste affichée avec les nombres de livres */
  var rows=[].map.call(qa("#locList .loc"),function(l){return l.querySelector("span").textContent+" ("+l.querySelector("small").textContent+")"});
  o["H_liste_dans_la_fenêtre"]=rows.join(" ; ");
  q("#locNew").value="Salon";q("#locAdd").click();for(var y=0;y<50&&!G.meta.locations.some(function(x){return x==="Salon"});y++)await sleep(100);
  o["H_bouton_Ajouter"]="« Salon » dans la liste distante="+(G.meta.locations.indexOf("Salon")>-1)+" ; champ vidé="+(q("#locNew").value==="")+" ; affichée="+/Salon/.test(q("#locList").textContent);
  var del=q('#locList button[data-loc="Salon"]');del.click();for(var w=0;w<50&&G.meta.locations.indexOf("Salon")>-1;w++)await sleep(100);
  o["H_bouton_Supprimer"]="retirée de la liste distante="+(G.meta.locations.indexOf("Salon")<0)+" ; retirée de l'affichage="+!/Salon/.test(q("#locList").textContent);
  /* I. depuis la fiche : bouton « + » */
  q("#sClose").click();edit(0);window.__promptAnswer="Véranda";q("#locAddForm").click();
  for(var v=0;v<50&&G.meta.locations.indexOf("Véranda")<0;v++)await sleep(100);await sleep(100);
  o["I_bouton_+_de_la_fiche"]="créée="+(G.meta.locations.indexOf("Véranda")>-1)+" ; sélectionnée dans le champ="+(q("#f_localisation").value==="Véranda")+" ; message : "+q("#fMsg").textContent;
  q("#dlg").close();
  /* J. nouvelle bibliothèque : liste vide au départ */
  q("#nName").value="Autre";var nj=JSON.parse(metaJson("n"));o["J_nouvelle_bibliothèque"]="locations="+JSON.stringify(nj.locations);
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
