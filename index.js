var createError = require('http-errors');
var CronJob = require('cron').CronJob;
const express = require('express');
const {crawler_transactions, crawler_transaction_detail} = require('./crawlers/crawler_transaction.js');

const address = '0xf1e8a3999e6c3bb9a518c3ef7f9bf621586a76ff';
let p=1;
crawler_transactions(address, p);

// transaction = { address: '38f838f38', txn_hash: "0x9e1213af2467ab7348c51a2186899d80892bcbf607fd1f21d58876f4e5843d3d"};
// crawler_transaction_detail(transaction);

const { Op } = require('sequelize');
const Transaction = require('./database/transaction.js');
const Action = require('./database/action.js');


app = express();

app.use('/transactions', async function(req, res, next) {
    const transactions = await Transaction.findAll({
        limit: 20,
        raw: true,
        order: [
            ['timestamp', 'desc'],
        ],
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

app.listen(3000);
