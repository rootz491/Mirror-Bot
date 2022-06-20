# Mirror Bot

##  Requirements

- mirror channels and or categories from another server using self bot
- multiple self bots
- Can it edit embeds that get mirrored? yes, via config.json file, variable name `footer`


##  How to use [config file]

* `accounts` - list of tokens to use for each self-bot
* `whitelistChannels` - list of channels to listen to
* `whitelistCategories` - list of categories to listen to

> bot will listen to all channels and categories in `whitelistChannels` and `whitelistCategories`

* `destinationServerId` - id of server to mirror to
* `destinationServerOwnerToken` - token of server owner (for permissions)

* `footer` - text to use for embed footer

* `webhookName` - name of webhook
* `webhookAvatar` - avatar of webhook i.e. img url


##  Start the bot

once you have the config file, you can start the bot with:
```
npm install
npm start
```