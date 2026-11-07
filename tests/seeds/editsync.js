(function(){
// Mock repository whose file can be changed by the scenario ("another device"); every PUT becomes the new remote file.
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
var COLSN=["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_entree","couverture","a_verifier","a_garder","id"];
function bid(i){return "0190a1b2-c3d4-7e5f-8a9b-"+String(i).padStart(12,"0")}
var rows=[];for(var i=0;i<6;i++)rows.push({auteur:"AUTEUR "+i,titre:"Livre "+i,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:i===5?"1":"",a_garder:"",id:bid(i)});
function csv(l){return "﻿"+['"'+COLSN.join('"\t"')+'"'].concat(l.map(function(b){return COLSN.map(function(k){return '"'+(b[k]||"")+'"'}).join("\t")})).join("\r\n")+"\r\n"}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
function unb64(s){return decodeURIComponent(escape(atob(s)))}
localStorage.setItem("livrotheque.v1."+LIBID,JSON.stringify(rows));
var S="livrotheque.sync.";localStorage.setItem(S+"repo","demo/depot");localStorage.setItem(S+"token","FAUX");localStorage.setItem(S+"lib",LIBID);localStorage.setItem(S+LIBID+".sha","s0");localStorage.setItem(S+LIBID+".dirty","0");localStorage.setItem(S+LIBID+".count","6");
localStorage.setItem(S+LIBID+".meta",JSON.stringify({name:"Bibliothèque test",description:"",owner:"",locations:[]}));
var net=window.__net={text:csv(rows),sha:"s0",n:0,puts:[],putDelay:0};   // putDelay (ms): slow upload, like a mobile network
// another device rewrites the file: f receives a copy of the current remote books
window.__remoteEdit=function(f){var l=parseCsv(new TextEncoder().encode(net.text).buffer);f(l);net.text=csv(l);net.sha="r"+(++net.n)};
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET";
 if(/contents\/.*-database\.csv/.test(u)){
  if(m==="PUT"){var b=JSON.parse(o.body);if((b.sha||null)!==net.sha){net.conflicts=(net.conflicts||0)+1;return J({message:"is at "+net.sha+" but expected "+b.sha},409)}/* like GitHub: the sha sent must be the current one */net.puts.push(unb64(b.content));return new Promise(function(r){setTimeout(function(){net.text=unb64(b.content);net.sha="p"+(++net.n);r(J({content:{sha:net.sha}}))},net.putDelay)})}
  return J({sha:net.sha,content:b64(net.text)});
 }
 if(/commits\?path=index\.html/.test(u))return J([]);
 if(/-metadata\.json/.test(u))return J({sha:"m0",content:b64(JSON.stringify({name:"Bibliothèque test",locations:[]}))});
 return J({},404)};
})();
