const { Client } = require('discord.js-selfbot-v13');

class SelfBot {
  static msgBuffer = [];
  static botCount = 0;

  static wait = (seconds) => 
    new Promise(resolve => 
      setTimeout(() => 
        resolve(true), seconds * 1000))

  constructor(token) {
    SelfBot.botCount++;
    this.client = new Client();
    this.token = token;
    this.client.on('ready', () => {
      this.tag  = this.client.user.tag;
      this.id   = this.client.user.id;
      this.name = this.client.user.username;
      console.log(`${this.client.user.tag} is online!`);
    })
    this.botNumber = SelfBot.botCount;
  }

  async login() {
    await this.client.login(this.token);
  }

  async on(event, callback) {
    this.client.on(event, callback);
  }

  async sendMessage(webhook, message) {
    try {

      if (message?.embeds.length > 0) {
        //  send message to webhook
        await webhook?.send({
          username: webhookName,
          avatarURL: webhookAvatar,
          embeds: message.embeds
        });
      } else {
        const files = message.attachments.map(attachment => {
          return {
            attachment: attachment.attachment,
            name: attachment.name,
            description: attachment.description,
          }
        });
        await webhook.send({
          content: message.content.length > 0 ? message.content : 'no content',
          files
        });
      }

    } catch (e) {
      console.log(e);
    }
  }

}

module.exports = SelfBot;