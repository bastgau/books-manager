(function(){
var LIBID="11111111-2222-4333-8444-555555555555";window.LIBID=LIBID;
window.__gh={meta:{name:"Bibliothèque de test",description:"d",owner:"Alice",locations:["Bureau","Caisse A","Garage","Étagère 1","Prêté Léa","Chalet"]},metaSha:"m0",metaPuts:[],csvPuts:[],failMeta:false,calls:[]};
function b64(s){return btoa(unescape(encodeURIComponent(s)))}
function unb64(s){return decodeURIComponent(escape(atob(s)))}
function J(b,s){return Promise.resolve(new Response(JSON.stringify(b),{status:s||200,headers:{"Content-Type":"application/json"}}))}
window.fetch=function(u,o){u=decodeURIComponent(String(u));var m=(o&&o.method)||"GET",g=window.__gh;
 if(/api\.github\.com\/repos\/.*\/contents\//.test(u)){
  if(/-metadata\.json/.test(u)){
   if(m==="GET")return J({sha:g.metaSha,content:b64(JSON.stringify(g.meta,null,2)+"\n")});
   if(m==="PUT"){if(g.failMeta)return J({message:"boom"},500);var body=JSON.parse(o.body);var j=JSON.parse(unb64(body.content));g.meta=j;g.metaSha="m"+(g.metaPuts.length+1);g.metaPuts.push({sha:body.sha,json:j});g.calls.push("META");return J({content:{sha:g.metaSha}})}
  }
  if(/-database\.csv/.test(u)){
   if(m==="GET")return J({message:"Not Found"},404);
   if(m==="PUT"){var b=JSON.parse(o.body);g.csvPuts.push({csv:unb64(b.content)});g.calls.push("CSV");return J({content:{sha:"c"+g.csvPuts.length}})}
  }
 }
 return Promise.resolve(new Response("{}",{status:404}));
};
})();
