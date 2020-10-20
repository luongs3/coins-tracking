const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');
const Action = require('./action');

const Transaction = sequelize.define('Transaction', {
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
    txn_hash: {
        type: DataTypes.STRING
    },
    block: {
        type: DataTypes.BIGINT
    },
    timestamp: {
        type: DataTypes.TIME,
        defaultValue: Sequelize.NOW,
    },
    from: {
        type: DataTypes.STRING
    },
    from_name: {
        type: DataTypes.STRING
    },
    direction: {
        type: DataTypes.STRING
    },
    to: {
        type: DataTypes.STRING
    },
    to_name: {
        type: DataTypes.STRING
    },
    value_eth: {
        type: DataTypes.FLOAT
    },
    transaction_fee: {
        type: DataTypes.FLOAT
    },
    transaction_fee_usd: {
        type: DataTypes.FLOAT
    },
    status: {
        type: DataTypes.STRING
    },
    nounce: {
        type: DataTypes.STRING
    },
    gas_price: {
        type: DataTypes.FLOAT
    },
    gas_price_gwei: {
        type: DataTypes.FLOAT
    },
}, {
    tableName: 'transactions',
    timestamps: false,
});

Transaction.Actions = Transaction.hasMany(Action,{
    foreignKey: 'transaction_id'
});

module.exports = Transaction;