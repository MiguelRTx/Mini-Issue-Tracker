const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Ticket', {
        titulo: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: false },
        estado: {
            type: DataTypes.ENUM('pendiente', 'en_progreso', 'completado'),
            defaultValue: 'pendiente',
            allowNull: false
        },
        project_id: { type: DataTypes.INTEGER, allowNull: false },
        created_by: { type: DataTypes.INTEGER, allowNull: false },
        assigned_to: { type: DataTypes.INTEGER, allowNull: true }
    });
};
