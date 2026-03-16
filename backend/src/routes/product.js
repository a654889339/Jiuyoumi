const { Router } = require('express');
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

router.get('/categories', productController.categories);
router.get('/', productController.list);
router.get('/:id', productController.detail);
router.post('/', authMiddleware, adminMiddleware, productController.adminCreate);
router.put('/:id', authMiddleware, adminMiddleware, productController.adminUpdate);
router.delete('/:id', authMiddleware, adminMiddleware, productController.adminDelete);

module.exports = router;
