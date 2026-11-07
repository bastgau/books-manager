(function(){
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
window.__gh={csvPuts:0,csvBodies:[],metaGets:0,appChecks:0,appMode:"stale",calls:[]};
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET",g=window.__gh;
 /* dernier commit publié de l'application */
 if(/repos\/bastgau\/books-manager\/commits\?path=index\.html/.test(u)){
   g.appChecks++;
   if(g.appMode==="offline")return Promise.reject(new TypeError("NetworkError"));
   if(g.appMode==="ratelimit")return J({message:"rate limit"},403);
   var build=new Date(document.documentElement.getAttribute("data-build")||0);
   var d=g.appMode==="stale"?new Date(build.getTime()+3*3600*1000):new Date(build.getTime()+60*1000);   // périmée de 3 h / à jour (1 min)
   return J([{sha:"abcdef1234567",commit:{committer:{date:d.toISOString()},message:"x"}}]);
 }
 if(/api\.github\.com\/repos\/demo\/depot\/contents\//.test(u)){
   if(/-database\.csv/.test(u)){
     if(m==="PUT"){g.csvPuts++;g.csvBodies.push(JSON.parse(o.body));return J({content:{sha:"c"+g.csvPuts}})}
     return J({message:"Not Found"},404);
   }
   if(/-metadata\.json/.test(u))return J({sha:"m0",content:b64(JSON.stringify({name:"Test",description:"",owner:"",locations:[]}))});
 }
 return Promise.resolve(new Response("{}",{status:404}));
};
})();
