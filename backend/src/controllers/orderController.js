const { Order, OrderItem, User, Product } = require('../models');
const config = require('../config');

function generateOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `JYM${y}${m}${d}${h}${mi}${s}${rand}`;
}

const STATUS_MAP = {
  pending: { text: '待支付', type: 'warning' },
  paid: { text: '已支付', type: 'primary' },
  shipped: { text: '已发货', type: 'primary' },
  delivered: { text: '已送达', type: 'success' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'default' },
};

exports.create = async (req, res) => {
  try {
    const { items, contactName, contactPhone, address, remark } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ code: 400, message: '购买商品不能为空' });
    }
    const productIds = items.map(i => i.productId);
    const products = await Product.findAll({ where: { id: productIds } });
    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    let totalPrice = 0;
    const orderItems = items.map(item => {
      const p = productMap[item.productId];
      if (!p) throw new Error(`商品ID ${item.productId} 不存在`);
      const qty = item.quantity || 1;
      totalPrice += Number(p.price) * qty;
      return {
        productId: p.id,
        productName: p.name,
        productImage: p.coverImage || '',
        price: p.price,
        quantity: qty,
      };
    });

    const order = await Order.create({
      orderNo: generateOrderNo(),
      userId: req.user.id,
      totalPrice,
      contactName: contactName || '',
      contactPhone: contactPhone || '',
      address: address || '',
      remark: remark || '',
      status: 'pending',
    });

    const itemsWithOrderId = orderItems.map(i => ({ ...i, orderId: order.id }));
    await OrderItem.bulkCreate(itemsWithOrderId);

    const created = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    res.json({ code: 0, data: created });
  } catch (err) {
    console.error('[Order] create error:', err.message);
    res.status(500).json({ code: 500, message: err.message || '创建订单失败' });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;
    const where = { userId: req.user.id };
    if (status && status !== 'all') where.status = status;

    const limit = Math.min(Math.max(parseInt(pageSize) || 10, 1), 10);
    const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    const list = rows.map(o => {
      const s = STATUS_MAP[o.status] || STATUS_MAP.pending;
      return { ...o.toJSON(), statusText: s.text, statusType: s.type };
    });
    res.json({ code: 0, data: { list, total: count, page: Math.max(parseInt(page) || 1, 1), pageSize: limit } });
  } catch (err) {
    console.error('[Order] myOrders error:', err.message);
    res.status(500).json({ code: 500, message: '获取订单失败' });
  }
};

exports.detail = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权查看' });
    }
    const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
    res.json({ code: 0, data: { ...order.toJSON(), statusText: s.text, statusType: s.type } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取订单详情失败' });
  }
};

exports.cancel = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权操作' });
    }
    if (['completed', 'cancelled', 'shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ code: 400, message: '当前状态无法取消' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json({ code: 0, message: '订单已取消' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '取消订单失败' });
  }
};

exports.tracking = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权查看' });
    }
    if (!order.trackingNo) {
      return res.json({ code: 0, data: { trackingNo: '', trackingCompany: '', info: null } });
    }

    const needRefresh = !order.trackingInfo ||
      !order.trackingLastUpdate ||
      (Date.now() - new Date(order.trackingLastUpdate).getTime() > 30 * 60 * 1000);

    if (needRefresh && config.kuaidi100.key) {
      try {
        const trackingData = await queryKuaidi100(order.trackingNo, order.trackingCompany);
        if (trackingData) {
          order.trackingInfo = trackingData;
          order.trackingLastUpdate = new Date();
          await order.save();
        }
      } catch (e) {
        console.error('[Tracking] kuaidi100 query error:', e.message);
      }
    }

    res.json({
      code: 0,
      data: {
        trackingNo: order.trackingNo,
        trackingCompany: order.trackingCompany,
        info: order.trackingInfo,
        lastUpdate: order.trackingLastUpdate,
      },
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '查询物流失败' });
  }
};

async function queryKuaidi100(trackingNo, company) {
  const crypto = require('crypto');
  const https = require('https');

  const param = JSON.stringify({ com: company || 'auto', num: trackingNo });
  const sign = crypto.createHash('md5')
    .update(param + config.kuaidi100.key + config.kuaidi100.customer)
    .digest('hex').toUpperCase();

  const postData = `customer=${config.kuaidi100.customer}&sign=${sign}&param=${encodeURIComponent(param)}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'poll.kuaidi100.com',
      path: '/poll/query.do',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (resp) => {
      let data = '';
      resp.on('data', c => (data += c));
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch { resolve(null); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

exports.adminList = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;
    const where = {};
    if (status && status !== 'all') where.status = status;
    const limit = Math.min(Math.max(parseInt(pageSize) || 20, 1), 100);
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const offset = (currentPage - 1) * limit;
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'nickname'] },
        { model: OrderItem, as: 'items' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    const list = rows.map(o => {
      const s = STATUS_MAP[o.status] || STATUS_MAP.pending;
      return { ...o.toJSON(), statusText: s.text, statusType: s.type };
    });
    const totalPages = Math.ceil(count / limit);
    res.json({ code: 0, data: { list, total: count, page: currentPage, pageSize: limit, totalPages } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取订单列表失败' });
  }
};

exports.adminUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !STATUS_MAP[status]) {
      return res.status(400).json({ code: 400, message: '无效状态' });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
    order.status = status;
    await order.save();
    const s = STATUS_MAP[order.status];
    res.json({ code: 0, data: { ...order.toJSON(), statusText: s.text, statusType: s.type } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新状态失败' });
  }
};

exports.adminUpdateTracking = async (req, res) => {
  try {
    const { trackingNo, trackingCompany } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ code: 404, message: '订单不存在' });
    order.trackingNo = trackingNo || '';
    order.trackingCompany = trackingCompany || '';
    order.trackingInfo = null;
    order.trackingLastUpdate = null;
    if (trackingNo && order.status === 'paid') {
      order.status = 'shipped';
    }
    await order.save();
    res.json({ code: 0, data: order });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新物流信息失败' });
  }
};
