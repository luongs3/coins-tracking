//1. Import coingecko-api
const CoinGecko = require('coingecko-api');

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

var ping = async() => {
  let data = await CoinGeckoClient.ping();
  console.log('data: ', data);
};
var getCoins = async(page) => {
  const params = {per_page: 10, page}
  let data = await CoinGeckoClient.coins.markets(params);
  console.log('data: ', data);
};

module.exports = { getCoins, ping }
