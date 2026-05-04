const express = require('express');
const router = express.Router();
const projects = require('../controllers/projects.controller');
const { requireLogin, requireProjectAccess } = require('../middleware/auth.middleware');

router.get('/', requireLogin, projects.listGet);
router.post('/', requireLogin, projects.createPost);

router.get('/:projectId', requireLogin, requireProjectAccess, projects.detailGet);
router.put('/:projectId', requireLogin, requireProjectAccess, projects.editPut);
router.delete('/:projectId', requireLogin, requireProjectAccess, projects.deleteProject);

router.post('/:projectId/members', requireLogin, requireProjectAccess, projects.addMemberPost);
router.delete('/:projectId/members/:memberId', requireLogin, requireProjectAccess, projects.removeMemberPost);

module.exports = router;