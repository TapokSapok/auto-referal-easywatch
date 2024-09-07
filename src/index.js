const { configDotenv } = require('dotenv');
const { Telegraf } = require('telegraf');
const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
configDotenv('.');

const bot = new Telegraf('7484638081:AAEZGvS23sfjJEBdKia2q_7sWddC4J1Tu3k');

const APP_ID = 2040;
const APP_HASH = 'b18441a1ff607e10a989891a5462e627';

let session = new StringSession('');
let client;
let status = 'DONE';

let data = {
	phoneNumber: null,
	phoneCodeHash: null,
	phoneCode: null,
};

bot.on('message', async ctx => {
	const text = ctx.message.text;

	if (status === 'CODE_REQUESTED') {
		try {
			data.phoneCode = text;

			const signinRes = await client.invoke(
				new Api.auth.SignIn({
					phoneNumber: data.phoneNumber,
					phoneCodeHash: data.phoneCodeHash,
					phoneCode: data.phoneCode,
				})
			);

			const result = await client.invoke(
				new Api.messages.StartBot({
					bot: 'ESWatch_bot',
					peer: 'ESWatch_bot',
					randomId: BigInt('-4156887774564'),
					startParam: process.env.REF,
				})
			);

			ctx.reply('Реферал применён');

			removeData();
		} catch (error) {
			removeData();
			ctx.reply('Ошибка авторизации', error.message);
		}
	} else {
		try {
			client = new TelegramClient(session, APP_ID, APP_HASH);
			await client.connect();

			data.phoneNumber = text;

			const scodeRes = await client.invoke(
				new Api.auth.SendCode({
					phoneNumber: data.phoneNumber,
					apiId: APP_ID,
					apiHash: APP_HASH,
					settings: new Api.CodeSettings({
						allowFlashcall: true,
						currentNumber: true,
						allowAppHash: true,
						allowMissedCall: true,
					}),
				})
			);

			data.phoneCodeHash = scodeRes.phoneCodeHash;

			ctx.reply('Запросил код', data.phoneNumber);
			status = 'CODE_REQUESTED';
		} catch (error) {
			removeData();
			ctx.reply('Ошибка отправки кода', error.message);
		}
	}
});

async function removeData() {
	session = new StringSession('');
	client = null;
	status = 'DONE';
	data = {
		phoneNumber: null,
		phoneCodeHash: null,
		phoneCode: null,
	};
}

bot.launch();
