const { Command, client } = require('../../Builder')

new Command('utility')
    .setName('ping').setDescription('檢測延遲').setExample(`=ping`)
    .setexec(async (message, args) => {
        await message.channel.send(`**${client.ws.ping/1000}ms**`)
    })