const { Router } = require('express');
const homeConfigController = require('../controllers/homeConfigController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = Router();

router.get('/', homeConfigController.list);
router.post('/', authMiddleware, adminMiddleware, homeConfigController.create);
router.put('/:id', authMiddleware, adminMiddleware, homeConfigController.update);
router.delete('/:id', authMiddleware, adminMiddleware, homeConfigController.remove);

module.exports = router;
