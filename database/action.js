const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');

const Action = sequelize.define('Action', {
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
    transaction_id: {
        type: DataTypes.BIGINT
    },
    txn_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    from: {
        type: DataTypes.STRING
    },
    from_name: {
        type: DataTypes.STRING
    },
    input: {
        type: DataTypes.FLOAT
    },
    input_coin: {
        type: DataTypes.STRING
    },
    to: {
        type: DataTypes.STRING
    },
    to_name: {
        type: DataTypes.STRING
    },
    output: {
        type: DataTypes.FLOAT
    },
    output_coin: {
        type: DataTypes.STRING
    },
    output_coin_address_hash: {
        type: DataTypes.STRING
    },
    exchange: {
        type: DataTypes.STRING
    },
    action: {
        type: DataTypes.STRING
    },
    action_full: {
        type: DataTypes.STRING
    },
}, {
    tableName: 'actions',
    timestamps: false,
});

module.exports = Action;