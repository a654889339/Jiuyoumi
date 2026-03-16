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
};
