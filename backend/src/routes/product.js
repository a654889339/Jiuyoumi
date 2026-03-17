const { Router } = require('express');
const multer = require('multer');
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const config = require('../config');
      req.user = jwt.verify(token, config.jwt.secret);
    } catch {}
  }
  next();
};

const router = Router();

router.get('/categories', productController.categories);
router.get('/sales-stats', authMiddleware, adminMiddleware, productController.salesStats);
router.get('/', productController.list);
router.get('/:id', optionalAuth, productController.detail);
router.post('/', authMiddleware, adminMiddleware, productController.adminCreate);
router.put('/:id', authMiddleware, adminMiddleware, productController.adminUpdate);
router.delete('/:id', authMiddleware, adminMiddleware, productController.adminDelete);
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), productController.uploadFile);
router.get('/:id/history', authMiddleware, adminMiddleware, productController.history);
router.get('/:id/favorite-users', authMiddleware, adminMiddleware, productController.favoriteUsers);
router.post('/favorite', authMiddleware, productController.toggleFavorite);

module.exports = router;
