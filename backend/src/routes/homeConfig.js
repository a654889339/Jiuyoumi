const { Router } = require('express');
const multer = require('multer');
const homeConfigController = require('../controllers/homeConfigController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', homeConfigController.list);
router.post('/', authMiddleware, adminMiddleware, homeConfigController.create);
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), homeConfigController.uploadImage);
router.put('/:id', authMiddleware, adminMiddleware, homeConfigController.update);
router.delete('/:id', authMiddleware, adminMiddleware, homeConfigController.remove);

module.exports = router;
