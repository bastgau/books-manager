var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
window.__pending=(async function(){try{
  await sleep(1500);
  o["1_nuage"]={bouton_contient_un_dessin:!!q("#bSync svg.ic"),bouton_texte:q("#bSync").textContent.trim(),statut_contient_un_dessin:!!q("#sync svg.ic"),statut_texte:q("#sync").textContent.trim(),caractere_nuage_restant:/☁/.test(q("#bSync").textContent+q("#sync").textContent+document.querySelector("header").textContent)};
  var sz=function(e){var r=e.getBoundingClientRect();return Math.round(r.width)+"x"+Math.round(r.height)};
  o["1_taille_du_dessin_(px)"]={bouton:sz(q("#bSync svg.ic")),statut:sz(q("#sync svg.ic"))};
  o["1_statut_d_erreur_garde_son_texte"]=(setStatus("☁ erreur d'envoi (x) — cliquez ici pour réessayer","#f99"),{texte:q("#sync").textContent.trim(),cliquable:q("#sync").style.cursor});
  setStatus("☁ synchronisé");
  q("#verLog").click();await sleep(300);
  var rows=function(){return Array.from(q("#gBody").querySelectorAll(".ge > span:nth-child(2)")).map(function(s){return s.textContent.replace(/\s+/g," ").trim()})};
  o["2_fenêtre_ouverte_au_démarrage"]={ouverte:q("#dlgG").open,lignes:rows()};
  o["2_résultats"]=Array.from(q("#gBody").querySelectorAll(".ge > span:nth-child(3)")).map(function(s){return s.textContent});
  q("#gClose").click();
  /* pochettes : regroupées */
  for(var i=0;i<12;i++)await repoCover("97820703600"+(10+i));
  q("#verLog").click();await sleep(200);
  var r2=rows();var cov=r2.filter(function(t){return /pochettes/.test(t)});
  o["3_12_pochettes"]={lignes_pochettes:cov.length,texte:cov[0],total_lignes:r2.length};
  /* limite de 10 + ordre */
  q("#gClose").click();
  for(var j=0;j<15;j++)ghLogAdd("test "+j,"GET",200,5+j,Date.now()+j*100000);
  q("#verLog").click();await sleep(200);
  var r3=rows();o["4_limite"]={lignes:r3.length,première:r3[0],dernière:r3[r3.length-1]};
  /* secret et persistance */
  var raw=localStorage.getItem("livrotheque.ghlog");
  o["5_stockage"]={contient_le_jeton:/FAUX/.test(raw),contient_une_adresse:/https?:/.test(raw),entrées:JSON.parse(raw).length};
  /* codes de résultat */
  ghLogAdd("test 304","GET",304,10,Date.now());ghLogAdd("test 409","PUT",409,10,Date.now());ghLogAdd("test réseau","PUT",0,2500,Date.now());ghLogAdd("test 401","GET",401,10,Date.now());ghLogAdd("test 500","GET",503,10,Date.now());
  var res=Array.from(q("#gBody").querySelectorAll(".ge > span:nth-child(3)")).slice(0,5).map(function(s){return s.textContent+" ["+s.className+"]"});
  o["6_codes"]=res;
  /* effacer */
  q("#gClear").click();o["7_effacer"]={message:q("#gBody").textContent.trim(),stockage:localStorage.getItem("livrotheque.ghlog")};
  q("#gClose").click();
  /* historique : toujours fonctionnel et journalisé */
  q("#verHist").click();await sleep(800);q("#hClose").click();
  q("#verLog").click();await sleep(200);o["8_après_ouverture_de_l_historique"]=rows();
  o["9_pied_de_page"]={liens:Array.from(document.querySelectorAll(".flinks a")).map(function(a){return a.textContent})};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
