var createError = require('http-errors');
var CronJob = require('cron').CronJob;
const express = require('express');
const sequelize = require('./database/db.js');
const { QueryTypes } = require('sequelize');
const {crawler_transactions, crawler_transaction_detail} = require('./crawlers/crawler_transaction.js');

// const address = '0xf1e8a3999e6c3bb9a518c3ef7f9bf621586a76ff';
// let p=1;
// crawler_transactions(address, p);

// transaction = { address: '38f838f38', txn_hash: "0x9e1213af2467ab7348c51a2186899d80892bcbf607fd1f21d58876f4e5843d3d"};
// crawler_transaction_detail(transaction);

const { Op } = require('sequelize');
const Transaction = require('./database/transaction.js');
const Action = require('./database/action.js');


app = express();

app.use('/transactions', async function(req, res, next) {
    let sql = genQuery(req);
    let transactions = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
    });
    const transactionIds = transactions.map(item => item.id);
    transactions.forEach(tran => tran.actions = []);
    const actions = await Action.findAll({
        where: {
            transaction_id: {
                [Op.in]: transactionIds
            }
        },
        order: [
            ['transaction_id'],
        ],
        raw: true,
    });

    actions.forEach(action => {
        for(let i=0; i<transactions.length; i++) {
            if (action.transaction_id === transactions[i].id) {
                transactions[i].actions.push(action);
            }
        }
    });

    res.json(transactions);
});

function genQuery(req) {
    let {limit=30, page=0, value_eth=0, action='', coin='', order_by=''} = req.query;
    let offset = page * limit;
    let sql = `
        select t.id, t.timestamp, t.from_name, t.to_name, t.value_eth, t.status,
               a.input, a.input_coin, a.action, a.output, a.output_coin from transactions t
        join actions a on t.id = a.transaction_id`;
    if (action !== '') {
        sql = `${sql} where a.action='${action}'`;

        if (coin !== '') {
            sql = `${sql} and (a.input_coin='${coin}' || a.output_coin='${coin}') `
        }
    }

    if (order_by !== '') {
        sql = `${sql} order by ${order_by} desc`
    }
    sql = `${sql} limit ${limit} offset ${offset}`;
    return sql;
}

app.listen(3000);
