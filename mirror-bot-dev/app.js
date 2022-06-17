const { webhookName, webhookAvatar, accounts, blacklistChannels, destinationServerOwnerToken, destinationServerId, targetServers } = require('./config');
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
    
        //  get guild from message
        const guild = message.guild.id.toString();
        //  get channel name from message
        const channelName = message.channel.name;
    
        //  get channel id from message
        const channelId = message.channel.id;
  
        //  get category name from message
        const categoryName = message.channel?.parent?.name || "";

        //  check if channel type is text
        if (message.channel.type !== 'GUILD_TEXT') {
          // console.log(`${channelName} is not a text channel`);
          return;
        }
  
        //  if guild is not a targetServer, do nothing
        if (!targetServers.includes(guild)) {
          // console.log(`${guild} is not a target server.`);
          return;
        }
    
        //  if msg came from a blacklisted channel, do nothing
        if (blacklistChannels?.includes(channelName)) {
          // console.log(`${channelName} is blacklisted, ignoring message`);
          return;
        }
    
        //  wait for specified time, (particular to this instance of the bot)
        await SelfBot.wait(this.botNumber);
        //  if msg is not in the buffer, add it
        if (!SelfBot.msgBuffer.includes(message.id)) {
          SelfBot.msgBuffer.push(message.id);
        } else {
          //  if msg is in the buffer, do nothing
          return;
        }
    
        //  get destination server
        const destinationServer = destinationServerOwner?.guilds?.cache?.get(destinationServerId);
        if (!destinationServer) {
          console.log(`${destinationServer} is not a valid server.`);
          return;
        }

        // check if category exists or create it
        const destinationCategory = destinationServer?.channels?.cache?.find(channel => channel.name === categoryName && channel.type === 'GUILD_CATEGORY');
        if (!destinationCategory && categoryName) {
          console.log(`${categoryName} category doesn't exist, creating it.`);
          await destinationServer.channels.create(categoryName, { type: 'GUILD_CATEGORY' });
        }

        //  check if channel exists or create it
        const destinationChannel = destinationServer?.channels?.cache?.find(channel => channel.name === channelName);
        //  if destination channel does not exist, create it
        if (!destinationChannel) {
          console.log(`${channelName} does not exist, creating it`);
          await destinationServer?.channels?.create(channelName, { type: 'GUILD_TEXT' });
        }
    
        //  get destination channel by name
        const channel = destinationServer?.channels?.cache.find(channel => channel.name === channelName && channel.type === 'GUILD_TEXT');
        if (!channel) {
          console.log(`Failed to create ${channelName}!`);
          return;
        }

        //  get destination category by name
        const category = destinationServer?.channels?.cache.find(channel => channel.name === categoryName && channel.type === 'GUILD_CATEGORY');
        if (!category) {
          console.log(`Failed to create ${categoryName}!`);
        }

        //  add channel to category
        if (category && channel) {
          await channel.setParent(category);
        }

        //  check if channel has webhook
        const destinationChannelWebhook = await channel?.fetchWebhooks();
        console.log(`${channelName} has ${destinationChannelWebhook.size} webhooks`);

        if (destinationChannelWebhook.size === 0) {
          //  create webhook
          console.log(`${channelName} has no webhook, creating one.`);
          await channel.createWebhook(`${channelName}`, {
            avatar: webhookAvatar,
            reason: 'Creating webhook for channel'
          });
        }
        //  fetch webhook again
        const webhookCollection = await channel?.fetchWebhooks();
        const webhook = await webhookCollection?.first();

        if (!webhook) {
          console.log(`${channelName} failed to create webhook.`);
          return;
        }

        await client.sendMessage(webhook, message);;
    
      });
    
    });
    
  } catch (error) {
    
  }
})();

