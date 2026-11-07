var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},M=window.__mode;
var mk=function(n,p){var a=[];for(var i=0;i<n;i++)a.push({auteur:"LOCAL "+i,titre:p+i,date_lecture:"",nb_pages:"",localisation:"",resume:"",isbn:"",date_entree:"",couverture:"",a_verifier:"",a_garder:""});return a};
var vis=function(){return document.querySelectorAll("#tbody tr[data-i]").length};
var ans=[],asked=[];window.confirm=function(m){asked.push(m.split("\n")[0]);return ans.length?ans.shift():true};
window.downloadCsv=function(t,n){window.__dl={n:n,lignes:t.split(/\r?\n/).filter(Boolean).length-1}};
var lines=function(p){return new TextDecoder().decode(Uint8Array.from(atob(p.content),function(c){return c.charCodeAt(0)})).split(/\r?\n/).filter(Boolean).length-1};
var openLib=async function(){q("#bSync").click();await sleep(100);q("#sRepo").value="demo/depot";q("#sToken").value="FAUX";q("#sLib").value=LIBID;q("#sOpen").click();for(var k=0;k<60&&q("#dlgS").open;k++)await sleep(150)};
var createLib=async function(){q("#bSync").click();await sleep(100);q("#sRepo").value="demo/depot";q("#sToken").value="FAUX";q("#nName").value="Nouvelle";q("#sCreate").click();for(var k=0;k<60&&!/créée/.test(q("#sMsg").textContent);k++)await sleep(150);await sleep(300);if(q("#dlgS").open)q("#dlgS").close()};
var reset=function(nLocal){localStorage.clear();window.__dl=null;M.puts.length=0;M.get="ok";asked.length=0;ans.length=0;books=nLocal?mk(nLocal,"Local "):[];if(nLocal)localStorage.setItem("livrotheque.v1.local",JSON.stringify(books));render()};
window.__pending=(async function(){try{
  await sleep(400);
  /* A. création avec liste locale : import accepté */
  reset(50);ans=[true];await createLib();for(var k=0;k<60&&!M.puts.some(function(p){return p.content&&lines(p)===50});k++)await sleep(150);
  o["A_créer_+_importer_la_liste_locale"]="question posée : « "+asked[0]+" » ; livres dans la nouvelle bibliothèque="+books.length+" ; fichier envoyé au dépôt avec "+lines(M.puts[M.puts.length-1])+" livres";
  /* B. création avec liste locale : import refusé, sauvegarde acceptée */
  reset(50);ans=[false,true];await createLib();
  o["B_créer_sans_importer_+_sauvegarde_CSV"]="livres affichés="+books.length+" ; téléchargement="+(window.__dl?window.__dl.n+" ("+window.__dl.lignes+" livres)":"aucun")+" ; liste locale toujours en mémoire="+JSON.parse(localStorage.getItem("livrotheque.v1.local")||"[]").length;
  /* C. ouverture d'une bibliothèque existante avec liste locale */
  reset(50);ans=[true];await openLib();
  o["C_ouvrir_avec_une_liste_locale"]="livres affichés="+books.length+" (liste distante) ; question : « "+asked[asked.length-1]+" » ; téléchargement="+(window.__dl?window.__dl.n+" ("+window.__dl.lignes+" livres)":"aucun");
  reset(50);ans=[false];await openLib();
  o["C2_idem_en_refusant_la_sauvegarde"]="téléchargement="+(window.__dl?"oui":"aucun")+" ; liste locale conservée en mémoire="+JSON.parse(localStorage.getItem("livrotheque.v1.local")||"[]").length;
  /* D. poste neuf : aucune question inutile */
  reset(0);await openLib();
  o["D_poste_neuf_+_ouvrir"]="livres="+books.length+" ; questions posées="+asked.length;
  /* E. lecture vide alors que la liste locale est pleine */
  reset(0);await openLib();var n0=books.length;M.get="header";asked.length=0;await pull();
  o["E_dépôt_qui_renvoie_0_livre_(en-tête_seul)"]="avant="+n0+" ; après="+books.length+" ; statut : "+q("#sync").textContent.slice(0,95);
  M.get="empty";await pull();
  o["E2_dépôt_qui_renvoie_un_contenu_vide"]="après="+books.length+" ; statut : "+q("#sync").textContent.slice(0,95);
  M.get="ok";
  /* F. protection de l'envoi */
  reset(0);await openLib();var cnt=localStorage.getItem(SK+LIBID+".count");
  o["F0_nombre_de_livres_connu_du_dépôt"]=cnt;
  M.puts.length=0;books=[];asked.length=0;ans=[false];save();await sleep(3500);
  o["F1_liste_vide,_envoi_refusé"]="envois="+M.puts.length+" ; question : « "+asked[0]+" » ; statut : "+q("#sync").textContent.slice(0,90);
  M.puts.length=0;asked.length=0;ans=[true];save();for(var z=0;z<40&&!M.puts.length;z++)await sleep(150);
  o["F2_liste_vide,_envoi_confirmé"]="envois="+M.puts.length;
  reset(0);await openLib();books=books.slice(0,10);M.puts.length=0;asked.length=0;ans=[false];save();await sleep(3500);
  o["F3_liste_réduite_de_40_à_10,_envoi_refusé"]="envois="+M.puts.length+" ; question : « "+(asked[0]||"aucune")+" »";
  reset(0);await openLib();books.push(mk(1,"Ajout")[0]);M.puts.length=0;asked.length=0;save();for(var y=0;y<40&&!M.puts.length;y++)await sleep(150);
  o["F4_ajout_normal_d_un_livre"]="envois="+M.puts.length+" ; questions posées="+asked.length+" ; livres envoyés="+(M.puts.length?lines(M.puts[0]):"–");
  reset(0);await openLib();books.splice(0,3);M.puts.length=0;asked.length=0;save();for(var x=0;x<40&&!M.puts.length;x++)await sleep(150);
  o["F5_suppression_normale_de_3_livres"]="envois="+M.puts.length+" ; questions posées="+asked.length;
  /* G. erreurs inattendues visibles */
  setTimeout(function(){throw new Error("boum de test")},10);await sleep(300);
  o["G_erreur_JavaScript_inattendue"]=q("#sync").textContent;
  Promise.reject(new Error("rejet de test"));await sleep(300);
  o["G2_promesse_rejetée"]=q("#sync").textContent;
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
