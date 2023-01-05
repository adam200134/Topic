const { EmbedBuilder } = require('discord.js');
const { Command, Modules, Commands, Aliases } = require('../../Builder')
const { Prefix } = require('../../config.json');

new Command('help')
    .setName('help', 'h')
    .setDescription('指令幫助')
    .setExample('help CommandName', 'h CommandName')
    .setexec((message, args) => {
        if (!args[1]) return Commands.get('modules').exec(message, args)
        const src = (args[1].startsWith(Prefix))
            ? Commands.get(Aliases.get(args[1].slice(Prefix.length)))
            : Modules.get(args[1])
        if (!src) return Commands.get('modules').exec(message, args)
        const eb = new EmbedBuilder().setFooter({ text: `前綴: ${Prefix} | 模組:${src.module}` })
        if (Array.isArray(src)) {
            src.forEach(arg => eb.addFields({
                name: `${arg}`,
                value: '```css\n' + `[${Commands.get(Aliases.get(arg)).aliases.join('][')}]` + '\n```'
            }))
        } else {
            eb.addFields(
                { name: `${src.aliases.join('/')}`, value: `${src.description}` },
                { name: '使用範例', value: src.example.join('\n') })
        }
        message.channel.send({ embeds: [eb] })
    })
    .setName('modules', 'm')
    .setDescription('查找模組')
    .setExample('modules moduleName', 'm moduleName')
    .setexec((message, args) => {
        const eb = new EmbedBuilder().setFooter({ text: `前綴: ${Prefix}` })
        Modules.forEach((x, k) => {
            eb.addFields({
                name: `${k}`,
                value: '```\n' + `${x.join('\n')}` + '\n```', inline: true
            })
        })
        message.channel.send({ embeds: [eb] })
    })