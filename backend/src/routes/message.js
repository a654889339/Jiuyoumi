const { Router } = require('express');
const multer = require('multer');
const ctrl = require('../controllers/messageController');
const { authMiddleware: auth, adminMiddleware: adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.get('/mine', auth, ctrl.myMessages);
router.post('/send', auth, ctrl.send);
router.post('/upload-image', auth, upload.single('image'), ctrl.uploadImage);
router.get('/unread', auth, ctrl.unreadCount);

router.get('/admin/conversations', auth, adminOnly, ctrl.adminConversations);
router.get('/admin/:userId', auth, adminOnly, ctrl.adminGetMessages);
router.post('/admin/:userId/reply', auth, adminOnly, ctrl.adminReply);

module.exports = router;
