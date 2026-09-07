import 'dotenv/config';
export const cfg={
 token:process.env.GHL_PRIVATE_INTEGRATION_TOKEN||'', locationId:process.env.GHL_LOCATION_ID||'',
 version:process.env.GHL_API_VERSION||'2021-07-28', base:process.env.GHL_BASE_URL||'https://services.leadconnectorhq.com',
 dir:process.env.BACKUP_DIR||'/data/backups', cron:process.env.BACKUP_CRON||'0 3 * * *', port:+(process.env.PORT||3000),
 admin:process.env.ADMIN_TOKEN||'', daily:+(process.env.RETENTION_DAILY||7), weekly:+(process.env.RETENTION_WEEKLY||4), monthly:+(process.env.RETENTION_MONTHLY||12),
 s3:{endpoint:process.env.S3_ENDPOINT||'',region:process.env.S3_REGION||'us-east-1',bucket:process.env.S3_BUCKET||'',key:process.env.S3_ACCESS_KEY_ID||'',secret:process.env.S3_SECRET_ACCESS_KEY||'',prefix:process.env.S3_PREFIX||'ghl-backups',pathStyle:process.env.S3_FORCE_PATH_STYLE!=='false'}
};
export function assertConfig(){for(const k of ['token','locationId'])if(!cfg[k])throw new Error(`Missing ${k}`)}
