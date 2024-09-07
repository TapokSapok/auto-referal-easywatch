import { LZTApi } from '@lolzteam/sdk';
import { configDotenv } from 'dotenv';
configDotenv('.');

const api = new LZTApi({
	token: process.env.LOLZ_API,
});

async function run() {
	const searchRes = await api.market.search({
		categoryName: 'telegram',
		pmax: 10,
		pmin: 2,
	});

	console.log(Object.keys(searchRes));

	const accounts = searchRes.items.map(acc => ({
		item_id: acc.item_id,
		telegram_id: acc.telegram_item_id,
		price: acc.price,
	}));
	console.log(accounts);
}
run();
