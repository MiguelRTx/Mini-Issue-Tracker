const express = require('express');
const router = express.Router({ mergeParams: true });
const tickets = require('../controllers/tickets.controller');
const { requireLogin, requireProjectAccess } = require('../middleware/auth.middleware');

router.use(requireLogin, requireProjectAccess);

router.get('/', tickets.boardGet);
router.post('/', tickets.createPost);

router.get('/:id', tickets.detailGet);
router.put('/:id', tickets.editPut);
router.delete('/:id', tickets.deleteTicket);
router.patch('/:id/status', tickets.changeStatusPatch);

module.exports = router;