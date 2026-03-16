const { Product, ProductCategory } = require('../models');

exports.list = async (req, res) => {
  try {
    const { categoryId, keyword, page = 1, pageSize = 20 } = req.query;
    const where = { status: 'active' };
    if (categoryId) where.categoryId = categoryId;
    if (keyword) {
      const { Op } = require('sequelize');
      where.name = { [Op.like]: `%${keyword}%` };
    }
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: ProductCategory, as: 'category', attributes: ['id', 'name'] }],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
    });
    res.json({ code: 0, data: { list: rows, total: count, page: parseInt(page), pageSize: parseInt(pageSize) } });
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
    res.json({ code: 0, data: product });
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
    res.status(500).json({ code: 500, message: '创建商品失败' });
  }
};

exports.adminUpdate = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ code: 404, message: '商品不存在' });
    await product.update(req.body);
    res.json({ code: 0, data: product });
  } catch (err) {
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
