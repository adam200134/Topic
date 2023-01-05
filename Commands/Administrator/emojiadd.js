const { EmbedBuilder } = require('discord.js')
var { Temp, Command } = require('../../Builder')
new Command('Administrator')
    .setName('emojiadd', 'ea')
    .setDescription('新增表情符號')
    .setExample('使用 emojiadd 訊息圖片附件', 'emojiadd <:0_wink:924623588059914300>', 'ea url')
    .setPremissions('ManageEmojisAndStickers')
    .setexec((message, args) => {
        var url, name
        const attachment = message.attachments.first()
        if (attachment) {
            url = attachment.url
            name = attachment.name
        } else if (args[1].startsWith('<')) {
            var emoji = args[1].split(':')
            url = `https://cdn.discordapp.com/emojis/${emoji[2].slice(0, -1)}.${emoji[0].includes('a') ? 'gif' : 'webp'}?size=4096&quality=lossless`
            name = emoji[1]
        } else {
            url = args[1]
            name = 'emoji'
        }
        message.guild.emojis.create(url, name).then(e => message.channel.send({ embeds: [new EmbedBuilder().setDescription(`已新增 ${e}`)] }))
    })
    .setName('addsticker', 'ast')
    .setDescription('新增貼圖')
    .setExample(`=ast [name?] [url]`)
    .setPremissions('ManageEmojisAndStickers')
    .setexec(async (message, args) => {
        var name, url
        if (args.length == 3) {
            name = args[1]
            url = args[2]
        } else if (args.length == 2) {
            url = args[1]
        } else if (message.attachments) {
            var attachment = message.attachments.first()
            name = attachment.name
            url = attachment.url
        }
        if (!url.endsWith('png')) return
        if (!name || name == null) {
            name = url.split('/').pop().split('.').shift()
        }
        await message.guild.stickers.create(url, name, null)
    })