const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

exports.register = async (req, res) => {
  try {
    const { username, password, nickname, phone } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    if (String(username).trim().length < 2 || String(username).trim().length > 50) {
      return res.status(400).json({ code: 400, message: '用户名长度需在2-50个字符之间' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ code: 400, message: '密码长度不能少于6位' });
    }
    if (String(username).trim().toLowerCase() === 'admin') {
      return res.status(400).json({ code: 400, message: '该用户名为系统保留' });
    }
    const existing = await User.findOne({ where: { username: String(username).trim() } });
    if (existing) return res.status(400).json({ code: 400, message: '用户名已存在' });

    const user = await User.create({
      username: String(username).trim(),
      password,
      nickname: nickname ? String(nickname).trim() : String(username).trim(),
      phone: phone || '',
    });
    const token = generateToken(user);
    res.json({ code: 0, data: { token, user } });
  } catch (err) {
    console.error('[Auth] register error:', err.message);
    res.status(500).json({ code: 500, message: '注册失败' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, phone, code } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    const user = await User.findOne({ where: { username: String(username).trim() } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ code: 403, message: '账号已被禁用' });
    }
    const token = generateToken(user);
    res.json({ code: 0, data: { token, user } });
  } catch (err) {
    console.error('[Auth] login error:', err.message);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
};

exports.wxLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ code: 400, message: 'code不能为空' });
    const { appId, appSecret } = config.wechat || {};
    if (!appId || !appSecret) {
      return res.status(500).json({ code: 500, message: '微信配置缺失' });
    }
    const https = require('https');
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const wxData = await new Promise((resolve, reject) => {
      https.get(wxUrl, (resp) => {
        let data = '';
        resp.on('data', c => (data += c));
        resp.on('end', () => { try { resolve(JSON.parse(data)); } catch { reject(new Error('微信接口返回格式错误')); } });
      }).on('error', reject);
    });
    if (wxData.errcode) return res.status(400).json({ code: 400, message: wxData.errmsg || '微信登录失败' });
    const openid = wxData.openid;
    if (!openid) return res.status(400).json({ code: 400, message: '获取openid失败' });
    let user = await User.findOne({ where: { openid } });
    let isNew = false;
    if (!user) {
      const crypto = require('crypto');
      const shortId = crypto.randomBytes(4).toString('hex');
      const randomPwd = crypto.randomBytes(16).toString('hex');
      user = await User.create({ username: `wx_${shortId}`, password: randomPwd, nickname: '微信用户', openid, email: null });
      isNew = true;
    }
    const token = generateToken(user);
    res.json({ code: 0, data: { token, user, isNew } });
  } catch (err) {
    console.error('[Auth] wxLogin error:', err.message);
    res.status(500).json({ code: 500, message: '微信登录失败' });
  }
};

exports.alipayLogin = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ code: 400, message: 'code不能为空' });
    const { appId, privateKey, publicKey } = config.alipay || {};
    if (!appId || !privateKey) {
      return res.status(500).json({ code: 500, message: '支付宝配置缺失' });
    }
    const AlipaySdk = require('alipay-sdk').default || require('alipay-sdk');
    const sdk = new AlipaySdk({ appId, privateKey, alipayPublicKey: publicKey });
    const result = await sdk.exec('alipay.system.oauth.token', { grantType: 'authorization_code', code });
    const userId = result.userId || result.user_id;
    if (!userId) return res.status(400).json({ code: 400, message: '支付宝登录失败' });
    let user = await User.findOne({ where: { alipayId: userId } });
    let isNew = false;
    if (!user) {
      const crypto = require('crypto');
      const shortId = crypto.randomBytes(4).toString('hex');
      const randomPwd = crypto.randomBytes(16).toString('hex');
      user = await User.create({ username: `ali_${shortId}`, password: randomPwd, nickname: '支付宝用户', alipayId: userId, email: null });
      isNew = true;
    }
    const token = generateToken(user);
    res.json({ code: 0, data: { token, user, isNew } });
  } catch (err) {
    console.error('[Auth] alipayLogin error:', err.message);
    res.status(500).json({ code: 500, message: '支付宝登录失败' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
    res.json({ code: 0, data: user });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取用户信息失败' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
    const { nickname, avatar, phone } = req.body;
    if (nickname !== undefined) user.nickname = String(nickname).trim() || user.nickname;
    if (avatar !== undefined) user.avatar = String(avatar).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    await user.save({ hooks: false });
    res.json({ code: 0, data: user });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新失败' });
  }
};
