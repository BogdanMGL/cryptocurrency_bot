import * as bot from '../index.js'
import * as API from '../API/API.js'
import config from '../config/config.js'


const TG_TOKEN = config.TG_TOKEN


export function routes(app, db) {

    app.post(`/${TG_TOKEN}`, async (req, res) => {
        if ('edited_message' in req.body) {
            const messageChatId = req.body.edited_message.chat.id
            const text = "Editing messages is not supported, create a new message"
            API.telegramAPI.sendMessage(messageChatId, text)
            return res.status(200).send({});
        }

        const messageChatId = req.body?.message?.chat?.id ?? req.body.callback_query.message.chat.id
        const messageText = req.body?.message?.text ?? req.body.callback_query.data
        const messageName = req.body?.message?.chat?.first_name;
        let isBotCommand
        if (req.body?.message) isBotCommand = "entities" in req.body?.message


        if (messageText.indexOf('addtofavorite') !== -1) {
            bot.addCurrency(messageChatId, messageText, db)
            return res.status(200).send({});
        }
        else if (messageText.indexOf('deletefavorite') !== -1) {
            bot.removeCurrency(messageChatId, messageText, db)
            return res.status(200).send({});
        }

        switch (messageText) {
            case '/help':
                bot.helpMessage(messageChatId)
                break
            case '/start':
                bot.startMessage(messageChatId, messageName)
                break
            case '/listrecent':
                bot.getListCryptocurrencies(messageChatId)
                break
            case '/listfavorite':
                bot.listFavoriteCurrency(messageChatId, db, messageText)
                break
            default:
                bot.checkMessage(messageChatId, messageText, isBotCommand, db)
        }
        res.status(200).send({});
    })
}
