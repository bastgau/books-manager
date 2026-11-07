var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var st=function(){return q("#sync").textContent},dirty=function(){return localStorage.getItem(SK+LIBID+".dirty")},pend=function(){return localStorage.getItem(SK+LIBID+".pend")};
var toggle=async function(on){q("#offSw").checked=on;q("#offSw").dispatchEvent(new Event("change"));await sleep(300)};
var editTitle=function(i,t){edit(i);q("#f_titre").value=t;q("#bSave").click()};
var waitDlg=async function(){for(var k=0;k<40&&!q("#dlgK").open;k++)await sleep(100)};
var waitPut=async function(n){for(var k=0;k<40&&N.puts.length<n;k++)await sleep(250)};
window.downloadCsv=function(t,n){window.__dl={n:n,lignes:t.split(/\r?\n/).filter(Boolean).length-1}};
window.__pending=(async function(){try{
  await sleep(1200);
  o["0_état_initial"]={interrupteur_coché:q("#offSw").checked,libellé:q("#offTxt").textContent,à_droite_du_titre:q("header h1").nextElementSibling.id==="offLab"};
  /* A. passage hors ligne puis modifications */
  N.calls.length=0;await toggle(true);
  o["A1_hors_ligne"]={interrupteur:q("#offSw").checked,libellé:q("#offTxt").textContent,classe_on:q("#offLab").classList.contains("on"),statut:st(),mémorisé:localStorage.getItem("livrotheque.offline")};
  editTitle(0,"Modif hors ligne 1");await sleep(3200);editTitle(1,"Modif hors ligne 2");await sleep(3200);
  document.dispatchEvent(new Event("visibilitychange"));await sleep(300);
  q("#verHist").click();await sleep(500);var hh=q("#hDb").textContent;q("#hClose").click();
  o["A2_après_2_modifications"]={statut:st(),en_attente:pend(),à_envoyer:dirty()==="1",appels_GitHub_depuis_le_passage_hors_ligne:N.calls.length,envois:N.puts.length,historique:hh.slice(0,70),tableau_gardé:JSON.parse(localStorage.getItem("livrotheque.v1."+LIBID))[0].titre,pied_de_page_base:q("#verDb").textContent.slice(0,40)};
  /* B. retour en ligne, dépôt inchangé : un seul envoi */
  N.calls.length=0;await toggle(false);await waitPut(1);for(var z=0;z<20&&!/synchronisé/.test(st());z++)await sleep(250);
  var sent=N.puts[0]&&new TextDecoder().decode(Uint8Array.from(atob(N.puts[0].content),function(c){return c.charCodeAt(0)}));
  o["B_retour_en_ligne_dépôt_inchangé"]={envois:N.puts.length,contient_les_2_modifs:!!sent&&/Modif hors ligne 1/.test(sent)&&/Modif hors ligne 2/.test(sent),statut:st(),en_attente:pend(),interrupteur:q("#offSw").checked,boîte_de_conflit:q("#dlgK").open};
  /* C. dépôt modifié ailleurs pendant le hors ligne */
  N.puts.length=0;await toggle(true);editTitle(2,"Modif locale C");await sleep(300);N.mode="changed";
  await toggle(false);await sleep(500);
  var body=q("#kBody").textContent;
  o["C1_conflit_détecté"]={boîte_ouverte:q("#dlgK").open,résumé:body.replace(/\s+/g," ").slice(0,330)};
  q("#kDl").click();o["C2_téléchargement_de_ma_version"]=window.__dl?window.__dl.n+" ("+window.__dl.lignes+" livres)":"aucun";
  q("#kCancel").click();await sleep(400);
  o["C3_annuler"]={interrupteur_reste_hors_ligne:q("#offSw").checked,modifs_gardées:dirty()==="1",envois:N.puts.length,statut:st()};
  await toggle(false);await waitDlg();q("#kLocal").click();await waitPut(1);
  o["C4_garder_ma_version"]={envois:N.puts.length,envoi_contient_ma_modif:N.puts[0]&&new TextDecoder().decode(Uint8Array.from(atob(N.puts[0].content),function(c){return c.charCodeAt(0)})).indexOf("Modif locale C")>-1,sha_envoyé_basé_sur:N.puts[0]&&N.puts[0].sha};
  await sleep(300);
  N.puts.length=0;await toggle(true);editTitle(3,"Modif locale D");await sleep(300);N.mode="changed";localStorage.setItem(SK+LIBID+".sha","s0");
  await toggle(false);await waitDlg();q("#kRemote").click();await sleep(600);
  o["C5_garder_le_dépôt"]={envois:N.puts.length,livres:books.length,titre_du_dépôt_présent:books.some(function(b){return b.titre==="Ajouté ailleurs"}),ma_modif_perdue:!books.some(function(b){return b.titre==="Modif locale D"}),dirty:dirty(),statut:st()};
  /* D. suggestion */
  N.mode="same";localStorage.removeItem("livrotheque.offline.snooze");
  window.dispatchEvent(new Event("offline"));await sleep(200);
  o["D1_réseau_perdu"]={suggestion_visible:q("#offHint").style.display==="flex",texte:q("#offWhy").textContent};
  q("#offLater").click();window.dispatchEvent(new Event("offline"));await sleep(200);
  o["D2_plus_tard"]={masquée:q("#offHint").style.display==="none",pas_de_nouvelle_suggestion_pendant_1h:q("#offHint").style.display==="none",repos_jusqu:!!localStorage.getItem("livrotheque.offline.snooze")};
  localStorage.removeItem("livrotheque.offline.snooze");
  Object.defineProperty(navigator,"connection",{value:{saveData:false,effectiveType:"2g",downlink:0.1,addEventListener:function(){}},configurable:true});connCheck();
  o["D3_connexion_2G"]={visible:q("#offHint").style.display==="flex",texte:q("#offWhy").textContent};
  q("#offGo").click();await sleep(300);
  o["D4_clic_Passer_hors_ligne"]={hors_ligne:q("#offSw").checked,suggestion_masquée:q("#offHint").style.display==="none"};
  await toggle(false);await sleep(300);
  Object.defineProperty(navigator,"connection",{value:{saveData:true,addEventListener:function(){}},configurable:true});localStorage.removeItem("livrotheque.offline.snooze");connCheck();
  o["D5_économiseur_de_données"]=q("#offWhy").textContent;hideOffHint();
  Object.defineProperty(navigator,"connection",{value:{effectiveType:"4g",downlink:10,saveData:false,addEventListener:function(){}},configurable:true});connCheck();
  o["D6_bonne_connexion"]={aucune_suggestion:q("#offHint").style.display==="none"};
  N.delay=8600;await pull();N.delay=0;
  o["D7_GitHub_lent_(8,6_s)"]={visible:q("#offHint").style.display==="flex",texte:q("#offWhy").textContent};hideOffHint();localStorage.removeItem("livrotheque.offline.snooze");
  N.failPut=2;editTitle(0,"Echec réseau");await sleep(3000);await sleep(20000);
  o["D8_envois_qui_échouent"]={visible:q("#offHint").style.display==="flex",texte:q("#offWhy").textContent,statut:st().slice(0,80)};
  /* E. appareil sans bibliothèque */
  hideOffHint();N.failPut=0;
  localStorage.removeItem(SK+"lib");books=[];render();
  await toggle(true);var e1=st();await toggle(false);
  o["E_sans_bibliothèque"]={pas_d_erreur:!/erreur/.test(st()),statut_hors_ligne:e1,interrupteur:q("#offSw").checked};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
