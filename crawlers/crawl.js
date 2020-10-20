const {crawler_transactions, crawler_transaction_detail} = require('./crawler_transaction.js');
const address = '0xf1e8a3999e6c3bb9a518c3ef7f9bf621586a76ff';
let p=1;
crawler_transactions(address, p);

// transaction = { address: '38f838f38', txn_hash: "0x93b60192e679bd115a7cbdee75bb8f24a567ac3d37d786198e833db1875086b1"};
// crawler_transaction_detail(transaction);

const crawl_address = require('./crawler_address_history.js');
const address = '0xf1e8a3999e6c3bb9a518c3ef7f9bf621586a76ff';
crawl_address(address);
