const { Cart, Product } = require('../models');

exports.list = async (req, res) => {
  try {
    const items = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ code: 0, data: items });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取购物车失败' });
  }
};

exports.add = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ code: 400, message: '商品ID不能为空' });
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ code: 404, message: '商品不存在' });
    const existing = await Cart.findOne({ where: { userId: req.user.id, productId } });
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      res.json({ code: 0, data: existing });
    } else {
      const item = await Cart.create({ userId: req.user.id, productId, quantity });
      res.json({ code: 0, data: item });
    }
  } catch (err) {
    res.status(500).json({ code: 500, message: '添加购物车失败' });
  }
};

exports.update = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Cart.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 404, message: '购物车项不存在' });
    if (item.userId !== req.user.id) return res.status(403).json({ code: 403, message: '无权操作' });
    if (quantity <= 0) {
      await item.destroy();
      return res.json({ code: 0, message: '已移除' });
    }
    item.quantity = quantity;
    await item.save();
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新购物车失败' });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Cart.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 404, message: '购物车项不存在' });
    if (item.userId !== req.user.id) return res.status(403).json({ code: 403, message: '无权操作' });
    await item.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除购物车项失败' });
  }
};

exports.clear = async (req, res) => {
  try {
    await Cart.destroy({ where: { userId: req.user.id } });
    res.json({ code: 0, message: '购物车已清空' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '清空购物车失败' });
  }
};
