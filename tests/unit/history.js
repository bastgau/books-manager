const fs=require('fs');
const js=fs.readFileSync(process.env.APP || require("path").join(__dirname, "..", "..", "index.html"),'utf8').split('<script>')[1].split('</script>')[0];
const a=js.indexOf('const COLK'),b=js.indexOf('async function loadHist');
const nk=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isBookId=s=>/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s||'');const api=new Function('nk','esc','isBookId',js.slice(a,b)+'\nreturn {describeGroups,groupsFromPatch,groupsFromTexts,renderChanges};')(nk,esc,isBookId);
const txt=s=>s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const OLDH=["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_achat","date_entree","couverture","a_verifier"],NEWH=["auteur","titre","date_lecture","nb_pages","localisation","resume","isbn","date_entree","couverture","a_verifier","a_garder"];
const hdr=(h)=>'﻿'+h.map(x=>'"'+x+'"').join('\t');
const oldRow=(a,t,loc,achat,entree,v)=>['"'+a+'"','"'+t+'"','""','""','"'+(loc||"")+'"','""','"111"','"'+(achat||"")+'"','"'+(entree||"")+'"','""','"'+(v||"")+'"'].join('\t');
const newRow=(a,t,loc,entree,v,g)=>['"'+a+'"','"'+t+'"','""','""','"'+(loc||"")+'"','""','"111"','"'+(entree||"")+'"','""','"'+(v||"")+'"','"'+(g||"")+'"'].join('\t');
const run=(label,groups)=>{const d=api.describeGroups(groups);console.log(label.padEnd(46),'→',txt(api.renderChanges(d.entries,d.header)).slice(0,200))};
// 1. ancien patch (avant) : un titre corrigé et une localisation ajoutée
run("1. ancien patch : titre corrigé",api.groupsFromPatch('@@ -2 +2 @@\n-'+oldRow("ZOLA Émile","GERMINAL","","03/10/2019","04/10/2019")+'\n+'+oldRow("ZOLA Émile","Germinal","","03/10/2019","04/10/2019")));
run("2. ancien patch : localisation ajoutée",api.groupsFromPatch('@@ -2 +2 @@\n-'+oldRow("ZOLA Émile","Germinal","","03/10/2019","04/10/2019")+'\n+'+oldRow("ZOLA Émile","Germinal","Chalet","03/10/2019","04/10/2019")));
// 3. nouveau patch (après)
run("3. nouveau patch : « À garder » = oui",api.groupsFromPatch('@@ -2 +2 @@\n-'+newRow("ZOLA Émile","Germinal","","04/10/2019","","")+'\n+'+newRow("ZOLA Émile","Germinal","","04/10/2019","","oui")));
run("4. nouveau patch : localisation changée",api.groupsFromPatch('@@ -2 +2 @@\n-'+newRow("ZOLA Émile","Germinal","Chalet","04/10/2019","","")+'\n+'+newRow("ZOLA Émile","Germinal","Cave","04/10/2019","","")));
// 5. le commit de migration lui-même : deux versions complètes, en-têtes différents
const N=30;const rowsO=Array.from({length:N},(_,i)=>oldRow("AUT"+i,"Titre "+i,i%3?"Chalet":"","03/10/2019","04/10/2019"));
const rowsN=Array.from({length:N},(_,i)=>newRow("AUT"+i,"Titre "+i,i%3?"Chalet":"","04/10/2019","",""));
const before=[hdr(OLDH),...rowsO,''].join('\r\n'),after=[hdr(NEWH),...rowsN,''].join('\r\n');
run("5. migration (30 livres, en-têtes différents)",api.groupsFromTexts(before,after));
// 6. migration avec un livre dont date d'entrée vide (cas ambigu pour la devinette)
const rowsO2=[oldRow("AUT","Sans entrée","","03/10/2019","")],rowsN2=[newRow("AUT","Sans entrée","","","","")];
run("6. migration, ligne sans date d'entrée",api.groupsFromTexts([hdr(OLDH),...rowsO2,''].join('\r\n'),[hdr(NEWH),...rowsN2,''].join('\r\n')));
// 7. un diff de deux versions du nouveau format
run("7. versions nouveau format : une ligne changée",api.groupsFromTexts([hdr(NEWH),newRow("A","T","","04/10/2019","",""),''].join('\r\n'),[hdr(NEWH),newRow("A","T","Cave","04/10/2019","","non"),''].join('\r\n')));
