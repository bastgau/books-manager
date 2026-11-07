var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={};
window.__pending=(async function(){try{
  await sleep(1000);
  appStale=true;renderVer();
  o.lien_dans_le_pied_de_page=q("#verUpd")?q("#verUpd").textContent:"absent";
  var url=null;goTo=function(u){url=u};
  edit(0);q("#f_titre").value="En attente";q("#bSave").click();await sleep(300);
  q("#verUpd").click();await sleep(500);
  o.adresse_demandée=url;o.sans_question_au_départ=window.__noPrompt===true;
  o.données_conservées=JSON.parse(localStorage.getItem("livrotheque.v1."+LIBID))[0].titre;
  url=null;window.__noPrompt=false;setStatus("☁ version périmée : rechargez la page (cliquez ici) — x","#f99");q("#sync").click();await sleep(300);
  o["clic_sur_le_message_version_périmée"]=url;
  
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,400)}})();window.__result=o;
