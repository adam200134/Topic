const { Command, client } = require('../../Builder');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Canvas = require('canvas');

new Command('utility')
    .setName('avater', 'av')
    .setexec(async (message, args) => {
        var member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.member
        var user = message.mentions.users.first() || client.users.cache.get(args[1]) || message.author;
        if (!user) return
        var url = user.displayAvatarURL({ size: 4096, dynamic: true, format: "png" })
        const embed = new EmbedBuilder().setImage(url)
        if (member) embed.setDescription(`guild-avater: [url](${member.displayAvatarURL({ size: 4096, dynamic: true, format: "png" }) || url})\nuser-avater:`)
        message.channel.send({ embeds: [embed] })
    })
    .setName('say')
    .setexec((message, args) => {
        var msg = ''
        for (var i = 0; i < args.length; i++) {
            msg = message + ' ' + args[i]
        }
        message.channel.send(msg)
    })