const { Router } = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./product');
const orderRoutes = require('./order');
const addressRoutes = require('./address');
const cartRoutes = require('./cart');
const homeConfigRoutes = require('./homeConfig');
const messageRoutes = require('./message');

const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.get('/admin/users', authMiddleware, adminMiddleware, require('../controllers/productController').adminUserList);
router.get('/admin/users/:id', authMiddleware, adminMiddleware, require('../controllers/productController').adminUserDetail);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/home-config', homeConfigRoutes);

router.get('/health', (req, res) => {
  res.json({ code: 0, message: '九柚米服务运行中', timestamp: new Date().toISOString() });
});

module.exports = router;
