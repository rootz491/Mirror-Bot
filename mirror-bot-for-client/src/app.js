const { webhookAvatar, accounts, whitelistChannels, whitelistCategories, destinationServerOwnerToken, destinationServerId } = require('./config');
const SelfBot = require('./bot');
const { Client } = require('discord.js-selfbot-v13');

(async () => {
  try {
    const destinationServerOwner = new Client();
    await destinationServerOwner.login(destinationServerOwnerToken);
    
    accounts.map(async (token) => {
      const client = new SelfBot(token);
      await client.login();
    
      client.on('messageCreate', async (message) => {
        try {
          const guild = message?.guild?.id?.toString();
  
          const channelName = message.channel.name;
          const channelId = message.channel.id;
          const categoryName = message.channel?.parent?.name || "";
          const categoryId = message.channel?.parent?.id || "";
          if (message.channel.type !== 'GUILD_TEXT') {
            return;
          }
          let isWhiteListed = false;
          if (whitelistChannels?.includes(channelId)) {
            isWhiteListed = true;
          }
          if (whitelistCategories?.includes(categoryId)) {
            isWhiteListed = true;
          }
          if (!isWhiteListed) {
            return;
          }
          await SelfBot.wait(this.botNumber);
          if (!SelfBot.msgBuffer.includes(message.id)) {
            SelfBot.msgBuffer.push(message.id);
          } else {
            return;
          }
          const destinationServer = destinationServerOwner?.guilds?.cache?.get(destinationServerId);
          if (!destinationServer) {
            // console.log(`${destinationServer} is not a valid server.`);
            return;
          }
          const destinationCategory = destinationServer?.channels?.cache?.find(channel => channel.name === categoryName && channel.type === 'GUILD_CATEGORY');
          if (!destinationCategory && categoryName) {
            // console.log(`${categoryName} category doesn't exist, creating it.`);
            await destinationServer.channels.create(categoryName, { type: 'GUILD_CATEGORY' });
          }
          const destinationChannel = destinationServer?.channels?.cache?.find(channel => channel.name === channelName);
          if (!destinationChannel) {
            // console.log(`${channelName} does not exist, creating it`);
            await destinationServer?.channels?.create(channelName, { type: 'GUILD_TEXT' });
          }
      
          const channel = destinationServer?.channels?.cache.find(channel => channel.name === channelName && channel.type === 'GUILD_TEXT');
          if (!channel) {
            // console.log(`Failed to create ${channelName}!`);
            return;
          }
          const category = destinationServer?.channels?.cache.find(channel => channel.name === categoryName && channel.type === 'GUILD_CATEGORY');
          if (!category) {
            // console.log(`Failed to create ${categoryName}!`);
          }
          if (category && channel) {
            await channel.setParent(category);
          }
          const destinationChannelWebhook = await channel?.fetchWebhooks();
          // console.log(`${channelName} has ${destinationChannelWebhook.size} webhooks`);
          if (destinationChannelWebhook.size === 0) {
            // console.log(`${channelName} has no webhook, creating one.`);
            await channel.createWebhook(`${channelName}`, {
              avatar: webhookAvatar,
              reason: 'Creating webhook for channel'
            });
          }
          const webhookCollection = await channel?.fetchWebhooks();
          const webhook = await webhookCollection?.first();
          if (!webhook) {
            // console.log(`${channelName} failed to create webhook.`);
            return;
          }
          await client.sendMessage(webhook, message);;
          
        } catch (error) {
          console.log(error);
        }
      });
    
    });

  } catch (error) {
    console.log(error);
  }
})();

