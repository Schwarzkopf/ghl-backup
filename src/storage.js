import fs from 'node:fs/promises'; import path from 'node:path'; import crypto from 'node:crypto';
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3'; import {cfg} from './config.js';
export async function writeBackup(name,data){
 const file=path.join(cfg.dir,name+'.json'); await fs.mkdir(path.dirname(file),{recursive:true});
 const raw=JSON.stringify(data,null,2); await fs.writeFile(file,raw); return {file,bytes:Buffer.byteLength(raw),sha256:crypto.createHash('sha256').update(raw).digest('hex')};
}
export async function uploadS3(local,name){
 if(!cfg.s3.bucket) return false;
 const client=new S3Client({region:cfg.s3.region,endpoint:cfg.s3.endpoint||undefined,forcePathStyle:cfg.s3.pathStyle,credentials:cfg.s3.key?{accessKeyId:cfg.s3.key,secretAccessKey:cfg.s3.secret}:undefined});
 const body=await fs.readFile(local); await client.send(new PutObjectCommand({Bucket:cfg.s3.bucket,Key:`${cfg.s3.prefix}/${name}`,Body:body,ContentType:'application/json'})); return true;
}
export async function listBackups(){try{return (await fs.readdir(cfg.dir,{withFileTypes:true})).filter(x=>x.isDirectory()).map(x=>x.name).sort().reverse()}catch{return[]}}
export async function readManifest(id){return JSON.parse(await fs.readFile(path.join(cfg.dir,id,'manifest.json'),'utf8'))}
