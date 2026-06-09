import { liteClient } from 'algoliasearch/lite';

const client = liteClient('TXFAPWRDB1', 'ccce008e6d7ef0ef672dc4251ed98ca5');
client.search({
  requests: [{ indexName: 'omnidex_games', query: 'mario' }]
}).then(console.log).catch(console.error);
