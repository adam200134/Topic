const { EmbedBuilder } = require('discord.js')
const { client, Command } = require('../../Builder')
new Command('utility')
    .setName('guildrole', 'gr').setDescription('看看伺服器的身份組')
    .setexec((message, args) => {
        var user = message.mentions.users.first() || message.author

        var role = message.guild.members.cache.get(user.id).roles.cache
            .filter(r => r.id != message.guild.id)
            .map(r => r.toString())

        var embed = new EmbedBuilder()
            .setDescription(`**${user} has :**\n${role}`)
            .setTimestamp()

        message.channel.send({ embeds: [embed] })
    })
    .setName('roleuser', 'ru').setDescription('看看身分組有哪些人')
    .setexec((message, args) => {
        if(!message.inGuild()) return
        var role = message.mentions.roles.first() ?? message.guild.roles.cache.get(`${args[1]}`)
        if(!role) role = message.member.roles.highest()
        var user = []
        role.members.forEach(m => user.push(`${m.user}`))
        var embed = new EmbedBuilder()
            .setTitle(`${role.name} roles list`)
            .setDescription(`${user.join(' ')}`)
            .setTimestamp()

        message.channel.send({ embeds: [embed] })
    })
    .setName('guilddata', 'gd').setDescription('看看公會的普通資料')
    .setexec((message, args) => {
        var embed = new EmbedBuilder()
            .setTitle(`Total Members`)
            .setDescription(`👥 ${message.guild.memberCount}\n\n**Human**\n👤${message.guild.members.cache.filter(member => !member.user.bot).size}
        \n**Bot**\n🤖 ${message.guild.members.cache.filter(member => member.user.bot).size}`)
            .setThumbnail(message.guild.iconURL({ size: 4096, dynamic: true }))
            .setTimestamp()
        message.channel.send({ embeds: [embed] })
    })