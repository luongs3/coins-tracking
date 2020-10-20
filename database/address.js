const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');

module.exports = sequelize.define('Address', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.BIGINT
    },
    created_at: {
        type: DataTypes.TIME,
        default: Date.now(),
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address_name: {
        type: DataTypes.STRING
    },
    main_net: {
        type: DataTypes.STRING
    },
    is_tracking: {
        type: DataTypes.BOOLEAN
    },
}, {
    tableName: 'addresses',
    timestamps: false,
});