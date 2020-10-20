const { ping, getCoins } = require('../coingecko.js');
const crawl_transaction = require('../crawlers/crawler_transaction.js');

// var job = new CronJob(
//   '*/5 * * * * *',
//   function() {
//     console.log('run every 5s')
//     ping()
//   },
//   null,
//   true,
//   'America/Los_Angeles'
// );
// job.start()