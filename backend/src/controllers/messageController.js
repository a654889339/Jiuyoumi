const path = require('path');
const crypto = require('crypto');
const Message = require('../models/Message');
const User = require('../models/User');

exports.myMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'ASC']],
    });
    await Message.update({ read: true }, {
      where: { userId: req.user.id, sender: 'admin', read: false },
    });
    res.json({ code: 0, data: messages });
  } catch (e) {
    res.status(500).json({ code: 1, message: e.message });
  }
};

exports.send = async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content || !String(content).trim()) return res.status(400).json({ code: 1, message: '消息不能为空' });
    const msg = await Message.create({
      userId: req.user.id,
      sender: 'user',
      content: String(content).trim(),
      type: type === 'image' ? 'image' : 'text',
    });
    res.json({ code: 0, data: msg });
  } catch (e) {
    res.status(500).json({ code: 1, message: e.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 1, message: '请选择图片' });
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `chat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const cosUpload = require('../utils/cosUpload');
    const url = await cosUpload.upload(req.file.buffer, filename, req.file.mimetype);
    res.json({ code: 0, data: { url } });
  } catch (e) {
    console.error('[Message] uploadImage error:', e.message);
    res.status(500).json({ code: 1, message: '上传失败: ' + e.message });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const count = await Message.count({
      where: { userId: req.user.id, sender: 'admin', read: false },
    });
    res.json({ code: 0, data: count });
  } catch (e) {
    res.status(500).json({ code: 1, message: e.message });
  }
};

exports.adminConversations = async (req, res) => {
  try {
    const allMessages = await Message.findAll({
      attributes: ['id', 'userId', 'content', 'sender', 'read', 'type', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    const userIdToLast = {};
    for (const m of allMessages) {
      if (!userIdToLast[m.userId]) userIdToLast[m.userId] = m;
    }
    const userIds = Object.keys(userIdToLast).map(Number);
    if (userIds.length === 0) return res.json({ code: 0, data: [] });
    const users = await User.findAll({
      attributes: ['id', 'username', 'nickname'],
      where: { id: userIds },
    });
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });
    const list = userIds.map(uid => {
      const u = userMap[uid];
      const last = userIdToLast[uid];
      return {
        userId: u.id,
        username: u.username,
        nickname: u.nickname || u.username,
        lastMessage: last.content,
        lastTime: last.createdAt,
        lastSender: last.sender,
        lastType: last.type || 'text',
      };
    }).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

    const { fn, col } = require('sequelize');
    const unreadCounts = await Message.findAll({
      attributes: ['userId', [fn('COUNT', col('id')), 'cnt']],
      where: { sender: 'user', read: false },
      group: ['userId'],
      raw: true,
    });
    const unreadMap = {};
    unreadCounts.forEach(r => { unreadMap[r.userId] = parseInt(r.cnt); });
    list.forEach(c => { c.unread = unreadMap[c.userId] || 0; });

    res.json({ code: 0, data: list });
  } catch (e) {
    res.status(500).json({ code: 1, message: e.message });
  }
};

exports.adminGetMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });
    await Message.update({ read: true }, {
      where: { userId, sender: 'user', read: false },
    });
    res.json({ code: 0, data: messages });
  } catch (e) {
    res.status(500).json({ code: 1, message: e.message });
  }
};

exports.adminReply = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content, type } = req.body;
    if (!content || !String(content).trim()) return res.status(400).json({ code: 1, message: '消息不能为空' });
    const msg = await Message.create({
      userId: parseInt(userId),
      sender: 'admin',
      content: String(content).trim(),
      type: type === 'image' ? 'image' : 'text',
    });
    res.json({ code: 0, data: msg });
  } catch (e) {
    res.status(500).json({ code: 1, message: e.message });
  }
};
