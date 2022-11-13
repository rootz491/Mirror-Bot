const {
	accounts,
	whitelistChannels,
	whitelistCategories,
	destinationServerOwnerToken,
	destinationServerId,
	webhookName,
	webhookAvatar,
} = require("./config");
const SelfBot = require("./bot");
const { Client } = require("discord.js-selfbot-v13");

(async () => {
	try {
		const destinationServerOwner = new Client({
			checkUpdate: false,
		});
		await destinationServerOwner.login(destinationServerOwnerToken);

		accounts.map(async (token) => {
			const client = new SelfBot(token);
			await client.login();

			client.on("messageCreate", async (message) => {
				try {
					const channelName = message.channel.name;
					const channelId = message.channel.id;
					const categoryId = message.channel?.parent?.id || "";
					if (message.channel.type !== "GUILD_TEXT") {
						return;
					}
					const isCorrectChannel = whitelistChannels?.find(
						(channel) => channel?.targetChannelId === channelId
					);

					await SelfBot.wait(this.botNumber);
					if (!SelfBot.msgBuffer.includes(message.id)) {
						SelfBot.msgBuffer.push(message.id);
					} else {
						return;
					}

					const destinationServer =
						destinationServerOwner?.guilds?.cache?.get(destinationServerId);
					if (!destinationServer) {
						console.log(`${destinationServer} is not a valid server.`);
						return;
					}

					//  check if channel is from whitelistedChannel
					if (isCorrectChannel?.targetChannelId === channelId) {
						await destinationServer.channels.fetch();
						const destinationChannel = destinationServer.channels.cache.find(
							(channel) => channel.id === isCorrectChannel.destinationChannelId
						);
						await sendMsgThruWebhook(
							destinationChannel,
							channelName,
							client,
							message,
							isCorrectChannel.type
						);
						return;
					}

					//  check if message is from whitelistedCategory
					const isCorrectCategory = whitelistCategories.find((category) => {
						if (
							categoryId === category.targetCategoryId &&
							!category.blacklistChannels.includes(channelId)
						)
							return category;
					});

					if (!isCorrectCategory) {
						return;
					}

					const destinationCategory = destinationServer.channels.cache.find(
						(channel) => channel.id === isCorrectCategory?.destinationCategoryId
					);

					if (!destinationCategory) {
						console.log(
							"destination category doesn't exist in destination server"
						);
					}

					const destinationChannel = destinationCategory.children.find(
						(channel) => channel.name === channelName
					);

					if (!destinationChannel) {
						console.log(`${channelName} does not exist, creating it`);
						await destinationServer?.channels?.create(channelName, {
							type: "GUILD_TEXT",
							parent: isCorrectCategory?.destinationCategoryId,
						});
					}

					const channel = destinationServer?.channels?.cache.find(
						(channel) =>
							channel.name === channelName && channel.type === "GUILD_TEXT"
					);

					await sendMsgThruWebhook(channel, channelName, client, message, 'bot');
				} catch (error) {
					console.log("messageCreate Err: " + error);
				}
			});
		});
	} catch (error) {
		console.log("app Err: " + error);
	}
})();

const sendMsgThruWebhook = async (
	channel,
	channelName,
	client,
	message,
	type
) => {
	try {
		const destinationChannelWebhook = await channel?.fetchWebhooks();
		const hookName = type === "bot" ? webhookName : message.author.username;
		const hookAvatar =
			type === "bot" ? webhookAvatar : await message.author.displayAvatarURL();
		let currentUserWebhook = null;

		if (destinationChannelWebhook != null)
			currentUserWebhook = destinationChannelWebhook.find(
				(webhook) => webhook.name === hookName
			);
		if (currentUserWebhook == null) {
			const avatar = await hookAvatar;
			await channel.createWebhook(hookName, {
				avatar,
				reason: "Creating webhook for channel",
			});
		}
		const webhookCollection = await channel?.fetchWebhooks();
		const webhook = webhookCollection.find(
			(webhook) => webhook.name === hookName
		);
		console.log(`Sending msg from Author ${message.author.tag}`);
		if (!webhook) {
			console.log(`${channelName} failed to create webhook.`);
			return;
		}
		await client.sendMessage(webhook, message);
	} catch (error) {
		console.log("sendMsgThruWebhook Err: " + error);
	}
};
