const { EmbedBuilder, Message } = require('discord.js')
const { Temp, Command, db } = require('../../Builder')
const { OwnerId } = require('../../config.json')
new Command('Administrator')
    .setName('autoreact', 'ar')
    .setDescription('開啟/關閉自定義反應')
    .setExample('autoreact')
    .setPremissions('Administrator')
    .setexec((message, args) => {
        var text
        if (db.prepare(`select channelid from autoreactchannel where channelid = '${message.channel.id}'`).get()?.channelid) {
            text = '`關閉`'
            db.prepare(`DELETE from autoreactchannel where channelid = '${message.channelId}'`).run()
        } else {
            text = '`開啟`'
            db.prepare(`INSERT OR IGNORE INTO autoreactchannel (guildid, channelid) VALUES ('${message.guildId}', '${message.channelId}')`).run()
        }
        message.channel.send({ embeds: [new EmbedBuilder().setDescription(`已在 ${message.channel} ${text}自動回覆`)] })
    })
    .setName('autoreactadd', 'ara')
    .setDescription('新增自定義反應')
    .setExample('ara 觸發訊息 回覆內容')
    .setPremissions('Administrator')
    .setexec((message, args) => {
        db.prepare(`INSERT OR IGNORE INTO  autoreact (guildid ,target, text) 
        VALUES ('${message.guildId ?? 0}','${args[1]}', '${args[2]}')`).run()
        message.channel.send({
            embeds: [new EmbedBuilder()
                .setDescription(`已新增\t觸發訊息: \`${args[1]}\`\n回覆內容: \`${args[2]}\``)]
        })
    })
    .setName('autoreactedit', 'are')
    .setDescription('編輯自定義反應')
    .setPremissions('Administrator')
    .setExample('autoreactedit id 回覆內容', 'are id 回覆內容')
    .setexec((message, args) => {

        db.prepare(`UPDATE autoreact SET text = '${args[2]}' WHERE id = ${args[1]}`).run()
        const react = db.prepare(`SELECT * FROM autoreact WHERE id = ${args[1]}`).get()
        message.channel.send({ embeds: [new EmbedBuilder().setDescription(`已修改自定義反應 \`#${react.id}\` ${react.target} 的回覆為 ${react.text}`)] })
    })
    .setName('autoreactlist', 'arl')
    .setDescription('自定義反應列表')
    .setExample('arl 1', 'arl')
    .setexec((message, args) => {
        if (message.author.id != OwnerId || !message.member.permissions.has('Administrator')) return
        const react = db.prepare(`SELECT count(id) AS count FROM autoreact`).get()
        const page = Math.floor(react.count / 10 + 1)
        var pg = Math.min(page, Number(args[1]) || 1)
        const m = message.channel.send({ embeds: [reactget(pg)] })
        m.then(/** @param {Message} msg */ msg => {
            msg.react('⬅️'); msg.react('➡️');
            msg.createReactionCollector({ time: 30000, filter: (r, u) => { return u } }).on('collect', (r, u) => {
                switch (r.emoji.name) {
                    case '⬅️': if (pg != 1) msg.edit({ embeds: [reactget(--pg)] }); break;
                    case '➡️': if (pg != page) msg.edit({ embeds: [reactget(++pg)] }); break;
                }
            })

        })
        function reactget(i) {
            var txt = `SELECT * FROM autoreact where guildid = '${message.guildId}' ORDER BY id ASC LIMIT 10 OFFSET ${(i - 1) * 10}`
            if (message.author.id == OwnerId) {
                txt = message.inGuild() ? `SELECT * FROM autoreact where guildid in ('${message.guildId}' , '0') ORDER BY id ASC LIMIT 10 OFFSET ${(i - 1) * 10}`
                    : `SELECT * FROM autoreact ORDER BY id ASC LIMIT 10 OFFSET ${(i - 1) * 10}`
            }
            const reactlist = db.prepare(txt).all()
            return new EmbedBuilder().setDescription(`自訂回覆數量: ${react.count}`)
                .addFields(
                    { name: 'id', value: reactlist.map(m => m.id).join('\n'), inline: true },
                    { name: '關鍵字', value: reactlist.map(m => m.target).join('\n'), inline: true },
                    { name: '回覆內容', value: reactlist.map(m => m.text).join('\n'), inline: true })
                .setFooter({ text: `Page: ${i}/${page}` })
        }
    })
