const { color } = require('./config.json');
const db = require('better-sqlite3')('./data.db');
const { Client, Message, EmbedBuilder, Collection, PermissionsString } = require("discord.js");

const client = new Client({
    allowedMentions: {
        parse: ['users', 'roles']
    },
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildBans",
        "GuildEmojisAndStickers",
        "GuildIntegrations",
        "GuildWebhooks",
        "GuildInvites",
        "GuildVoiceStates",
        "GuildPresences",
        "GuildMessages",
        "GuildMessageReactions",
        "GuildMessageTyping",
        "DirectMessages",
        "DirectMessageReactions",
        "DirectMessageTyping",
        "MessageContent",
        "GuildScheduledEvents",
        "AutoModerationConfiguration",
        "AutoModerationExecution"
    ]
});

/** @type {Collection<string,string[]>} */
const Modules = new Collection()
/** @type {Collection<string,ICommand>} */
const Commands = new Collection()
/** @type {Collection<string,string>} */
const Aliases = new Collection()

/** 
 * @typedef {"OwnerOnly"|PermissionsString} CmdPermissions 
 * @typedef {(context:Message, args:string[]) => any} run
 * 
 * @typedef ICommand
 * @property {string} module
 * @property {string[]} aliases
 * @property {string} description
 * @property {string[]} example
 * @property {CmdPermissions} permissions
 * @property {run} exec
 */

class Command {
    /** @type {ICommand} */ data = {}
    /** @param {string | undefined} modname */
    constructor(modname) { this.modname = modname?.trim()[0] ? modname : 'other' }
    /** @param {string[]} alias */
    setName(...alias) {
        this.data.aliases = alias
        alias.forEach(x => Aliases.set(x, alias[0]))
        return this
    }
    /** @param {string[]} value */
    setDescription(...value) { this.data.description = value; return this }
    /** @param {string[]} value */
    setExample(...value) { this.data.example = value; return this }
    /** @param {CmdPermissions} value */
    setPremissions(value) { this.data.permissions = value; return this }
    /** @param {run} exec  */
    setexec(exec) {
        this.data.exec = exec
        this.data.module = this.modname
        this.data.description ??= ""
        this.data.example ??= [""]
        this.data.permissions ??= "SendMessages"
        Commands.set(this.data.aliases[0], this.data)
        Modules.set(this.modname, (Modules.get(this.modname) ?? [])
            .concat(this.data.aliases[0]))
        this.data = {}
        return this
    }
}


class Temp {
    /** @param {string} str @param {string[]} args */
    str(str, ...args) {
        args.forEach((x, i) => str.split(`{${i}}`).join(x))
        return str
    }
    /** @private @param {{txt?:string, type:"ok" | "error" | "pending"}} obj */
    Embed = (obj) => new EmbedBuilder().setColor(color[obj.type]).setDescription(obj.txt)
    /** @param {string?} txt */
    OkEmbed = (txt) => this.Embed({ txt, type: "ok" })
    /** @param {string?} txt */
    ErrorEmbed = (txt) => this.Embed({ txt, type: "error" })
    /** @param {string?} txt */
    PendingEmbed = (txt) => this.Embed({ txt, type: "pending" })
}

module.exports = { client, db, Modules, Commands, Aliases, Command }