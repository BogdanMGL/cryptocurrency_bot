import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

axios.defaults.headers.common['X-CMC_PRO_API_KEY'] = process.env.API_KEY;
const APIURL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/';
const telegramToken = process.env.telegramToken
const telegramUrl = 'https://api.telegram.org/bot'
const URL = process.env.URL


// const setWebHook = async () => {
//     try {
//         res = await axios.post(`${telegramUrl}${telegramToken}/setWebhook?url=${URL}/${telegramToken}`)
//     } catch (err) {
//         console.error(err);
//     }
// }



const sendMessage = async (chat_id, text) => {
    try {
        const res = await axios.post(`${telegramUrl}${telegramToken}/sendMessage`, { chat_id, text })
    } catch (err) {
        console.error(err);
    }
};


const getСryptocurrency = async (chat_id, currencySymbol) => {
    try {
        const response = await axios.get(`${APIURL}quotes/latest`, { params: { 'symbol': currencySymbol } })
        const data = response.data.data[`${currencySymbol}`].quote.USD
        let result = "name: " + response.data.data[`${currencySymbol}`].name + '\n'
        for (let key in data) {
            result += key + ": " + data[key] + '\n'
        }
        sendMessage(chat_id, result)
    } catch (err) {
        const result = err
        sendMessage(chat_id, result)
    }
}

const checkСryptocurrency = async (currency) => {
    try {
        const response = await axios.get(`${APIURL}quotes/latest`, { params: { 'symbol': currency } })
        return true
    } catch (err) {
        return false
    }
}

const getPrice = async (currency) => {
    try {
        const response = await axios.get(`${APIURL}quotes/latest`, { params: { 'symbol': currency } })
        return response.data.data
    } catch (err) {
        console.log(err)
    }
}




const getListCryptocurrencies = async (chat_id) => {
    const params = {
        'start': '1',
        'limit': '30',
        'convert': 'USD',
    }
    try {
        const response = await axios.get(`${APIURL}listings/latest`, { params })
        const data = response.data.data
        let result = "Top 30 by market cap rating: \n";
        for (let i = 0; i < data.length; i++) {
            result += "/" + data[i].symbol + "   $" + (data[i].quote.USD.price.toFixed(2)).toLocaleString('ru') + '\n'
        }

        sendMessage(chat_id, result)
    } catch (errors) {
        console.error(errors)


    }
};

const addCurrency = async (chat_id, messageText, db) => {
    let text = ''
    const arrMessageText = messageText.replace(/\s+/g, " ").split(' ')
    if (arrMessageText.length !== 2) {
        text = `Sorry, currency  is invalid. Please use this format: \n/addtofavorite currencySymbol \nExample: \n/addtofavorite BTC \n`
        sendMessage(chat_id, text)
        return
    }

    const name = arrMessageText[1]
    if (!await checkСryptocurrency(name)) {
        text = `cryptocurrency not found, check the correctness of the currency symbol`
        sendMessage(chat_id, text)
        return
    }
    const currency = { name: name }

    const findCurrency = await db.collection(`${chat_id}`).findOne(currency)
    if (findCurrency !== null) {
        text = `error, this cryptocurrency has already been added`
        sendMessage(chat_id, text)
        return
    }


    db.collection(`${chat_id}`).insertOne(currency, (err, result) => {
        if (err) text = 'error, no cryptocurrency added, please try again'
        else text = 'cryptocurrency added successfully'
        sendMessage(chat_id, text)

    });

}




const removeCurrency = (chat_id, messageText, db) => {
    const arrMessageText = messageText.replace(/\s+/g, " ").split(' ')
    if (arrMessageText.length !== 2) {
        const text = `Sorry, currency  is invalid. Please use this format: \n/deletefavorite currencySymbol \nExample: \n/deletefavorite BTC \n`
        sendMessage(chat_id, text)
        return
    }

    const currency = { name: "BTC" }
    db.collection(`${chat_id}`).deleteOne(currency, (err, result) => {
        let text = ''
        if (err) text = 'error, cryptocurrency not deleted added, try again'
        else text = 'cryptocurrency successfully deleted'
        sendMessage(chat_id, text)
    });

}

const listFavoriteCurrency = async (chat_id, db) => {

    const arrayCurrency = await db.collection(`${chat_id}`).find().toArray()
    if (arrayCurrency === null) {
        text = 'favorites list is empty'
        sendMessage(chat_id, text)
        return
    }
    let stringCurrency = ''
    arrayCurrency.forEach((item, i) => {
        if (i === arrayCurrency.length - 1) {
            stringCurrency += item.name
        } else {
            stringCurrency += item.name + ','
        }
    })
    const data = await getPrice(stringCurrency)
    const arrayNameCurrency = stringCurrency.split(',')
    let result = 'favorite currency list: \n'
    arrayNameCurrency.forEach(item => {
        result += "/" + data[`${item}`].symbol + "  $" + (data[`${item}`].quote.USD.price.toFixed(2)).toLocaleString('ru') + '\n'
    })
    sendMessage(chat_id, result)

}

const helpMessage = (messageChatId) => {
    const text = `To work with the bot, use the list of commands: 
    /listrecent - list of cryptocurrencies, top 30 by market cap rating 
    /addtofavorite  - after the command, specify the name of the currency to add to favorites 
    /listfavorite - favorite currency list 
    /deletefavorite  - after the command, specify the name of the currency that you want to remove from favorites`
    sendMessage(messageChatId, text)

}

const startMessage = (messageChatId, messageName) => {
    const text =
        `Hello, ${messageName}, this bot will allow you to monitor the cryptocurrency market.`
    sendMessage(messageChatId, text)

}



const checkMessage = (messageChatId, messageText, isBotCommand) => {

    if (isBotCommand) {
        const currency = messageText.slice(1).toUpperCase()
        getСryptocurrency(messageChatId, currency)
    }

}

export { getListCryptocurrencies, sendMessage, addCurrency, removeCurrency, listFavoriteCurrency, helpMessage, startMessage, checkMessage }
