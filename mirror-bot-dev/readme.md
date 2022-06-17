# Mirror Bot

##  Requirements

- mirror channels and or categories from another server using self bot
- multiple self bots
- Can it edit embeds that get mirrored? NOPE


##  How to use [config file]

* `accounts` - list of tokens to use for each self-bot
* `blacklistChannels` - list of channels to ignore
* `targetServers` - list of id of servers to mirror

* `destinationServerId` - id of server to mirror to
* `destinationServerOwnerToken` - token of server owner (for permissions)

* `webhookName` - name of webhook
* `webhookAvatar` - avatar of webhook i.e. img url


##  Start the bot

once you have the config file, you can start the bot with:
```
npm start
```