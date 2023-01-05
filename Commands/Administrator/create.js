const { EmbedBuilder } = require('discord.js')
var { db, Temp, Command } = require('../../Builder')

new Command('Administrator')
    .setName('chammelcreate', 'cc')
    .setDescription('新增頻道')
    .setExample('chammeladd 新頻道', 'chammeladd 新頻道 [parent]')
    .setPremissions('ManageChannels')
    .setexec(async (message, args) => {
        if (!message.inGuild()) return
        if (!args[1]) args[1] = message.channel.name
        var ch = await message.guild.channels.create({ name: args[1], parent: args[2] ?? message.channel.parentId })
        message.channel.send({ embeds: [new EmbedBuilder().setDescription(`已建立 ${ch}`)] })
    })
    .setName('rolecteate', 'rc')
    .setDescription('新增身份組')
    .setExample(`roleadd 新身份組 #ff679d`,`ra 新身份組`)
    .setPremissions('ManageRoles')
    .setexec(async (message, args) => {
        if (!message.inGuild()) return
        if (!args[1]) args[1] = `新身份組`
        var ch = await message.guild.roles.create({ name: args[1] })
        message.channel.send({ embeds: [new EmbedBuilder().setDescription(`已建立 ${ch}`)] })
    })
    
    .setName('autovoicechannel', 'avch')
    .setDescription('自動語音頻道')
    .setExample(`autovoicechannel 語音頻道`,`autovoicechannel`)
    .setPremissions('Administrator')
    .setexec(async (message, args) => {
        if (!message.inGuild()) return
        var ch = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel
        if(!ch.isVoiceBased()) return
        db.prepare(`update guildconfig set autovoicechannel = '${ch.id}' where guildid = '${message.guildId}'`).run()
        message.channel.send({ embeds: [new EmbedBuilder().setDescription(`當使用者加入 ${ch} 後 將會自動一個語音頻道`)] })
    })