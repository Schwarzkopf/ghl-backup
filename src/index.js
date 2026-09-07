import Fastify from 'fastify'; import fs from 'node:fs/promises'; import path from 'node:path';
import {cfg,assertConfig} from './config.js'; import {runBackup} from './backup.js'; import {listBackups,readManifest} from './storage.js'; import {contactUpsert} from './ghl.js';
const app=Fastify({logger:true}); let running=false,lastRun=null;
function auth(req,reply){if(cfg.admin && req.headers.authorization!==`Bearer ${cfg.admin}`) return reply.code(401).send({error:'unauthorized'})}
app.get('/health',async()=>({ok:true}));
app.get('/api/status',async(req,reply)=>{const x=auth(req,reply);if(x)return x;return {running,lastRun,backups:await listBackups()}});
app.post('/api/backup',async(req,reply)=>{const x=auth(req,reply);if(x)return x;if(running)return reply.code(409).send({error:'backup running'});running=true;try{return lastRun=await runBackup()}finally{running=false}});
app.get('/api/backups/:id/manifest',async(req,reply)=>{const x=auth(req,reply);if(x)return x;return readManifest(req.params.id)});
app.get('/api/backups/:id/:resource',async(req,reply)=>{const x=auth(req,reply);if(x)return x; const p=path.join(cfg.dir,req.params.id,req.params.resource+'.json'); return JSON.parse(await fs.readFile(p,'utf8'))});
app.post('/api/restore/contacts',async(req,reply)=>{const x=auth(req,reply);if(x)return x; if(!req.body?.confirm) return reply.code(400).send({error:'confirm=true required'}); const data=Array.isArray(req.body.contacts)?req.body.contacts:[]; let ok=0,errors=[]; for(const c of data){try{await contactUpsert(c);ok++}catch(e){errors.push(e.message)}} return {ok,errors,total:data.length}});
app.get('/',async(req,reply)=>reply.type('text/html').send(await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8')));
function schedule(cron,fn){let delay; const tick=async()=>{try{const [m,h]=cron.split(' ').map(Number);const now=new Date(), next=new Date(now);next.setSeconds(0,0);next.setHours(h,m,0,0);if(next<=now)next.setDate(next.getDate()+1);delay=next-now;setTimeout(async()=>{await fn();tick()},delay)}catch{setTimeout(tick,3600000)}};tick()}
async function main(){assertConfig();schedule(cfg.cron,async()=>{if(!running){running=true;try{lastRun=await runBackup()}finally{running=false}}});await app.listen({host:'0.0.0.0',port:cfg.port})}main().catch(e=>{console.error(e);process.exit(1)});
