import {cfg} from './config.js';

async function req(method,path,{query,body}={}){
 const u=new URL(cfg.base+path);
 if(query) for(const [k,v] of Object.entries(query)) if(v!==undefined&&v!==null&&v!=='') u.searchParams.set(k,String(v));
 const r=await fetch(u,{method,headers:{Authorization:`Bearer ${cfg.token}`,Version:cfg.version,'Content-Type':'application/json',Accept:'application/json'},body:body?JSON.stringify(body):undefined});
 const text=await r.text(); let data; try{data=text?JSON.parse(text):null}catch{data={raw:text}}
 if(!r.ok) throw new Error(`${method} ${path} -> ${r.status}: ${JSON.stringify(data).slice(0,1200)}`);
 return data;
}

export async function contacts(){
 const all=[]; let searchAfter;
 for(let i=0;i<10000;i++){
  const body={locationId:cfg.locationId,pageLimit:100,sort:[{field:'dateAdded',direction:'asc'}]};
  if(searchAfter) body.searchAfter=searchAfter;
  const d=await req('POST','/contacts/search',{body});
  const rows=d?.contacts||[]; all.push(...rows);
  if(rows.length<100) break;
  searchAfter=rows[rows.length-1]?.searchAfter; if(!searchAfter) break;
 }
 return all;
}

export const resources={
 location:()=>req('GET',`/locations/${cfg.locationId}`),
 contacts,
 pipelines:()=>req('GET','/opportunities/pipelines',{query:{locationId:cfg.locationId}}),
 calendars:()=>req('GET','/calendars/',{query:{locationId:cfg.locationId}}),
 customFields:()=>req('GET',`/locations/${cfg.locationId}/customFields`),
 customValues:()=>req('GET',`/locations/${cfg.locationId}/customValues`),
 tags:()=>req('GET',`/locations/${cfg.locationId}/tags`),
 workflows:()=>req('GET','/workflows/',{query:{locationId:cfg.locationId}}),
 campaigns:()=>req('GET','/campaigns/',{query:{locationId:cfg.locationId}}),
 objects:()=>req('GET','/objects/',{query:{locationId:cfg.locationId}})
};

export async function opportunities(){
 let page=1, all=[];
 for(let i=0;i<10000;i++){
  const d=await req('POST','/opportunities/search',{body:{locationId:cfg.locationId,page,limit:100}});
  const rows=d?.opportunities||[]; all.push(...rows);
  if(rows.length<100) break; page++;
 }
 return all;
}
export async function contactUpsert(contact){
 const body={...contact,locationId:cfg.locationId}; delete body.id; delete body.contactId; delete body.dateAdded; delete body.dateUpdated; delete body.searchAfter;
 return req('POST','/contacts/upsert',{body});
}
export async function createOpportunity(o){
 const body={...o,locationId:cfg.locationId}; delete body.id; delete body.opportunityId; delete body.createdAt; delete body.updatedAt;
 return req('POST','/opportunities/',{body});
}
