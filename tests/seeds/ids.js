(function(){
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
var COLSN=["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_entree","couverture","a_verifier","a_garder","id"];
function bid(i){return "0190a1b2-c3d4-7e5f-8a9b-"+String(i).padStart(12,"0")}
function mk(n,p){var a=[];for(var i=0;i<n;i++)a.push({auteur:"AUTEUR "+i,titre:p+i,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:"",id:bid(i)});return a}
var rows=mk(5,"Livre ");
function csv(l){return "\ufeff"+['"'+COLSN.join('"\t"')+'"'].concat(l.map(function(b){return COLSN.map(function(k){return '"'+(b[k]||"")+'"'}).join("\t")})).join("\r\n")+"\r\n"}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
localStorage.setItem("livrotheque.v1."+LIBID,JSON.stringify(rows));
var S="livrotheque.sync.";localStorage.setItem(S+"repo","demo/depot");localStorage.setItem(S+"token","FAUX");localStorage.setItem(S+"lib",LIBID);localStorage.setItem(S+LIBID+".sha","s0");localStorage.setItem(S+LIBID+".dirty","0");localStorage.setItem(S+LIBID+".count","5");
localStorage.setItem(S+LIBID+".meta",JSON.stringify({name:"Bibliothèque test",description:"",owner:"",locations:["Cave"]}));
var remoteChanged=mk(5,"Livre ");remoteChanged[1].titre="Livre 1 (modifié ailleurs)";remoteChanged.push({auteur:"NOUVEAU",titre:"Ajouté ailleurs",date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:"",id:bid(50)});
var remoteDups=mk(5,"Livre ");remoteDups[3].id=remoteDups[1].id;remoteDups[4].id=remoteDups[1].id;
window.__net={mode:"same",calls:[],puts:[]};
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET",n=window.__net;
 if(/contents\/.*-database\.csv/.test(u)){
  if(m==="PUT"){n.puts.push(JSON.parse(o.body));return J({content:{sha:"p"+n.puts.length}})}
  var r=n.mode==="changed"?remoteChanged:n.mode==="dups"?remoteDups:rows;
  return J({sha:n.mode==="same"?"s0":"s9",content:b64(csv(r))});
 }
 if(/commits\?path=index\.html/.test(u))return J([]);
 if(/-metadata\.json/.test(u))return J({sha:"m0",content:b64(JSON.stringify({name:"Bibliothèque test",locations:["Cave"]}))});
 return J({},404)};
})();
