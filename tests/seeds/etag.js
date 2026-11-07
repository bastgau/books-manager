(function(){
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
var COLSN=["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_entree","couverture","a_verifier","a_garder"];
function mk(n,p){var a=[];for(var i=0;i<n;i++)a.push({auteur:"AUTEUR "+i,titre:p+i,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:""});return a}
var rows=mk(5,"Livre ");
function csv(l){return "﻿"+['"'+COLSN.join('"\t"')+'"'].concat(l.map(function(b){return COLSN.map(function(k){return '"'+(b[k]||"")+'"'}).join("\t")})).join("\r\n")+"\r\n"}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
localStorage.setItem("livrotheque.v1."+LIBID,JSON.stringify(rows));
var S="livrotheque.sync.";localStorage.setItem(S+"repo","demo/depot");localStorage.setItem(S+"token","FAUX");localStorage.setItem(S+"lib",LIBID);localStorage.setItem(S+LIBID+".sha","s0");localStorage.setItem(S+LIBID+".dirty","0");localStorage.setItem(S+LIBID+".count","5");
localStorage.setItem(S+LIBID+".meta",JSON.stringify({name:"Bibliothèque test",description:"",owner:"",locations:["Cave"]}));
var remoteChanged=mk(5,"Livre ");remoteChanged[1].titre="Livre 1 (modifié ailleurs)";remoteChanged.push({auteur:"NOUVEAU",titre:"Ajouté ailleurs",date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:""});
window.__net={mode:"same",calls:[],puts:[],delay:0,failPut:0,gets:[],notModified:0,fullBodies:0};
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET",n=window.__net;
 var isGh=/api\.github\.com/.test(u);if(isGh)n.calls.push(m+" "+u.replace(/^.*repos\//,"").slice(0,70));
 var go=function(){
  if(/contents\/.*-database\.csv/.test(u)){
   if(m==="PUT"){if(n.failPut>0){n.failPut--;return Promise.reject(new TypeError("NetworkError"))}n.puts.push(JSON.parse(o.body));return J({content:{sha:"p"+n.puts.length}})}
   var ch=n.mode==="changed",et=ch?"W/\"e2\"":"W/\"e1\"",inm=o&&o.headers&&o.headers["If-None-Match"];n.gets.push({inm:inm||null,cache:o&&o.cache||null,url:u.replace(/^.*contents\//,"").slice(0,60)});if(inm===et){n.notModified++;return Promise.resolve(new Response(null,{status:304,headers:{ETag:et}}))}n.fullBodies++;return Promise.resolve(new Response(JSON.stringify(ch?{sha:"s9",content:b64(csv(remoteChanged))}:{sha:"s0",content:b64(csv(rows))}),{status:200,headers:{"Content-Type":"application/json",ETag:et}}));
  }
  if(/commits\?path=index\.html/.test(u))return J([]);
  if(/-metadata\.json/.test(u))return J({sha:"m0",content:b64(JSON.stringify({name:"Bibliothèque test",locations:["Cave"]}))});
  return J({},404)};
 return n.delay?new Promise(function(r){setTimeout(function(){r(go())},n.delay)}):go();
};
window.__dl=null;
})();
