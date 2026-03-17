const { Router } = require('express');
const multer = require('multer');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/send-email-code', authController.sendEmailCode);
router.post('/send-sms-code', authController.sendSmsCode);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/wx-login', authController.wxLogin);
router.post('/alipay-login', authController.alipayLogin);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
