const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('ProjectMember', {
        project_id: { type: DataTypes.INTEGER, allowNull: false },
        user_id: { type: DataTypes.INTEGER, allowNull: false }
    });
};
