const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');

module.exports = sequelize.define('address_history', {
    // Model attributes are defined here
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.BIGINT
    },
    created_at: {
        type: DataTypes.TIME,
        defaultValue: Sequelize.NOW,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address_id: {
        type: DataTypes.BIGINT
    },
    ether_balance: {
        type: DataTypes.FLOAT
    },
    ether_value: {
        type: DataTypes.FLOAT
    },
    token_quantity: {
        type: DataTypes.FLOAT
    },
    token_value: {
        type: DataTypes.FLOAT
    }
}, {
    tableName: 'address_history',
    timestamps: false,
});