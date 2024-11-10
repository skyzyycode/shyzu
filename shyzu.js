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
var { axios, JavaScriptObfuscator, fetch, fs, chalk, baileys, execSync, util } = require("./lib/module.js")
var { watchFile, unwatchFile, readFileSync } = fs
var { generateWAMessageFromContent, getContentType, proto } = baileys
let cp = execSync
let { promisify } = util
let exec = promisify(cp.exec).bind(cp)

module.exports = async (shyzu, m) => {
    try {
    let Read = async (shyzu, jid, messageId) => {
        await shyzu.readMessages([{ remoteJid: jid, id: messageId, participant: null }]);
    }
    
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = shyzu.decodeJid(m.fromMe && shyzu.user.id || m.participant || m.key.participant || m.chat || '')
        if (m.isGroup) m.participant = shyzu.decodeJid(m.key.participant) || ''
    }
    
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (m.quoted) {
            let type = getContentType(quoted)
			m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
				type = getContentType(m.quoted)
				m.quoted = m.quoted[type]
			}
            if (typeof m.quoted === 'string') m.quoted = {
				text: m.quoted
			}
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
			m.quoted.sender = shyzu.decodeJid(m.msg.contextInfo.participant)
			m.quoted.fromMe = m.quoted.sender === (shyzu.user && shyzu.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
			m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })

            m.quoted.delete = () => shyzu.sendMessage(m.quoted.chat, { delete: vM.key })

            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => shyzu.copyNForward(jid, vM, forceForward, options)

            m.quoted.download = () => shyzu.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg.url) m.download = () => shyzu.downloadMediaMessage(m.msg)
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''

	m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => shyzu.copyNForward(jid, m, forceForward, options)
	
    const message = m.message;
    const isGroup = m.key.remoteJid.endsWith('@g.us');
    const isName = m.pushName || 'no name';
    const isFrom = m.key.remoteJid;
    const isSender = isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid;
    const isOwner = global.owner.includes(isSender);
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
    const budy = (typeof text == 'string' ? text : '')
    
    var cmd = prefix + command

    await Read(shyzu, m.key.remoteJid, m.key.id);
    
    let x = chalk.bold.cyan("[ Message Shyzu ]");
    x += chalk.cyan("\nᕐ⁠ᐷ From: ")
    x += chalk.bold.white(isSender)
    x += chalk.cyan("\nᕐ⁠ᐷ Command: ")
    x += chalk.bold.white("." + command + " " + text)
    console.log(x)
    
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
            "method": "GET",
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
        var x_ = `┌─⊷ *T I K T O K*`
        x_ += `\n${xicon} *Author:* ${nickname}`
        x_ += `\n${xicon} *ID:* ${id}`
        x_ += `\n${xicon} *Region:* ${region}`
        x_ += `\n${xicon} *Title:* ${title}`
        x_ += `\n${xicon} *Duration:* ${duration + " Seconds"}`
        x_ += `\n${xicon} *Play Count:* ${format(play_count)}`
        x_ += `\n${xicon} *Comment Count:* ${format(comment_count)}`
        x_ += `\n${xicon} *Share Count:* ${format(share_count)}`
        x_ += `\n${xicon} *Download Count:* ${format(download_count)}`
        x_ += `\n${xicon} *Collect Count:* ${format(collect_count)}`
        x_ += `\n└──────────`
        shyzu.sendMessage(m.chat, { video: { url: play }, fileLength: 10630044057600000000000000000000000000000000000000000000000000, caption: x_ }, { quoted: m })
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
        
        case "ngl": {
        let c = text.split("|")
        let username = c[0]
        let message = c[1]
        if (!username) return m.reply("Masukan usernamenya, Contoh *.ngl* mann|halo")
        if (!message) return m.reply("Masukan messagenya, Contoh *.ngl* mann|halo")
        try {
        await axios({
            method: "GET",
            url: "https://api-nodex.vercel.app",
            params: {
                username,
                message
            }
        })
        m.reply("Pesan " + message + " berhasil terkirim ke " + username)
        } catch ({ message }) {
        m.reply(message)
        }
        }
        break
        
        case "exec": {
        if (!isOwner) return m.reply("Khusus owner hehe :3")
        m.reply('🐾Executing...')
        let o
        try {
        o = await exec(command.trimStart()  + ' ' + text.trimEnd())
        } catch (e) {
        o = e
        } finally {
        let { stdout, stderr } = o
        if (stdout.trim()) m.reply(stdout)
        if (stderr.trim()) m.reply(stderr)
        }
        }
        break
        
        case ">": {
        if (!isOwner) return m.reply("Khusus owner hehe :3")
        try {
        let evaled = await eval(text)
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
        await m.reply(evaled)
        } catch (err) {
        m.reply(String(err))
        }
        }
        break
        
        /** case "auto-ai": {
        if (!auto_ai) {
        shyzu.auto_ai = shyzu.auto_ai ? shyzu.auto_ai : {};
        shyzu.auto_ai[isSender] = {
            status: true
        }
        m.reply("Mengaktifkan auto ai")
        m.reply("Jika ingin menonaktifkannya silahkan ketik *.auto-ai* sekali lagi")
        } else {
        delete shyzu.auto_ai[isSender]
        m.reply("Menonaktifkan auto ai")
        }
        }
        break **/
        
        case "soundcloud": {
        if (!text) return m.reply("Masukan judulnya, Contoh *.soundcloud* dear god");
        try {
        var { data: dataSearch } = await axios({
            "method": "GET",
            "url": "https://api-nodex.vercel.app/soundcloud/search",
            "params": {
                "q": text
            }
        })
    
        let { result: resultSearch } = dataSearch
        // let { link, title } = resultSearch[Math.floor(Math.random() * resultSearch.length)]
        let { link, title } = resultSearch[0]
    
        var { data: dataDownload } = await axios({
            "method": "GET",
            "url": "https://api-nodex.vercel.app/soundcloud/download",
           "params": {
                "url": link
            }
        })
    
        let { result: resultDownload } = dataDownload
    
        shyzu.sendMessage(m.chat, { audio: { url: resultDownload.download }, mimetype: "audio/mp4" }, { quoted: m })
        } catch ({ message }) {
        return m.reply(message)
        }
        }
        break
        
        case "menu": {
        try {
        let c = "_Hello i'm Shyzu simple WhatsApp bot created by MannR. I can to do something, search, get data and information only through WhatsApp._\n\n> *(__> ALL CMD <__)*\n> [ • ] .ai\n> [ • ] .clock\n> [ • ] .enc\n> [ • ] .exec\n> [ • ] .menu\n> [ • ] .ngl\n> [ • ] .soundcloud\n> [ • ] .tiktok\n\n_© MannR - 2024_"
        m.reply(c)
        } catch ({ message }) {
        m.reply(message)
        }
        }
        break
        default:
        /** if (!shyzu.auto_ai[isSender].status) return
        try {
        var { data } = await axios({
            "method": "GET",
            "url": "https://hercai.onrender.com/v3/hercai",
            "params": {
                "question": text
            }
        })
        m.reply(data.reply)
        } catch ({ message }) {
        return m.reply(message)
        } **/
    }
    } catch ({ message }) {
    console.log(chalk.redBright(message))
    }
}

let file = require.resolve(__filename);
watchFile(file, () => {
    unwatchFile(file);
    console.log(chalk.redBright(`File telah diubah: ${__filename}`));
    delete require.cache[file];
    require(file);
});
