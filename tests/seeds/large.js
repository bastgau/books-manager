(function(){
// Repository file above 1 MB: the Contents API object has no content (content "", encoding "none", documented by GitHub);
// the bytes come from the Git Blobs API (raw). blobFail makes that second call fail. New device: no local copy, no sha.
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
var COLSN=["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_entree","couverture","a_verifier","a_garder","id"];
function bid(i){return "0190a1b2-c3d4-7e5f-8a9b-"+String(i).padStart(12,"0")}
var rows=[];for(var i=0;i<300;i++)rows.push({auteur:"AUTEUR "+i,titre:"Livre "+i,date_lecture:"",nb_pages:"",localisation:"",resume:"Résumé fictif "+i,isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:"",id:bid(i)});
var text="﻿"+['"'+COLSN.join('"\t"')+'"'].concat(rows.map(function(b){return COLSN.map(function(k){return '"'+(b[k]||"")+'"'}).join("\t")})).join("\r\n")+"\r\n";
var S="livrotheque.sync.";localStorage.setItem(S+"repo","demo/depot");localStorage.setItem(S+"token","FAUX");localStorage.setItem(S+"lib",LIBID);
var net=window.__net={blobFail:false,accepts:[],blobCalls:0,puts:[]};
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET",h=(o&&o.headers)||{};
 if(/git\/blobs\/sBIG/.test(u)){net.blobCalls++;net.blobAccept=h.Accept;return net.blobFail?J({message:"Server Error"},500):Promise.resolve(new Response(new TextEncoder().encode(text),{status:200}))}
 if(/contents\/.*-database\.csv/.test(u)){
  if(m==="PUT"){var b=JSON.parse(o.body);net.puts.push({sha:b.sha||null});return b.sha==="sBIG"?J({content:{sha:"sNEW"}}):J({message:"sha wasn't supplied"},422)}
  net.accepts.push(h.Accept);
  return J({sha:"sBIG",size:1500000,encoding:"none",content:"",type:"file"});
 }
 if(/commits\?path=index\.html/.test(u))return J([]);
 if(/-metadata\.json/.test(u))return J({sha:"m0",content:btoa(JSON.stringify({name:"Grosse bibliothèque",locations:[]}))});
 return J({},404)};
})();
