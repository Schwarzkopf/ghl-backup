import fs from 'node:fs/promises'; import path from 'node:path';
import {cfg,assertConfig} from './config.js'; import {resources,opportunities} from './ghl.js'; import {writeBackup,uploadS3} from './storage.js';
export async function runBackup(){
 assertConfig(); const started=new Date(); const id=started.toISOString().replace(/[:.]/g,'-'); const dir=path.join(cfg.dir,id); await fs.mkdir(dir,{recursive:true});
 const jobs={...resources,opportunities}; const results=[];
 for(const [name,fn] of Object.entries(jobs)){
  try{const data=await fn(); const w=await writeBackup(path.join(id,name),data); await uploadS3(w.file,path.join(id,name+'.json')); results.push({resource:name,ok:true,count:Array.isArray(data)?data.length:undefined,sha256:w.sha256,bytes:w.bytes});}
  catch(e){results.push({resource:name,ok:false,error:e.message});}
 }
 const manifest={version:1,locationId:cfg.locationId,startedAt:started.toISOString(),finishedAt:new Date().toISOString(),results};
 await writeBackup(path.join(id,'manifest'),manifest); return {id,manifest};
}
if(process.argv[1]?.endsWith('backup.js')) runBackup().then(x=>console.log(JSON.stringify(x,null,2))).catch(e=>{console.error(e);process.exit(1)});
