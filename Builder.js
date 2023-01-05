const db = require('better-sqlite3')('./data.db');
const { Client, Message, Collection, PermissionsString } = require("discord.js");

const client = new Client({ intents: '32767' });

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

module.exports = { client, db, Modules, Commands, Aliases, Command }