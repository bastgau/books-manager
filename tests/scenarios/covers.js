// Repository covers: the folder is listed once (304 when unchanged), and only covers that exist are downloaded.
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var all=async function(){var r=[];for(var i of __isbns)r.push(await repoCover(i));return r.filter(Boolean).length};
var fresh=function(mode){N.mode=mode||"list";N.lists.length=0;N.images.length=0;coverIdx=null;coverCache.clear()};   // a new page load
window.__pending=(async function(){try{
  await sleep(1500);fresh();
  var n=await all();
  o["A_première_ouverture"]={pochettes_trouvées:n,listes_du_dossier:N.lists.length,images_demandées:N.images.length};
  fresh();n=await all();
  o["B_ouverture_suivante_(dossier_inchangé)"]={pochettes_trouvées:n,en_tête_If_None_Match:N.lists[0],images_demandées:N.images.length};
  fresh("none");n=await all();
  o["C_pas_de_dossier_de_pochettes"]={pochettes_trouvées:n,listes_du_dossier:N.lists.length,images_demandées:N.images.length};
  fresh("big");n=await all();
  o["D_dossier_de_1000_fichiers_(limite_de_l_API)"]={pochettes_trouvées:n,images_demandées:N.images.length};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
