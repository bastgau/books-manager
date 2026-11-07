var q=function(s){return document.querySelector(s)},sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})},o={},N=window.__net;
var dec=function(p){return new TextDecoder().decode(Uint8Array.from(atob(p.content),function(c){return c.charCodeAt(0)}))};
var waitPut=async function(n){for(var k=0;k<40&&N.puts.length<n;k++)await sleep(250)};
var waitDlg=async function(){for(var k=0;k<40&&!q("#dlgK").open;k++)await sleep(100)};
var fill=function(a,t,isbn){q("#f_auteur").value=a;q("#f_titre").value=t;if(isbn!==undefined)q("#f_isbn").value=isbn};
var ans=[];window.confirm=function(){return ans.length?ans.shift():true};
window.__pending=(async function(){try{
  await sleep(1500);
  o["A_fiches_chargées"]={livres:books.length,tous_avec_un_id:books.every(function(b){return isBookId(b.id)}),statut:q("#sync").textContent};
  /* B. création */
  edit(null);o["B0_formulaire"]={champ_id_présent:!!q("#f_id"),étiquette_id:/(^|>)id(<|$)/i.test(q("#form").innerHTML)};
  fill("NOUVEL AUTEUR","Livre créé",""); q("#bSave").click();await sleep(300);
  var nb=books[books.length-1];
  o["B1_création"]={livres:books.length,id_généré:isBookId(nb.id),plus_récent_que_les_autres:books.slice(0,-1).every(function(b){return b.id<nb.id}),cache_navigateur_contient_l_id:JSON.parse(localStorage.getItem("livrotheque.v1."+LIBID)).pop().id===nb.id};
  await waitPut(1);var csv=dec(N.puts[0]).replace(/^\ufeff/,"").split("\r\n");var hd=csv[0].split("\t");
  o["B2_envoi_au_dépôt"]={envois:N.puts.length,en_tête_se_termine_par_id:hd[hd.length-1]==='"id"',lignes:csv.length-1,dernière_ligne_est_la_nouvelle:csv[csv.length-1].indexOf("Livre créé")>-1&&csv[csv.length-1].indexOf(nb.id)>-1};
  /* C. édition : l'id ne bouge pas, même si auteur / titre / ISBN changent */
  var id1=books[1].id;edit(1);fill("AUTRE AUTEUR","Autre titre","9782070360024");q("#bSave").click();await sleep(300);
  o["C_édition_(auteur,_titre_et_ISBN_changés)"]={id_inchangé:books[1].id===id1,auteur:books[1].auteur,isbn:books[1].isbn};
  /* D. doublon d'ISBN : ids distincts, détection conservée */
  var dupMsg=null;ans=[false];window.confirm=function(m){dupMsg=m;return ans.length?ans.shift():true};
  edit(null);fill("DOUBLON","Même ISBN","9782070360024");q("#bSave").click();await sleep(300);
  o["D_deux_fiches_même_ISBN"]={alerte_doublon_affichée:/Doublon possible/.test(dupMsg||""),fiche_non_enregistrée_après_refus:books.length===7};
  window.confirm=function(){return true};edit(null);fill("DOUBLON","Même ISBN","9782070360024");q("#bSave").click();await sleep(300);
  var l2=books[books.length-1],l1=books[1];
  o["D2_enregistrée_après_confirmation"]={livres:books.length,ids_distincts:l1.id!==l2.id&&isBookId(l2.id),même_isbn:l1.isbn===l2.isbn,filtre_doublons:(function(){q("#fDup").checked=true;q("#fDup").dispatchEvent(new Event("change"));return q("#info").textContent.replace(/\s+/g," ")})()};
  q("#fDup").checked=false;q("#fDup").dispatchEvent(new Event("change"));
  /* E. suppression : les autres fiches gardent leur id */
  var keep=books.filter(function(b,i){return i!==books.length-1}).map(function(b){return b.id});edit(books.length-1);q("#bDel").click();await sleep(300);
  o["E_suppression"]={livres:books.length,ids_des_autres_inchangés:books.every(function(b,i){return b.id===keep[i]})};
  /* F. conflit hors ligne avec ids : un livre renommé = modifié */
  await waitPut(N.puts.length);await sleep(3500);
  N.puts.length=0;setOffline(true);await sleep(200);
  edit(2);fill("AUTEUR 2","Livre 2 renommé hors ligne");q("#bSave").click();await sleep(300);
  N.mode="changed";localStorage.setItem(SK+LIBID+".sha","s0");
  q("#offSw").checked=false;q("#offSw").dispatchEvent(new Event("change"));await waitDlg();
  var body=q("#kBody").textContent.replace(/\s+/g," ");
  o["F_conflit_avec_ids"]={boîte:q("#dlgK").open,seulement_ici:/Seulement sur cet appareil/.test(body),seulement_dépôt:/Seulement dans le dépôt \((\d+)\)/.exec(body)?/Seulement dans le dépôt \((\d+)\)/.exec(body)[1]:"aucun",modifiés:/Modifiés \(version différente\) \((\d+)\)/.exec(body)?/Modifiés \(version différente\) \((\d+)\)/.exec(body)[1]:"aucun"};
  q("#kCancel").click();await sleep(300);
  /* G. id dupliqués dans le dépôt : corrigés, aucune fiche perdue */
  N.mode="dups";localStorage.setItem(SK+LIBID+".dirty","0");localStorage.removeItem(SK+LIBID+".etag");books=[];
  await setOffline(false);for(var k=0;k<30&&!/synchronisé|à envoyer/.test(q("#sync").textContent);k++)await sleep(200);
  var ids=books.map(function(b){return b.id});
  o["G_ids_dupliqués_dans_le_dépôt"]={livres:books.length,ids_uniques:new Set(ids).size===ids.length,premier_garde_son_id:books[1].id===ids[1],corrigé_et_renvoyé:localStorage.getItem(SK+LIBID+".dirty")==="1"||N.puts.length>0};
  /* H. import d'un ancien CSV sans id */
  N.mode="same";
  var legacy="\ufeff"+['"auteur"\t"titre"\t"date_lecture"\t"nb_pages"\t"localisation"\t"resume"\t"isbn"\t"date_entree"\t"couverture"\t"a_verifier"\t"a_garder"','"AAA"\t"un"\t""\t""\t""\t""\t""\t""\t""\t""\t""','"BBB"\t"deux"\t""\t""\t""\t""\t""\t""\t""\t""\t""'].join("\r\n");
  var buf=new TextEncoder().encode(legacy).buffer;
  await q("#file").onchange({target:{files:[{arrayBuffer:function(){return Promise.resolve(buf)}}],value:"x"}});await sleep(300);
  o["H_import_d_un_ancien_CSV"]={livres:books.length,ids_créés:books.every(function(b){return isBookId(b.id)}),dans_l_ordre_du_fichier:books[0].auteur==="AAA"&&books[0].id<books[1].id};
  /* I. réimport d'un CSV déjà migré : ids conservés */
  var mig="\ufeff"+['"auteur"\t"titre"\t"date_lecture"\t"nb_pages"\t"localisation"\t"resume"\t"isbn"\t"date_entree"\t"couverture"\t"a_verifier"\t"a_garder"\t"id"','"AAA"\t"un"\t""\t""\t""\t""\t""\t""\t""\t""\t""\t"0190a1b2-c3d4-7e5f-8a9b-000000000007"'].join("\r\n");
  var buf2=new TextEncoder().encode(mig).buffer;
  await q("#file").onchange({target:{files:[{arrayBuffer:function(){return Promise.resolve(buf2)}}],value:"x"}});await sleep(300);
  o["I_réimport_d_un_CSV_migré"]={id_conservé:books[0].id==="0190a1b2-c3d4-7e5f-8a9b-000000000007"};
}catch(e){o.erreur=String(e&&e.stack||e).slice(0,500)}})();
window.__result=o;
