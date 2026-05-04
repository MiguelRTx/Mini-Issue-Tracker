const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Project', {
        nombre: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: false },
        owner_id: { type: DataTypes.INTEGER, allowNull: false }
    });
};
