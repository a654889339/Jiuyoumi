const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

exports.sendEmailCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ code: 400, message: '邮箱不能为空' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ code: 400, message: '邮箱格式不正确' });
    const emailService = require('../services/emailService');
    await emailService.sendVerificationCode(email);
    res.json({ code: 0, message: '验证码已发送' });
  } catch (err) {
    console.error('[Auth] sendEmailCode error:', err.message);
    res.status(400).json({ code: 400, message: err.message || '发送验证码失败' });
  }
};

exports.sendSmsCode = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ code: 400, message: '手机号不能为空' });
    if (!/^1\d{10}$/.test(String(phone).replace(/\s/g, ''))) return res.status(400).json({ code: 400, message: '请输入正确的11位手机号' });
    const smsService = require('../services/smsService');
    await smsService.sendVerificationCode(phone);
    res.json({ code: 0, message: '验证码已发送' });
  } catch (err) {
    console.error('[Auth] sendSmsCode error:', err.message);
    res.status(400).json({ code: 400, message: err.message || '发送验证码失败' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, nickname, phone, email, emailCode } = req.body;
    if (!username || !password) return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    if (String(username).trim().length < 2 || String(username).trim().length > 50) return res.status(400).json({ code: 400, message: '用户名长度需在2-50个字符之间' });
    if (String(password).length < 6) return res.status(400).json({ code: 400, message: '密码长度不能少于6位' });
    if (String(username).trim().toLowerCase() === 'admin') return res.status(400).json({ code: 400, message: '该用户名为系统保留' });

    if (email && emailCode) {
      const emailService = require('../services/emailService');
      const verify = emailService.verifyCode(email, emailCode);
      if (!verify.valid) return res.status(400).json({ code: 400, message: verify.message });
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ code: 400, message: '该邮箱已被注册' });
    }

    if (phone && req.body.smsCode) {
      const smsService = require('../services/smsService');
      const verify = smsService.verifyCode(phone, req.body.smsCode);
      if (!verify.valid) return res.status(400).json({ code: 400, message: verify.message });
      const existingPhone = await User.findOne({ where: { phone: smsService.normalizePhone(phone) } });
      if (existingPhone) return res.status(400).json({ code: 400, message: '该手机号已被注册' });
    }

    const existing = await User.findOne({ where: { username: String(username).trim() } });
    if (existing) return res.status(400).json({ code: 400, message: '用户名已存在' });

    const user = await User.create({
      username: String(username).trim(),
      password,
      nickname: nickname ? String(nickname).trim() : String(username).trim(),
      phone: phone ? String(phone).trim() : '',
      email: email || null,
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
    const { username, password, phone, smsCode } = req.body;

    if (phone && smsCode) {
      const smsService = require('../services/smsService');
      const normalized = smsService.normalizePhone(phone);
      if (!/^1\d{10}$/.test(normalized)) return res.status(400).json({ code: 400, message: '手机号格式不正确' });
      const verify = smsService.verifyCode(phone, smsCode);
      if (!verify.valid) return res.status(400).json({ code: 400, message: verify.message });
      let user = await User.findOne({ where: { phone: normalized } });
      if (!user) return res.status(400).json({ code: 400, message: '该手机号未注册，请先注册' });
      if (user.status !== 'active') return res.status(403).json({ code: 403, message: '账号已被禁用' });
      const token = generateToken(user);
      return res.json({ code: 0, data: { token, user } });
    }

    if (!username || !password) return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    const user = await User.findOne({ where: { username: String(username).trim() } });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    if (user.status !== 'active') return res.status(403).json({ code: 403, message: '账号已被禁用' });
    const token = generateToken(user);
    res.json({ code: 0, data: { token, user } });
  } catch (err) {
    console.error('[Auth] login error:', err.message);
    res.status(500).json({ code: 500, message: '登录失败' });
  }
};

exports.wxLogin = async (req, res) => {
  try {
    const { code, avatarUrl, nickName } = req.body;
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
      user = await User.create({ username: `wx_${shortId}`, password: randomPwd, nickname: nickName ? String(nickName).trim() : '微信用户', openid, avatar: avatarUrl ? String(avatarUrl).trim() : '', email: null });
      isNew = true;
    } else {
      if (avatarUrl !== undefined && String(avatarUrl).trim()) user.avatar = String(avatarUrl).trim();
      if (nickName !== undefined && String(nickName).trim()) user.nickname = String(nickName).trim();
      await user.save({ hooks: false });
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
    const { code, avatarUrl, nickName } = req.body;
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
      user = await User.create({ username: `ali_${shortId}`, password: randomPwd, nickname: nickName ? String(nickName).trim() : '支付宝用户', alipayId: userId, avatar: avatarUrl ? String(avatarUrl).trim() : '', email: null });
      isNew = true;
    } else {
      if (avatarUrl !== undefined && String(avatarUrl).trim()) user.avatar = String(avatarUrl).trim();
      if (nickName !== undefined && String(nickName).trim()) user.nickname = String(nickName).trim();
      await user.save({ hooks: false });
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

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 400, message: '请选择图片' });
    const path = require('path');
    const crypto = require('crypto');
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `avatar_${req.user.id}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const cosUpload = require('../utils/cosUpload');
    const url = await cosUpload.upload(req.file.buffer, filename, req.file.mimetype);
    res.json({ code: 0, data: { url } });
  } catch (err) {
    console.error('[Auth] uploadAvatar error:', err.message);
    res.status(500).json({ code: 500, message: '上传失败: ' + err.message });
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
