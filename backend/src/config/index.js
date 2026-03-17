require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '5102'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'jiuyoumi_default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3309'),
    name: process.env.DB_NAME || 'jiuyoumi_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'jiuyoumi_secret_2024',
  },
  wechat: {
    appId: process.env.WECHAT_APPID || '',
    appSecret: process.env.WECHAT_SECRET || '',
  },
  alipay: {
    appId: process.env.ALIPAY_APPID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  },
  kuaidi100: {
    key: process.env.KUAIDI100_KEY || '',
    customer: process.env.KUAIDI100_CUSTOMER || '',
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.EMAIL_HOST || 'smtp.qq.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    username: process.env.EMAIL_USERNAME || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || '',
    fromName: process.env.EMAIL_FROM_NAME || '九柚米',
  },
  sms: {
    enabled: process.env.SMS_ENABLED === 'true',
    secretId: process.env.TENCENT_SMS_SECRET_ID || '',
    secretKey: process.env.TENCENT_SMS_SECRET_KEY || '',
    smsSdkAppId: process.env.TENCENT_SMS_APP_ID || '',
    signName: process.env.TENCENT_SMS_SIGN_NAME || '九柚米',
    templateId: process.env.TENCENT_SMS_TEMPLATE_ID || '',
    codeExpireMinutes: 5,
  },
  cos: {
    secretId: process.env.COS_SECRET_ID || '',
    secretKey: process.env.COS_SECRET_KEY || '',
    bucket: process.env.COS_BUCKET || 'itsyourturnmy-1256887166',
    region: process.env.COS_REGION || 'ap-singapore',
  },
};
