var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},G=window.__gh;
var st=function(){return q("#sync").textContent},dirty=function(){return localStorage.getItem(SK+LIBID+".dirty")};
window.__pending=(async function(){try{
  document.documentElement.setAttribute("data-build",APP_BUILD);
  localStorage.setItem(SK+"repo","demo/depot");localStorage.setItem(SK+"token","FAUX");localStorage.setItem(SK+"lib",LIBID);
  var edit1=function(t){books=[{auteur:"TEST",titre:t,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:""}];save()};
  var wait=async function(re,max){for(var k=0;k<(max||60)&&!re.test(st());k++)await sleep(250);return st()};
  var reset=function(mode){G.appMode=mode;staleCheckedAt=0;appStale=false;G.csvPuts=0;G.csvBodies=[];G.appChecks=0;localStorage.setItem(SK+LIBID+".dirty","0")};

  /* A. page périmée de 3 h : envoi refusé, modifications gardées */
  reset("stale");edit1("Modification A");
  await wait(/version périmée|synchronisé/);
  o["A_page_périmée"]={statut:st().slice(0,150),envois_au_dépôt:G.csvPuts,modifications_gardées:dirty()==="1",texte_cliquable:q("#sync").style.cursor==="pointer"};
  o["A_alerte_du_pied_de_page"]=/nouvelle version disponible/.test(q("#verApp").textContent);

  /* B. plusieurs enregistrements de suite : la version publiée n'est pas redemandée à chaque fois */
  G.appChecks=0;edit1("Modification B1");await sleep(3200);edit1("Modification B2");await sleep(3200);edit1("Modification B3");await sleep(3200);
  o["B_3_enregistrements_de_suite"]={interrogations_de_GitHub_pour_la_version:G.appChecks,envois_au_dépôt:G.csvPuts};

  /* C. page à jour : envoi normal */
  reset("fresh");edit1("Modification C");await wait(/synchronisé|version périmée/);
  o["C_page_à_jour"]={statut:st(),envois_au_dépôt:G.csvPuts,modifications_restantes:dirty()};

  /* D. GitHub injoignable pour la version : on n'empêche pas l'enregistrement */
  reset("offline");edit1("Modification D");await wait(/synchronisé|version périmée|erreur/);
  o["D_version_publiée_injoignable"]={statut:st(),envois_au_dépôt:G.csvPuts};

  /* E. limite de requêtes de GitHub (403) : idem */
  reset("ratelimit");edit1("Modification E");await wait(/synchronisé|version périmée|erreur/);
  o["E_limite_de_requêtes_403"]={statut:st(),envois_au_dépôt:G.csvPuts};

  /* F. page périmée puis rechargement (nouvelle page à jour) : les modifications gardées partent */
  reset("stale");edit1("Modification F");await wait(/version périmée/);
  var avant=G.csvPuts;G.appMode="fresh";staleCheckedAt=0;appStale=false;      // = après rechargement, la page est à jour
  scheduleSync();await wait(/synchronisé/);
  o["F_après_rechargement"]={envoi_avant:avant,envoi_après:G.csvPuts,statut:st(),contenu_envoyé:G.csvBodies.length?new TextDecoder().decode(Uint8Array.from(atob(G.csvBodies[G.csvBodies.length-1].content),function(c){return c.charCodeAt(0)})).indexOf("Modification F")>-1:"rien"};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
