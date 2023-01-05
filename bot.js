const fs = require('fs');
const { Guild, EmbedBuilder } = require('discord.js');

const { Prefix, OwnerId, Token } = require('./config.json');
const { client, db, Commands, Aliases } = require('./Builder')
client.login(Token)

client.on("ready", () => {
    //#region  init db
    db.exec(`
        CREATE TABLE IF NOT EXISTS "user" (
            "id"	INTEGER NOT NULL UNIQUE,
            "userid"	TEXT NOT NULL UNIQUE,
            "name"	TEXT NOT NULL,
            PRIMARY KEY("id")
        );
        CREATE TABLE IF NOT EXISTS "autoreactchannel" (
            "id"	INTEGER NOT NULL UNIQUE,
            "guildid"	TEXT NOT NULL DEFAULT 0,
            "channelid"	TEXT NOT NULL UNIQUE DEFAULT 0,
            PRIMARY KEY("id")
        );
        CREATE TABLE IF NOT EXISTS "guildconfig" (
            "id"	INTEGER NOT NULL UNIQUE,
            "guildid"	TEXT NOT NULL UNIQUE,
            "guildname"	TEXT NOT NULL,
            "message"	TEXT,
            "voicestage"	TEXT,
            "servermember"	TEXT,
            "autovoicechannel"	TEXT,
            PRIMARY KEY("id")
        );
        CREATE TABLE IF NOT EXISTS "autoreact" (
            "id"	INTEGER NOT NULL UNIQUE,
            "guildid"	INTEGER DEFAULT 0,
            "text"	TEXT NOT NULL,
            "target"	TEXT NOT NULL,
            PRIMARY KEY("id")
        );
        CREATE TABLE IF NOT EXISTS "autovoicechannel" (
            "id"	INTEGER NOT NULL UNIQUE,
            "guildid"	TEXT NOT NULL,
            "channelid"	TEXT NOT NULL UNIQUE,
            PRIMARY KEY("id")
        );`);
    client.guilds.cache.forEach(x => { try { db.prepare(`INSERT OR IGNORE INTO  guildconfig (guildid, guildname) VALUES ('${x.id}', '${x.name}')`).run() } catch (error) { } })
    client.users.cache.forEach(x => { try { db.prepare(`INSERT OR IGNORE INTO  user (userid, name) VALUES ('${x.id}', '${x.tag}')`).run() } catch (error) { } })
    //#endregion
    fs.readdirSync('./Commands').forEach(x =>
        fs.readdirSync(`./Commands/${x}`).forEach(file =>
            require(`${process.cwd()}\\Commands\\${x}\\${file}`)))
            client.rest
    console.log(`\n${client.user.tag} 已登入` +
        `\nGUILD(${client.guilds.cache.size}) -> [P:${Commands.size}]`)

})

    .on("messageCreate", async (message) => {
        //#region test reply
        if (message.author.bot) return
        if (message.content === "ping")
            message.reply({ content: 'pong' })
        //#endregion

        const { content, createdAt, member, guild, channel, author } = message
        try {
            if (execute()) return
            //#region 自動回覆訊息
            if (!db.prepare(`select channelid from autoreactchannel
                          where channelid = '${channel.id}'`).get()?.channelid) return
            var autoreactlist = db.prepare(`select * from autoreact where guildid = ${guild.id} or guildid = 0`).all()
                .filter(x => content.includes(x.target))
            if (autoreactlist.length > 0) {
                console.log(`\n${createdAt.toLocaleString()}\n` +
                    `${guild.name} #${channel.name}\n${author.tag} send ${content}`)
                channel.send({ content: autoreactlist[Math.floor(Math.random() * autoreactlist.length)].text })
            }
            //#endregion
        } catch (error) { console.log(error) }

        //#region Cmd-execute
        function execute() {
            const args = content.trim().split(' ')
            const prefix = [Prefix, `${client.user}`].find(x => args[0].startsWith(x))
            if (!prefix) return false
            args[0] = Aliases.get(args[0].toLowerCase().slice(prefix.length))
            const cmd = Commands.get(args[0])
            var logstr = `\n${createdAt.toLocaleString()}\n` +
                `${guild.name} #${channel.name}\n${author.tag} use ${content}`
            if (!cmd) {
                channel.send('找不到指令')
                return true
            }
            var result = cmd.permissions == "OwnerOnly"
                ? author.id == OwnerId
                : member?.permissions.has(cmd.permissions)

            if (result) cmd.exec(message, args)
            else logstr += `\nError: 沒有使用權限`
            console.log(logstr)
            return true
        }
        //#endregion
    })

    //#region log-events
    // 刪除訊息&更新訊息
    .on('messageDelete', message => {
        if (message.author.bot) return
        var ch = guildlogch(message.guild, 'message')
        if (!ch) return
        ch.send({
            embeds: [new EmbedBuilder()
                .setDescription(`${message.author} ${message.channel}`)
                .setFields({ name: `已刪除`, value: message.content })
                .setTimestamp(message.createdAt)]
        })
        if (message.attachments)
            message.attachments.forEach(x => ch.send({ content: x.url }))
    }).on('messageUpdate', (old, message) => {
        if (message.author.bot) return
        if (old.content == message.content) return
        var ch = guildlogch(message.guild, 'message')
        if (!ch) return
        ch.send({
            embeds: [new EmbedBuilder()
                .setDescription(`${message.author} ${message.channel}`)
                .addFields({ name: `原訊息:`, value: old.content })
                .addFields({ name: `編輯後:`, value: message.content })
                .setTimestamp(message.createdAt)]
        })
    })
    // 語音狀態
    .on('voiceStateUpdate', async (old, stage) => {
        //#region 自動語音房
        var gc = db.prepare(`select autovoicechannel as avch from guildconfig where guildid = '${stage.guild.id}'`).get()
        if (gc?.avch && stage.channel && stage.channelId == gc.avch) {
            var avch = await stage.channel.clone({ name: stage.member.user.username + "'s Room" })
            stage.setChannel(avch)
            db.prepare(`INSERT OR IGNORE INTO autovoicechannel (guildid, channelid) VALUES ('${stage.guild.id}', '${avch.id}')`).run()
        }
        if (!stage.channel) db.prepare(`select channelid as id from autovoicechannel`).all().forEach(x => {
            var dech = stage.guild.channels.cache.get(x.id)
            if (!dech) return db.prepare(`DELETE from autovoicechannel where channelid = '${x.id}'`).run()
            if (!dech.members?.first()) {
                db.prepare(`DELETE from autovoicechannel where channelid = '${x.id}'`).run()
                dech.delete()
            }
        })
        //#endregion

        // 語音狀態更新
        var ch = guildlogch(stage.guild, 'voicestage')
        if (ch) {
            var eb = new EmbedBuilder()
            if (old.channel && gc?.avch && old.channelId != gc?.avch)
                eb.addFields({ name: `離開`, value: `${old.channel}` })
            if (stage.channel && gc?.avch && stage.channelId != gc?.avch)
                eb.addFields({ name: `加入`, value: `${stage.channel}` })
            if (eb.data.fields?.at(0))
                ch.send({ embeds: [eb.setDescription(`${stage.member.user}`)] })
        }
    })
    // 加入伺服器&離開伺服器
    .on('guildMemberAdd', member => {
        db.prepare(`INSERT OR IGNORE INTO user (userid, name) 
        VALUES ('${member.id}', '${member.user.tag}')`).run()
        guildlogch(member.guild, 'servermember')?.send({
            embeds: [
                new EmbedBuilder().setDescription(member.user + ' 加入伺服器')]
        })
    }).on('guildMemberRemove', member => {
        guildlogch(member.guild, 'servermember')?.send({
            embeds: [
                new EmbedBuilder().setDescription(member.user + ' 離開伺服器')]
        })
    })

    .on('guildCreate', guild => {
        db.prepare(`INSERT OR IGNORE INTO  guildconfig (guildid, guildname) VALUES ('${guild.id}', '${guild.name}')`).run()
        guild.members.cache.forEach(x => db.prepare(`INSERT OR IGNORE INTO  user (userid, name) VALUES ('${x.id}', '${x.tag}')`).run())
    })
//#endregion

/** @param {Guild} g @param {"autoreact" | "message" | "voicestage" | "servermember"} type */
function guildlogch(g, type) {
    var c = g.channels.cache.get(`${db.prepare(`select ${type} as id from guildconfig where guildid = ${g.id}`).get()?.id}`)
    if (c?.isTextBased()) return c
}
