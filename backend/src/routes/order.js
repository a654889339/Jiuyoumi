const { Router } = require('express');
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

router.post('/', authMiddleware, orderController.create);
router.get('/mine', authMiddleware, orderController.myOrders);
router.get('/admin/list', authMiddleware, adminMiddleware, orderController.adminList);
router.get('/admin/:id/history', authMiddleware, adminMiddleware, orderController.adminGetOrderHistory);
router.get('/:id', authMiddleware, orderController.detail);
router.get('/:id/tracking', authMiddleware, orderController.tracking);
router.put('/:id/cancel', authMiddleware, orderController.cancel);
router.put('/admin/:id/status', authMiddleware, adminMiddleware, orderController.adminUpdateStatus);
router.put('/admin/:id/amount', authMiddleware, adminMiddleware, orderController.adminUpdateAmount);
router.put('/admin/:id/tracking', authMiddleware, adminMiddleware, orderController.adminUpdateTracking);

module.exports = router;
