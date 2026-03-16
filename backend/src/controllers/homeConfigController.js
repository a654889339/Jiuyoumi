const { HomeConfig } = require('../models');

exports.list = async (req, res) => {
  try {
    const { section } = req.query;
    const where = { status: 'active' };
    if (section) where.section = section;
    const items = await HomeConfig.findAll({ where, order: [['sortOrder', 'ASC']] });
    res.json({ code: 0, data: items });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取配置失败' });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await HomeConfig.create(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建配置失败' });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await HomeConfig.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 404, message: '配置不存在' });
    await item.update(req.body);
    res.json({ code: 0, data: item });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新配置失败' });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await HomeConfig.findByPk(req.params.id);
    if (!item) return res.status(404).json({ code: 404, message: '配置不存在' });
    await item.destroy();
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除配置失败' });
  }
};
