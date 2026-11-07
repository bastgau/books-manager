(function(){
// Library synced, 5 books with an ISBN; the repository covers folder holds 2 of them. net.mode: "list" (default), "none" (no folder), "big" (1 000 files).
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
var COLSN=["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_entree","couverture","a_verifier","a_garder","id"];
window.__isbns=["9782070360024","9782253004226","9782070368228","9782070411979","9782253006329"];
var rows=__isbns.map(function(isbn,i){return {auteur:"AUTEUR "+i,titre:"Livre "+i,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:isbn,date_entree:"",couverture:"",a_verifier:"",a_garder:"",id:"0190a1b2-c3d4-7e5f-8a9b-"+String(i).padStart(12,"0")}});
function csv(l){return "﻿"+['"'+COLSN.join('"\t"')+'"'].concat(l.map(function(b){return COLSN.map(function(k){return '"'+(b[k]||"")+'"'}).join("\t")})).join("\r\n")+"\r\n"}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
localStorage.setItem("livrotheque.v1."+LIBID,JSON.stringify(rows));
var S="livrotheque.sync.";localStorage.setItem(S+"repo","demo/depot");localStorage.setItem(S+"token","FAUX");localStorage.setItem(S+"lib",LIBID);localStorage.setItem(S+LIBID+".sha","s0");localStorage.setItem(S+LIBID+".dirty","0");
var net=window.__net={mode:"list",lists:[],images:[]};
var have=[__isbns[0],__isbns[2]];
function J(b,s,h){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:Object.assign({"Content-Type":"application/json"},h||{})}))}
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET",h=(o&&o.headers)||{};
 if(/-covers\?ref=/.test(u)){net.lists.push(h["If-None-Match"]||null);
  if(net.mode==="none")return J({message:"Not Found"},404);
  if(net.mode==="big"){var e=[];for(var i=0;i<1000;i++)e.push({type:"file",name:"x"+i+".jpg"});return J({type:"dir",entries:e},200,{ETag:'"big"'})}
  if(h["If-None-Match"]==='"d1"')return Promise.resolve(new Response(null,{status:304,headers:{ETag:'"d1"'}}));
  return J({type:"dir",entries:have.map(function(i){return {type:"file",name:i+".jpg"}}).concat([{type:"dir",name:"old"}])},200,{ETag:'"d1"'})}
 var cm=/-covers\/(\d+)\.jpg/.exec(u);
 if(cm){net.images.push(cm[1]);return Promise.resolve(have.indexOf(cm[1])>=0?new Response(new Blob([new Uint8Array([255,216,255])],{type:"image/jpeg"}),{status:200}):new Response("{}",{status:404}))}
 if(/contents\/.*-database\.csv/.test(u))return J({sha:"s0",content:b64(csv(rows))});
 if(/commits\?path=index\.html/.test(u))return J([]);
 if(/-metadata\.json/.test(u))return J({sha:"m0",content:b64(JSON.stringify({name:"Bibliothèque test",locations:[]}))});
 return J({},404)};
})();
