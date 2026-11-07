(function(){
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
var rows=[];for(var i=0;i<5;i++)rows.push({auteur:"AUTEUR "+i,titre:"Livre "+i,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:""});
localStorage.setItem("livrotheque.v1."+LIBID,JSON.stringify(rows));
var S="livrotheque.sync.";localStorage.setItem(S+"repo","demo/depot");localStorage.setItem(S+"token","FAUX");localStorage.setItem(S+"lib",LIBID);localStorage.setItem(S+LIBID+".sha","s0");localStorage.setItem(S+LIBID+".dirty","0");
localStorage.setItem(S+LIBID+".meta",JSON.stringify({name:"Bibliothèque test",description:"",owner:"",locations:["Cave"]}));
window.__net={up:false,puts:0,reads:0,failures:0};
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
window.fetch=function(u,o){u=String(u);var m=(o&&o.method)||"GET",n=window.__net;
 if(!n.up){n.failures++;return Promise.reject(new TypeError("NetworkError when attempting to fetch resource."))}
 if(/contents\/.*-database\.csv/.test(decodeURIComponent(u))){if(m==="PUT"){n.puts++;return J({content:{sha:"s"+(n.puts+1)}})}n.reads++;return J({sha:"s0",content:btoa("x")})}
 return J({},404)};
})();
