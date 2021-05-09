const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const fetch = require('node-fetch');
const util = require("util");
const PretMil = require('pretty-ms');
const querystring = require('querystring');
require('dotenv').config()

const TOKEN = process.env.TOKEN;
var prefix = config.main.prefix

// ACTIVITY STATUS
client.on("ready", () => {
    console.log(`${client.user.tag} is Logged in`)
    if (config.Activity.Enabled && config.Activity.Content != "UPTIME-TIMER") {
        client.user.setActivity({
            name: `${config.Activity.Content}`
        }, {
            type: `${config.Activity.Type}`
        })
    }
    if (config.Activity.Enabled && config.Activity.Content === "UPTIME-TIMER") {
        var interval_in_seconds = 1000 * config.Activity.Interval;
        setInterval(function () {
            let t = client.uptime / 1000,
                e = Math.floor(t / 86400);
            t %= 86400;
            let l = Math.floor(t / 3600);
            t %= 3600;
            let n = `${e} D, ${l} H, ${Math.floor(t/60)} M, ${Math.floor(t%60)} S`;
            client.user.setActivity(`${n}`)
        }, interval_in_seconds);
    }
    if (config.Activity.Enabled && Array.isArray(config.Activity.Content)) {
        var interval_in_seconds = 1000 * config.Activity.Interval;
        setInterval(() => {
            var t = Math.floor(Math.random() * config.Activity.Content.length);
            if (config.Activity.Content[t] == "UPTIME-TIMER") {
                var interval_in_seconds = 1000 * config.Activity.Interval;
                setInterval(function () {
                    let t = client.uptime / 1000,
                        e = Math.floor(t / 86400);
                    t %= 86400;
                    let l = Math.floor(t / 3600);
                    t %= 3600;
                    let n = `${e} D, ${l} H, ${Math.floor(t/60)} M, ${Math.floor(t%60)} S`;
                    client.user.setActivity(`${n}`)
                }, interval_in_seconds);
            }
            if (config.Activity.Content[t] != "UPTIME-TIMER") client.user.setActivity(config.Activity.Content[t], {
                type: `${config.Activity.Type}`
            })
        }, interval_in_seconds);
    }
    if (!config.Activity.Enabled) {
        return;
    }
})

client.on("guildMemberAdd", m => {
    if (config.onJoin.Enabled) {
        let JoinRole = m.guild.roles.cache.get(config.onJoin.RoleId);
        m.roles.add(JoinRole)
        const joinEmbed = new Discord.MessageEmbed()
            .setColor(config.embedSettings.colour)
            .setAuthor(m.user.username + " Has Joined")
            .setThumbnail(m.user.avatarURL)
            .setFooter(config.embedSettings.footer.serverName, config.embedSettings.footer.serverLogo)
            .setTimestamp()
        m.guild.channels.cache.get(config.onLeave.MessageChannelId).send(joinEmbed)
    }
})

client.on("guildMemberRemove", m => {
    if (config.onLeave.Enabled) {
        m.guild.channels.cache.get(config.onLeave.MessageChannelId).send(config.onLeave.Message)
    }
})

// Console Logging
client.on("channelCreate", ch => {
    if (ch.type === "dm") {
        return;
    }
    console.log(`${ch.createdAt}  Category name : ${ch.parent.name} Channel name : ${ch.name} was Created`)
})
client.on("channelDelete", ch => {
    console.log(`${ch.createdAt}  Category name : ${ch.parent.name} Channel name : ${ch.name} was Deleted`)
})

client.on("message", msg => {
    if (msg.content === '') {
        return
    } // Excludes Embeds
    if (msg.author.id === client.user.id) {
        return
    } // Excludes The bots messages
    if (msg.channel.type === "dm") {
        console.log(`${msg.createdAt}  DM Message author : ${msg.author.tag} Message Content : ${msg.content}`);
        return;
    }
    console.log(`${msg.createdAt} Guild name: ${msg.guild.name} Channel name: ${msg.channel.name} Message author : ${msg.author.tag} Message Content : ${msg.content}`)
})

client.on("message", msg => {
    if (msg.content.startsWith(`${prefix}search`)) {
        console.log(msg.content)
        var ip = msg.content;
        ip = ip.split(" ");
        ip.shift()
        ip = ip.join("+");
        ip.toString();
        var searchembed = new Discord.MessageEmbed()
            .setColor(config.embedSettings.colour)
            .setTitle("Google Search")
            .setDescription(`Click [Here](https://www.google.com/search?q=${ip})`)
            .setFooter(config.embedSettings.footer.serverName, config.embedSettings.footer.serverLogo)
            .setTimestamp()
        msg.channel.send(searchembed)
    }
})

client.on("message", msg => {
    if (msg.content.startsWith(`${prefix}mcstatus`)) {
        console.log(msg.content)
        var ip = msg.content;
        ip = ip.split(" ");
        ip.shift()
        ip.toString();
        console.log(ip)
        fetch(`https://mcapi.us/server/status?ip=${ip}&port=25565`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(res => res.json())
            .then(json => {
                console.log(util.inspect(json, false, 10, true))
                console.log(PretMil(json.duration, {
                    secondsDecimalDigits: 0,
                    verbose: true
                }))
                console.log(json.server.name);
                console.log(json.players.now + "/" + json.players.max);
                var serverName = json.server.name
                var serverPlayer = `\`${json.players.now}\`` + " / " + `\`${json.players.max}\``
                var searchembed = new Discord.MessageEmbed()
                    .setColor("#00aa00")
                    .setTitle("Minecraft Server Status")
                    .addField("IP", ip)
                    .addField("Players", serverPlayer)
                    .addField("Uptime", PretMil(json.duration, {
                        secondsDecimalDigits: 0,
                        verbose: true
                    }))
                    .addField("Versions", serverName)
                    .setThumbnail(json.favicon)
                    .setFooter(config.embedSettings.footer.serverName, config.embedSettings.footer.serverLogo)
                    .setTimestamp()
                msg.channel.send(searchembed)
            })

    }
})


client.login(TOKEN)