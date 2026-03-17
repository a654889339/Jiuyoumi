const { Op } = require('sequelize');
const { Product, ProductCategory, ProductHistory, ProductFavorite, User, Order, OrderItem } = require('../models');
const sequelize = require('../config/database');

exports.adminList = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const rows = await Product.findAll({
      include: [{ model: ProductCategory, as: 'category', attributes: ['id', 'name'] }],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });
    const productIds = rows.map(r => r.id);
    let favCountMap = {};
    if (productIds.length > 0) {
      const favRows = await ProductFavorite.findAll({
        attributes: ['productId', [fn('COUNT', col('id')), 'cnt']],
        where: { productId: productIds },
        group: ['productId'],
        raw: true,
      });
      favRows.forEach(f => { favCountMap[f.productId] = parseInt(f.cnt, 10); });
    }
    const list = rows.map(r => ({
      ...r.toJSON(),
      favoriteCount: favCountMap[r.id] || 0,
      favCount: favCountMap[r.id] || 0,
    }));
    res.json({ code: 0, data: { list, total: list.length } });
  } catch (err) {
    console.error('[Product] adminList error:', err.message);
    res.status(500).json({ code: 500, message: '获取商品列表失败' });
  }
};

exports.list = async (req, res) => {
  try {
    const { categoryId, keyword, page = 1, pageSize = 20 } = req.query;
    const where = { status: 'active' };
    if (categoryId) where.categoryId = categoryId;
    if (keyword) where.name = { [Op.like]: `%${keyword}%` };
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: ProductCategory, as: 'category', attributes: ['id', 'name'] }],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });
    const productIds = rows.map(r => r.id);
    let favCountMap = {};
    if (productIds.length > 0) {
      const { fn, col } = require('sequelize');
      const favRows = await ProductFavorite.findAll({
        attributes: ['productId', [fn('COUNT', col('id')), 'cnt']],
        where: { productId: productIds },
        group: ['productId'],
        raw: true,
      });
      favRows.forEach(f => { favCountMap[f.productId] = parseInt(f.cnt, 10); });
    }
    const list = rows.map(r => ({
      ...r.toJSON(),
      favoriteCount: favCountMap[r.id] || 0,
      favCount: favCountMap[r.id] || 0,
    }));
    res.json({ code: 0, data: { list, total: count, page: parseInt(page), pageSize: parseInt(pageSize) } });
  } catch (err) {
    console.error('[Product] list error:', err.message);
    res.status(500).json({ code: 500, message: '获取商品列表失败' });
  }
};

exports.detail = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductCategory, as: 'category', attributes: ['id', 'name'] }],
    });
    if (!product) return res.status(404).json({ code: 404, message: '商品不存在' });
    const favCount = await ProductFavorite.count({ where: { productId: product.id } });
    let isFavorited = false;
    if (req.user) {
      isFavorited = !!(await ProductFavorite.findOne({ where: { userId: req.user.id, productId: product.id } }));
    }
    res.json({ code: 0, data: { ...product.toJSON(), favCount, isFavorited } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取商品详情失败' });
  }
};

exports.categories = async (req, res) => {
  try {
    const cats = await ProductCategory.findAll({ order: [['sortOrder', 'ASC']] });
    res.json({ code: 0, data: cats });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取分类失败' });
  }
};

exports.adminCreate = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json({ code: 0, data: product });
  } catch (err) {
    console.error('[Product] adminCreate error:', err.message);
    res.status(500).json({ code: 500, message: '创建商品失败: ' + err.message });
  }
};

exports.adminUpdate = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ code: 404, message: '商品不存在' });
    const changes = [];
    if (req.body.price !== undefined && Number(req.body.price) !== Number(product.price)) {
      changes.push({ changeType: 'price', oldValue: String(product.price), newValue: String(req.body.price) });
    }
    if (req.body.stock !== undefined && Number(req.body.stock) !== Number(product.stock)) {
      changes.push({ changeType: 'stock', oldValue: String(product.stock), newValue: String(req.body.stock) });
    }
    if (req.body.status !== undefined && req.body.status !== product.status) {
      changes.push({ changeType: 'status', oldValue: product.status, newValue: req.body.status });
    }
    if (req.body.name !== undefined && req.body.name !== product.name) {
      changes.push({ changeType: 'info', oldValue: product.name, newValue: req.body.name });
    }
    await product.update(req.body);
    if (changes.length) {
      const operator = req.user ? (req.user.nickname || req.user.username || 'admin') : 'admin';
      await ProductHistory.bulkCreate(changes.map(c => ({ ...c, productId: product.id, operator })));
    }
    res.json({ code: 0, data: product });
  } catch (err) {
    console.error('[Product] adminUpdate error:', err.message);
    res.status(500).json({ code: 500, message: '更新商品失败' });
  }
};

exports.adminDelete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ code: 404, message: '商品不存在' });
    await product.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除商品失败' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 400, message: '未选择文件' });
    const path = require('path');
    const ext = path.extname(req.file.originalname) || '.bin';
    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const cosUpload = require('../utils/cosUpload');
    const url = await cosUpload.upload(req.file.buffer, filename, req.file.mimetype);
    res.json({ code: 0, data: { url } });
  } catch (err) {
    console.error('[Product] uploadFile error:', err.message);
    res.status(500).json({ code: 500, message: '上传失败: ' + err.message });
  }
};

exports.history = async (req, res) => {
  try {
    const logs = await ProductHistory.findAll({
      where: { productId: req.params.id },
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json({ code: 0, data: logs });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取历史记录失败' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ code: 400, message: 'productId必填' });
    const existing = await ProductFavorite.findOne({ where: { userId: req.user.id, productId } });
    if (existing) {
      await existing.destroy();
      res.json({ code: 0, data: { favorited: false } });
    } else {
      await ProductFavorite.create({ userId: req.user.id, productId });
      res.json({ code: 0, data: { favorited: true } });
    }
  } catch (err) {
    res.status(500).json({ code: 500, message: '操作失败' });
  }
};

exports.favoriteUsers = async (req, res) => {
  try {
    const favs = await ProductFavorite.findAll({
      where: { productId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'phone', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ code: 0, data: { list: favs, count: favs.length } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取关注用户失败' });
  }
};

exports.salesStats = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    let dateFormat, groupBy;
    switch (period) {
      case 'week': dateFormat = '%x-W%v'; groupBy = 'YEARWEEK(orders.createdAt, 1)'; break;
      case 'month': dateFormat = '%Y-%m'; groupBy = "DATE_FORMAT(orders.createdAt, '%Y-%m')"; break;
      case 'year': dateFormat = '%Y'; groupBy = "DATE_FORMAT(orders.createdAt, '%Y')"; break;
      default: dateFormat = '%Y-%m-%d'; groupBy = 'DATE(orders.createdAt)';
    }
    const stats = await sequelize.query(`
      SELECT
        DATE_FORMAT(orders.createdAt, '${dateFormat}') AS period,
        oi.productId,
        p.name AS productName,
        SUM(oi.quantity) AS totalQty,
        SUM(oi.price * oi.quantity) AS totalAmount
      FROM order_items oi
      JOIN orders ON orders.id = oi.orderId
      JOIN products p ON p.id = oi.productId
      WHERE orders.status NOT IN ('cancelled')
      GROUP BY period, oi.productId, p.name
      ORDER BY period DESC, totalAmount DESC
      LIMIT 500
    `, { type: sequelize.QueryTypes.SELECT });
    res.json({ code: 0, data: stats });
  } catch (err) {
    console.error('[Product] salesStats error:', err.message);
    res.status(500).json({ code: 500, message: '获取销售统计失败' });
  }
};

exports.adminUserList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword } = req.query;
    const where = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }
    const limit = Math.min(parseInt(pageSize) || 20, 100);
    const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'nickname', 'phone', 'email', 'avatar', 'role', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ code: 0, data: { list: rows, total: count, page: parseInt(page), pageSize: limit } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取用户列表失败' });
  }
};

exports.adminUserDetail = async (req, res) => {
  try {
    const { Address, Order: OrderModel, OrderItem: OI } = require('../models');
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'nickname', 'phone', 'email', 'avatar', 'role', 'status', 'createdAt'],
    });
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' });
    const addresses = await Address.findAll({ where: { userId: user.id } });
    const orders = await OrderModel.findAll({
      where: { userId: user.id },
      attributes: ['id', 'orderNo', 'totalPrice', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    const favs = await ProductFavorite.findAll({
      where: { userId: user.id },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'coverImage'] }],
    });
    res.json({ code: 0, data: { user, addresses, orders, favorites: favs } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取用户详情失败' });
  }
};
