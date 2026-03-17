const COS = require('cos-nodejs-sdk-v5');
const config = require('../config');

let cosClient = null;

function getClient() {
  if (cosClient) return cosClient;
  const { secretId, secretKey } = config.cos || {};
  if (!secretId || !secretKey) {
    console.warn('[COS] Missing COS_SECRET_ID or COS_SECRET_KEY');
    return null;
  }
  cosClient = new COS({ SecretId: secretId, SecretKey: secretKey });
  return cosClient;
}

function getCosBaseUrl() {
  const { bucket, region } = config.cos || {};
  return `https://${bucket}.cos.${region}.myqcloud.com`;
}

function upload(buffer, filename, contentType) {
  return new Promise((resolve, reject) => {
    const client = getClient();
    if (!client) return reject(new Error('COS not configured'));
    const { bucket, region } = config.cos;
    const key = `jiuyoumi/uploads/${filename}`;
    client.putObject({
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }, (err) => {
      if (err) return reject(err);
      resolve(`${getCosBaseUrl()}/${key}`);
    });
  });
}

module.exports = { upload, getClient, getCosBaseUrl };
