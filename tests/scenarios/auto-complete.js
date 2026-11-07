// "Compléter via ISBN" on 30 books: lookups 3 at a time, every book completed, a single upload at the end.
var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
window.confirm=function(){return true};window.alert=function(){};
var inFlight=0,maxInFlight=0,f0=window.fetch;
window.fetch=function(u,opt){var s=String(u),m=/openlibrary\.org\/api\/books\?bibkeys=ISBN:(\d+)/.exec(s);
  if(m){inFlight++;maxInFlight=Math.max(maxInFlight,inFlight);var isbn=m[1],d={};d["ISBN:"+isbn]={title:"Titre "+isbn,number_of_pages:123};
    return new Promise(function(r){setTimeout(function(){inFlight--;r(new Response(JSON.stringify(d),{status:200}))},300)})}
  var j=/openlibrary\.org\/isbn\/(\d+)\.json/.exec(s);
  if(j)return new Promise(function(r){setTimeout(function(){r(new Response(JSON.stringify({description:"Résumé "+j[1]}),{status:200}))},300)});
  if(/sudoc\.fr/.test(s))return Promise.resolve(new Response("",{status:404}));
  return f0(u,opt)};
window.__pending=(async function(){try{
  await sleep(1200);for(var k=0;k<40&&!/synchronisé/.test(q("#sync").textContent);k++)await sleep(150);
  while(books.length<30)books.push({auteur:"AUTEUR "+books.length,titre:"Livre "+books.length,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:"",id:createBookId()});
  books.forEach(function(b,i){b.isbn=String(9782070000000+i)});
  var puts0=N.puts.length,t0=Date.now();
  await q("#bAuto").onclick();
  var ms=Date.now()-t0;await sleep(4000);
  o["A_30_livres_à_compléter"]={livres_complétés:books.filter(function(b){return b.nb_pages==="123"&&/^Résumé/.test(b.resume)}).length,requêtes_simultanées_max:maxInFlight,durée_s:Math.round(ms/100)/10,envois_au_dépôt:N.puts.length-puts0,message:q("#prog").textContent};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
