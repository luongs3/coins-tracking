const rp = require("request-promise");
const cheerio = require("cheerio");
const Transaction = require('../database/transaction.js');
const Action = require('../database/action.js');

async function crawler_transactions(address, p) {
    console.log(`----- crawling transaction of address [${address}] page ${p}`);

    const URL = `https://etherscan.io/txs?a=${address}&p=${p}`;
    const options = {
        uri: URL,
        transform: function (body) {
            return cheerio.load(body);
        },
    };
    try {
        var $ = await rp(options);
    } catch (error) {
        return error;
    }

    let maxPage = $("ul.pagination li.page-item span.page-link strong").last().text();
    if (p > maxPage) {
        console.log('Max Page. Return...................');
        return;
    }

    const transactionRows = $("table tbody tr");
    let transactionCrawlerFailCounter = 0;
    for (let i = 0; i < transactionRows.length; i++) {
        let transactionRow = $(transactionRows[i]);
        let txn_hash = transactionRow.find(".hash-tag a.myFnExpandBox_searchVal").text().trim();
        // if (txn_hash !== "0x93b60192e679bd115a7cbdee75bb8f24a567ac3d37d786198e833db1875086b1") {
        //     continue;
        // }

        console.log(`[${i}] transaction  : ${txn_hash}`);
        let block = getNumber(transactionRow.find("td").eq(2).find("a").text().trim());
        let timestamp = transactionRow.find("td").eq(3).text();
        let from = transactionRow.find("td").eq(5).text();
        let direction = transactionRow.find("td").eq(6).text();
        let to_name = transactionRow.find("td").eq(7).text();
        let to = transactionRow.find("td").eq(7).find("a").prop('href');
        if (to) {
            to = to.replace("/address/", "");
        }
        let value_eth = getNumber(transactionRow.find("td").eq(8).text().replace(" Ether", ""));
        let transaction_fee = getNumber(transactionRow.find("td").eq(9).text());
        let transaction = {
            address,
            address_id: 1,
            txn_hash,
            block,
            timestamp,
            from,
            direction,
            to_name,
            to,
            value_eth,
            transaction_fee,
        };
        const transactionModel = await crawler_transaction_detail(transaction);
        if (transactionModel == null) {
            transactionCrawlerFailCounter++;
        }

        if (transactionCrawlerFailCounter === 3) {
            console.log("Fail 3 times. STOP........................");
            return;
        }
    }

    await sleep(4000);
    await crawler_transactions(address, p + 1);
}

async function crawler_transaction_detail(transaction) {
    const URL = `https://etherscan.io/tx/` + transaction.txn_hash;
    const options = {
        uri: URL,
        transform: function (body) {
            return cheerio.load(body);
        },
    };
    try {
        var $ = await rp(options);
    } catch (error) {
        return error;
    }

    const transactionProperties = $("#ContentPlaceHolder1_maintable div.row");
    let status = transactionProperties.eq(1).find(".col-md-9").text().trim();
    if (status !== 'Success') {
        return saveTransaction({
            ...transaction,
            status,
        });
    }
    let from_name = transactionProperties.eq(4).find(".col-md-9 a").text().trim();
    transaction = {
        ...transaction,
        status,
        from_name,
    };

    // const transactionModel = {id: 1};
    const transactionModel = await saveTransaction(transaction);
    if (transactionModel == null) {
        return null
    }

    // let actionLabel = transactionProperties.eq(6).find("div.col-md-3").text().trim();
    // Transaction Action: || Tokens Transferred:
    let actionElements = transactionProperties.eq(6).find(".col-md-9 ul li.media");
    let firstAction = $(actionElements).first().find("div.media-body span").eq(0).text().trim();
    const actions = [];
    for (let j = 0; j < actionElements.length; j++) {
        let actionTemp;
        switch (firstAction) {
            case 'Swap':
                actionTemp = extractSwapAction($, actionElements[j], transactionModel);
                break;
            case 'Approved':
                actionTemp = extractApprovedAction($, actionElements[j], transactionModel);
                break;
            case 'From':
                actionTemp = extractTransferAction($, actionElements[j], transactionModel);
                break;
            default:
                actionTemp = extractSwapAction($, actionElements[j], transactionModel);
                break;
        }

        if (firstAction != null) {
            actions.push(actionTemp);
        }
    }

    if (actions.length > 0) {
        const actionModels = await saveActions(actions);
    }

    return transactionModel;
}

function extractSwapAction($, actionElement, transactionModel) {
    let action = $(actionElement).find("div.media-body span").eq(0).text().trim();
    let input = getNumber($(actionElement).find("div.media-body span").eq(1).text());
    let input_coin = $(actionElement).find("div.media-body span").eq(2).text();
    let output = 0;
    let output_coin = '';
    let output_coin_address_hash = '';
    if (input_coin === 'For') {
        // swap other coin for ether
        input_coin = $(actionElement).find("div.media-body a").eq(0).text();
        output = getNumber($(actionElement).find("div.media-body span").eq(3).text());
        output_coin = $(actionElement).find("div.media-body span").eq(4).text();
    } else {
        output = getNumber($(actionElement).find("div.media-body span").eq(4).text());
        output_coin = $(actionElement).find("div.media-body a").text();
    }

    let exchange = $(actionElement).find("div.media-body span").last().text().trim();
    let action_full = `${action} ${input} ${input_coin} for ${output} ${output_coin} on ${exchange}`;

    return {
        txn_hash: transactionModel.txn_hash,
        transaction_id: transactionModel.id,
        from: transactionModel.from,
        from_name: transactionModel.from_name,
        to: transactionModel.to,
        to_name: transactionModel.to_name,
        action,
        input,
        input_coin,
        output,
        output_coin,
        output_coin_address_hash,
        exchange,
        action_full,
    };
}

function extractApprovedAction($, actionElement, transactionModel) {
    let action = $(actionElement).find("div.media-body span").eq(0).text().trim();
    let input = 0;
    let input_coin = $(actionElement).find("div.media-body a").first().text();
    let output = 0;
    let output_coin = input_coin;
    let output_coin_address_hash = $(actionElement).find("div.media-body a").first().prop('href');
    if (output_coin_address_hash) {
        output_coin_address_hash = output_coin_address_hash.replace("/token/", "");
    }
    let exchange = $(actionElement).find("div.media-body a").last().text().trim();
    let action_full = `${action} ${input_coin} For Trade On ${exchange}`;

    return {
        txn_hash: transactionModel.txn_hash,
        transaction_id: transactionModel.id,
        from: transactionModel.from,
        from_name: transactionModel.from_name,
        to: transactionModel.to,
        to_name: transactionModel.to_name,
        action,
        input,
        input_coin,
        output,
        output_coin,
        output_coin_address_hash,
        exchange,
        action_full,
    };
}

function extractTransferAction($, actionElement, transactionModel) {
    let action = $(actionElement).find("div.media-body span").eq(0).text().trim();
    let from = $(actionElement).find("div.media-body span").eq(1).text().trim();
    let to = $(actionElement).find("div.media-body span").eq(3).find('a').prop('href');
    if (to) {
        to = to.replace("/token/", "").replace("?a=" + from, "")
    }
    let to_name = $(actionElement).find("div.media-body span").eq(3).text().trim();

    let input = 0;
    let input_coin = '';
    let outputStr = $(actionElement).find("div.media-body span").eq(7).text().trim();
    let output = getNumber(outputStr.split(" ")[0]);
    let output_coin = $(actionElement).find("div.media-body a").last().text().trim();
    let output_coin_address_hash = $(actionElement).find("div.media-body a").last().prop('href');
    if (output_coin_address_hash) {
        output_coin_address_hash = output_coin_address_hash.replace("/token/", "");
    }
    let exchange = '';
    let action_full = `${action} ${from} TO ${to} For ${output} ${outputStr}`;

    return {
        txn_hash: transactionModel.txn_hash,
        transaction_id: transactionModel.id,
        from: from,
        from_name: transactionModel.from_name,
        to: to,
        to_name: to_name,
        action,
        input,
        input_coin,
        output,
        output_coin,
        output_coin_address_hash,
        exchange,
        action_full,
    };
}

const saveActions = async function(actions) {
    try {
        return await Action.bulkCreate(actions);
    } catch (e) {
        console.log('e: ', e);
        console.log('actions: ', actions);
        return null
    }
};

const saveTransaction = async function(transaction) {
    try {
        return await Transaction.create(transaction);
    } catch (e) {
        console.log('e: ', e);
        return null
    }
};

const getNumber = function(str) {
    let num = Number(str.replace(/[^0-9.-]+/g,""));
    if (typeof num != 'number') {
        return 0;
    }

    return num
};

function sleep(ms) {
    console.log('take a break......');
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {crawler_transactions, crawler_transaction_detail};

