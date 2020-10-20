const rp = require("request-promise");
const cheerio = require("cheerio");
const Address = require('../database/address.js');
const AddressHistory = require('../database/address_history.js');

async function crawler_transaction(address) {
    console.log('----- crawling address : ', address);
    const URL = `https://etherscan.io/address/` + address;
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

    let etherBalanceStr = $("#ContentPlaceHolder1_divSummary .row .h-100 .card-body .align-items-center .col-md-8").first().text();
    let etherValueStr = $("#ContentPlaceHolder1_divSummary .row .h-100 .card-body .align-items-center .col-md-8").eq(1).text();
    let ether_value =  getNumber(etherValueStr.split(' ')[0]);
    let token_value = getNumber($("#availableBalanceDropdown").text());
    let token_quantity = getNumber($("#availableBalanceDropdown .badge").text().replace(">", ""));

    const addressModel = await AddressHistory.create({
        address,
        address_id: 1,
        ether_balance: getNumber(etherBalanceStr.trim().replace(" Ether", "")),
        ether_value,
        token_value,
        token_quantity,
    });
    console.log('addressModel: ', addressModel);

}

var getNumber = function(str) {
    let num = Number(str.replace(/[^0-9.-]+/g,""));
    if (typeof num != 'number') {
        return 0;
    }

    return num
};

module.exports = crawler_transaction;

