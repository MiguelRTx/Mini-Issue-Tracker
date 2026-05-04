const { User } = require('../models');
const bcrypt = require('bcryptjs');

const findUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

const findUserById = async (id) => {
    return await User.findByPk(id);
};

const createUser = async (nombre, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await User.create({ nombre, email, password: hashedPassword });
};

const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

const getAllUsers = async () => {
    return await User.findAll({ attributes: ['id', 'nombre', 'email'] });
};

module.exports = { findUserByEmail, findUserById, createUser, verifyPassword, getAllUsers };
