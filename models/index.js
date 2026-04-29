const { sequelize, Sequelize } = require('../config/db.config');

const User = require('./user.model')(sequelize);
const Project = require('./project.model')(sequelize);
const ProjectMember = require('./projectMember.model')(sequelize);
const Ticket = require('./ticket.model')(sequelize);


User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id', otherKey: 'user_id', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id', otherKey: 'project_id', as: 'memberProjects' });

Project.hasMany(Ticket, { foreignKey: 'project_id', as: 'tickets', onDelete: 'CASCADE', hooks: true });
Ticket.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

User.hasMany(Ticket, { foreignKey: 'created_by', as: 'createdTickets' });
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Ticket, { foreignKey: 'assigned_to', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

module.exports = { sequelize, Sequelize, User, Project, ProjectMember, Ticket };
