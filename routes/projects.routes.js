const express = require('express');
const router = express.Router();
const projects = require('../controllers/projects.controller');
const { requireLogin, requireProjectAccess } = require('../middleware/auth.middleware');

router.get('/', requireLogin, projects.listGet);
router.get('/new', requireLogin, projects.newGet);
router.post('/', requireLogin, projects.createPost);

router.get('/:projectId', requireLogin, requireProjectAccess, projects.detailGet);
router.get('/:projectId/edit', requireLogin, requireProjectAccess, projects.editGet);
router.post('/:projectId/edit', requireLogin, requireProjectAccess, projects.editPost);
router.post('/:projectId/delete', requireLogin, requireProjectAccess, projects.deletePost);

router.post('/:projectId/members', requireLogin, requireProjectAccess, projects.addMemberPost);
router.post('/:projectId/members/:memberId/remove', requireLogin, requireProjectAccess, projects.removeMemberPost);

module.exports = router;
