const { EmbedBuilder } = require("discord.js")
const { Command, db } = require("../../Builder")

new Command('Administrator')
    .setName('logset')
    .setDescription(`loggerlist: message\nvoicestage\nservermember`)
    .setExample('logset message', 'logset all [channelid]')
    .setPremissions('Administrator')
    .setexec(async (message, args) => {
        if (!args[1]) return
        args[2] ??= message.mentions.channels.first()?.id || message.channelId
        var loglist = ['message', 'voicestage', 'servermember']
        if (args[1] === 'all') {
            db.prepare(`update guildconfig 
                        set message = '${args[2]}', 
                            voicestage = '${args[2]}', 
                            servermember = '${args[2]}'
                        where guildid = '${message.guildId}'`).run()
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setDescription(`將 ${loglist.join(', ')} 記錄到 <#${args[2]}>`)]
            })
        }
        else if (loglist.includes(args[1])) {
            db.prepare(`update guildconfig 
                        set ${args[1]} = '${args[2]}' 
                        where guildid = '${message.guildId}'`).run()
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setDescription(`將 ${args[1]} 記錄到 <#${args[2]}>`)]
            })
        }
    })
    .setName('logremove', 'logrm')
    .setDescription(`loggerlist: message\nvoicestage\nservermember`)
    .setExample('logrm all', 'logremove message')
    .setPremissions('Administrator')
    .setexec(async (message, args) => {
        if (!args[1]) return
        var loglist = ['message', 'voicestage', 'servermember']
        args[2] ??= message.mentions.channels.first()?.id || message.channelId
        if (args[1] === 'all') args[1] = loglist.map(x => `${x} = "${args[2]}" `).join(',')
        else if (loglist.includes(args[1])) args[1] += ` = ""`
        db.prepare(`update guildconfig set ${args[1]} where guildid = '${message.guildId}'`).run()
        message.channel.send({ embeds: [new EmbedBuilder().setDescription(`將 ${loglist} 移除`)] })
    })