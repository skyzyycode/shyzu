/**
  * Base Ori Created By MannR
  * Name Script : Shyzu
  * Creator Script : MannR
  * Version Script : 1.0.0
  * Libary : @whiskeysockets/baileys
  * Version Libary : ^6.6.0
  * Created on Sunday, Sep 1, 2024
  * Thank you to MannR and the module providers and those who use this base.
  * Please use this base as best as possible and do not delete the copyright.
  * © MannR 2024
**/

require("./lib/config.js")
var { axios, JavaScriptObfuscator, fetch, fs, chalk, baileys } = require("./lib/module.js")
var { watchFile, unwatchFile, readFileSync } = fs
var { generateWAMessageFromContent, proto } = baileys

module.exports = async (shyzu, m) => {
    let Read = async (shyzu, jid, messageId) => {
        await shyzu.readMessages([{ remoteJid: jid, id: messageId, participant: null }]);
    }
    
    if (!m.message) return;
    const message = m.message;
    const isGroup = m.key.remoteJid.endsWith('@g.us');
    const isName = m.pushName || 'no name';
    const isFrom = m.key.remoteJid;
    const isSender = isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid;
    const isOwner = global.owner.includes(m.sender);
    const groupMetadata = isGroup ? await shyzu.groupMetadata(isFrom) : {}; 
    
    const participants = isGroup ? groupMetadata.participants : '';
    const groupName = isGroup ? groupMetadata.subject : '';

    let mType = Object.keys(message)[0];
    let body = (mType === 'conversation' && message.conversation) ? message.conversation :
               (mType === 'extendedTextMessage' && message.extendedTextMessage.text) ? message.extendedTextMessage.text :
               (mType === 'imageMessage' && message.imageMessage.caption) ? message.imageMessage.caption :
               (mType === 'videoMessage' && message.videoMessage.caption) ? message.videoMessage.caption :
               (mType === 'buttonsResponseMessage') ? message.buttonsResponseMessage.selectedButtonId :
               (mType === 'listResponseMessage') ? message.listResponseMessage.singleSelectReply.selectedRowId :
               (mType === 'templateButtonReplyMessage') ? message.templateButtonReplyMessage.selectedId :
               (mType === 'messageContextInfo') ? (message.buttonsResponseMessage?.selectedButtonId || message.listResponseMessage?.singleSelectReply.selectedRowId || message.text) :
               (mType === 'documentMessage' && message.documentMessage.caption) ? message.documentMessage.caption : '';

    const prefix = ['.', ',', '!', '?', '#'];
    if (!prefix.some(p => body.startsWith(p))) return;
    const [command, ...args] = body.slice(prefix.find(p => body.startsWith(p)).length).trim().split(/ +/);
    const text = args.join(' ');
    
    var cmd = prefix + command

    await Read(shyzu, m.key.remoteJid, m.key.id);
    
    let x = chalk.bold.cyan("[ Message Shyzu ]");
    x += chalk.cyan(`\nFrom: ${isSender}`)
    x += chalk.green(`\nCommand: ${command + " " + text}`)
    console.log(x)
    
    m.chat = m.key.remoteJid
    
    m.reply = (text) => {
        shyzu.sendMessage(m.key.remoteJid, { text }, { quoted: m });
    };
    
    m.react = (q) => {
        shyzu.sendMessage(m.chat, { react: { text: q, key: m.key }})
    }
    
    m.upTime = () => {
        let ms = require("process").uptime() * 1000
        let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
        let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
        let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
        return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }
    
    function format(views) {
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
    } else {
        return views.toString();
    }
    }
    
    switch (command) {
        case "ai": {
        if (!text) return m.reply("Masukan pertanyaan!")
        try {
        var { data } = await axios({
            "method": "POST",
            "url": "https://hercai.onrender.com/v3/hercai",
            "params": {
                "question": text
            }
        })
        m.reply(data.reply)
        } catch ({ message }) {
        m.reply(message)
        }
        }
        break
        
        case "enc": {
        if (!text) return m.reply("Masukan teksnya!")
        try {
        let { getObfuscatedCode: res } = JavaScriptObfuscator.obfuscate(text)
        m.reply(res)
        } catch ({ message }) {
        m.reply(message)
        }
        }
        break
        
        case "clock": {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        let x = `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        m.reply(x)
        }
        break
        
        case "tiktok": case "tt": {
        if (!text.includes("tiktok.com")) return m.reply("Masukan link tiktoknya!")
        try {
        let { get } = axios
        var { data } = await get({
            "method": "GET",
            "url": "https://manaxu-seven.vercel.app/api/downloader/tiktok?url=" + text
        })
        let { id, region, title, play, duration, play_count, comment_count, share_count, download_count, collect_count, author } = data.result
        let { nickname } = author
        var x = `┌─⊷ *T I K T O K*`
        x += `\n${xicon} *Author:* ${nickname}`
        x += `\n${xicon} *ID:* ${id}`
        x += `\n${xicon} *Region:* ${region}`
        x += `\n${xicon} *Title:* ${title}`
        x += `\n${xicon} *Duration:* ${duration + " Seconds"}`
        x += `\n${xicon} *Play Count:* ${format(play_count)}`
        x += `\n${xicon} *Comment Count:* ${format(comment_count)}`
        x += `\n${xicon} *Share Count:* ${format(share_count)}`
        x += `\n${xicon} *Download Count:* ${format(download_count)}`
        x += `\n${xicon} *Collect Count:* ${format(collect_count)}`
        x += `\n└──────────`
        shyzu.sendMessage(m.chat, { video: { url: play }, fileLength: 10630044057600000000000000000000000000000000000000000000000000, caption: x }, { quoted: m })
        } catch ({ message }) {
        m.reply(message)
        }
        }
        break
        
        /** case "upch": {
        if (!m.quoted) return m.reply("Balas sebuah gambar/video/audio dengan caption *.upch*")
        try {
        let q = await m.quoted.download()
        } catch ({ message }) {
        m.reply(message)
        }
        }
        break **/
        
        case "menu": {
        try {
        let c = "_Hello i'm Shyzu simple WhatsApp bot created by MannR. I can to do something, search, get data and information only through WhatsApp._\n\n> *(__> ALL CMD <__)*\n> [ • ] .ai\n> [ • ] .clock\n> [ • ] .enc\n> [ • ] .menu\n> [ • ] .tiktok\n\n_© MannR - 2024_"
        m.reply(c)
        } catch ({ message }) {
        m.reply(message)
        }
        }
        break
    }
}

let file = require.resolve(__filename);
watchFile(file, () => {
    unwatchFile(file);
    console.log(chalk.redBright(`File telah diubah: ${__filename}`));
    delete require.cache[file];
    require(file);
});
