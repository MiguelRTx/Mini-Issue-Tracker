const express = require('express');
const router = express.Router({ mergeParams: true });
const tickets = require('../controllers/tickets.controller');
const { requireLogin, requireProjectAccess } = require('../middleware/auth.middleware');

router.use(requireLogin, requireProjectAccess);

router.get('/', tickets.boardGet);
router.get('/new', tickets.newGet);
router.post('/', tickets.createPost);

router.get('/:id', tickets.detailGet);
router.get('/:id/edit', tickets.editGet);
router.post('/:id/edit', tickets.editPost);
router.post('/:id/delete', tickets.deletePost);
router.post('/:id/status', tickets.changeStatusPost);

// API endpoint para drag-and-drop del tablero Kanban
router.post('/:id/status-api', tickets.changeStatusApi);

module.exports = router;
