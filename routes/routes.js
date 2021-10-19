import * as API from "./index.js"


const telegramToken = process.env.telegramToken


export function routes(app, db) {

    app.post(`/${telegramToken}`, async (req, res) => {
        if ('edited_message' in req.body) {
            const messageChatId = req.body.edited_message.chat.id
            const text = "editing messages is not supported, create a new message"
            sendMessage(messageChatId, text)
            return res.status(200).send({});
        }

        const messageChatId = req.body.message.chat.id;
        const messageText = req.body.message.text;
        const messageName = req.body.message.chat.first_name;
        const isBotCommand = "entities" in req.body.message

        if (messageText.indexOf('addtofavorite') !== -1) {
            API.addCurrency(messageChatId, messageText, db)
            return res.status(200).send({});
        }
        else if (messageText.indexOf('deletefavorite') !== -1) {
            API.removeCurrency(messageChatId, messageText, db)
            return res.status(200).send({});
        }


        switch (messageText) {
            case '/help':
                API.helpMessage(messageChatId)
                break
            case '/start':
                API.startMessage(messageChatId, messageName)
                break
            case '/listrecent':
                API.getListCryptocurrencies(messageChatId)
                break
            case '/listfavorite':
                API.listFavoriteCurrency(messageChatId, db, messageText)
                break
            default:
                API.checkMessage(messageChatId, messageText, isBotCommand)
        }
        res.status(200).send({});



    })
}
