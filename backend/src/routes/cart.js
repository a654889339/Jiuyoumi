const { Router } = require('express');
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

router.get('/', authMiddleware, cartController.list);
router.post('/', authMiddleware, cartController.add);
router.put('/:id', authMiddleware, cartController.update);
router.delete('/:id', authMiddleware, cartController.remove);
router.delete('/', authMiddleware, cartController.clear);

module.exports = router;
