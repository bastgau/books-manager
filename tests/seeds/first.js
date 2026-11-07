(function(){
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
window.__mode={get:"ok",puts:[]};
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
var H='﻿'+["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_entree","couverture","a_verifier","a_garder"].map(function(k){return '"'+k+'"'}).join("\t");
var rows=[];for(var i=0;i<40;i++)rows.push(['"AUTEUR '+i+'"','"Livre distant '+i+'"','""','""','""','""','""','""','""','""','""'].join("\t"));
window.__remoteCsv=H+"\r\n"+rows.join("\r\n")+"\r\n";
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET",g=window.__mode;
 if(/api\.github\.com\/repos\/.*\/contents\//.test(u)){
  if(/-metadata\.json/.test(u))return J({sha:"m0",content:b64(JSON.stringify({name:"Test",description:"",owner:"",locations:[]}))});
  if(/-database\.csv/.test(u)){
   if(m==="PUT"){g.puts.push(JSON.parse(o.body));return J({content:{sha:"cNEW"+g.puts.length}})}
   if(g.get==="down")return Promise.reject(new TypeError("NetworkError when attempting to fetch resource."));
   if(g.get==="empty")return J({sha:"sE",content:"",encoding:"none"});
   if(g.get==="header")return J({sha:"sH",content:b64(H+"\r\n")});
   return J({sha:"sR",content:b64(window.__remoteCsv)});
  }
 }
 return Promise.resolve(new Response("{}",{status:404}));
};
})();
