import * as API from "./API/API.js"


const startMessage = (chatId, messageName) => {

    const text =
        `Hello, ${messageName} , this bot will allow you to monitor the cryptocurrency market.`
    API.telegramAPI.sendMessage(chatId, text)
}


const helpMessage = (chatId) => {

    const text = `*To work with the bot, use the list of commands:* 
/listrecent - list of cryptocurrencies, top 30 by market cap rating 
/addtofavorite  - after the command, specify the name of the currency to add to favorites 
/listfavorite - favorite currency list 
/deletefavorite  - after the command, specify the name of the currency that you want to remove from favorites`
    API.telegramAPI.sendMessage(chatId, text)
}



const getListCryptocurrencies = async (chatId) => {

    const data = await API.coinmarketAPI.getListCryptocurrencies()
    if (data?.error) {
        const text = "Error, coinmarketcap server not responding,please try again"
        API.telegramAPI.sendMessage(chatId, text)
        return
    }
    let result = "* Top 30 by market cap rating: *\n";
    for (let i = 0; i < data.length; i++) {
        let name = "/" + data[i].symbol.padEnd(8)
        let price = data[i].quote.USD.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
        result += i + 1 + '. ' + name + " _" + price + '_' + '\n'
    }
    API.telegramAPI.sendMessage(chatId, result)

};



const getСryptocurrency = async (chatId, currencySymbol, db) => {

    let data = await API.coinmarketAPI.getСryptocurrency(currencySymbol)
    const name = data[`${currencySymbol}`].name
    let result = '`' + "name: ".padEnd(27) + '`' + '_' + name + '_' + '\n'
    data = data[`${currencySymbol}`].quote.USD
    for (let key in data) {
        let name = (key.replace(/_(?=\d)/g, " in ").replace(/_/g, " ").replace(/h$/g, ' hours').replace(/d$/g, ' days') + ":").padEnd(27)
        let value = ''
        if (key === 'last_updated') value = new Date(data[key]).toLocaleString('en-US')
        else value = data[key].toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
        result += '`' + name + '`' + '_' + value + '_' + '\n'
    }
    const currency = { chatId: chatId, name: currencySymbol }
    const findCurrency = await db.findOne(currency)


    let keyboardText = ''
    let callback_data = ''
    if (findCurrency) {
        keyboardText = `Remove ${name} from favorite list`
        callback_data = "/deletefavorite " + currencySymbol
    } else {
        keyboardText = `Add  ${name} to favorite list`
        callback_data = "/addtofavorite " + currencySymbol
    }
    const keyboard = {
        inline_keyboard: [
            [{ text: keyboardText, callback_data: callback_data }],
        ]
    }
    API.telegramAPI.sendMessage(chatId, result, keyboard)
}



const addCurrency = async (chatId, messageText, db) => {

    let text = ''
    const arrMessageText = messageText.replace(/\s+/g, " ").split(' ')
    if (arrMessageText.length !== 2) {
        text = `Sorry, cryptocurrency  is invalid. Please use this format: \n/addtofavorite currencySymbol \nExample: \n/addtofavorite BTC \n`
        API.telegramAPI.sendMessage(chatId, text)
        return
    }

    const name = arrMessageText[1]
    const checkCurrency = await API.coinmarketAPI.checkСryptocurrency(name)

    if (checkCurrency?.error) {
        text = 'Error, coinmarketcap server not responding,please try again'
        API.telegramAPI.sendMessage(chatId, text)
        return
    }
    else if (!checkCurrency) {
        text = 'Cryptocurrency not found, check the correctness of the currency symbol'
        API.telegramAPI.sendMessage(chatId, text)
        return
    }

    const currency = { name: name, chatId: chatId }
    const findCurrency = await db.findOne(currency)
    if (findCurrency !== null) {
        text = `Error, ${name},  cryptocurrency has already been added`
        API.telegramAPI.sendMessage(chatId, text)
        return
    }

    db.insertOne(currency, (err, result) => {
        if (err) text = 'Error, no cryptocurrency added, please try again'
        else text = 'Cryptocurrency added successfully'
        API.telegramAPI.sendMessage(chatId, text)

    });
}




const removeCurrency = async (chatId, messageText, db) => {

    const arrMessageText = messageText.replace(/\s+/g, " ").split(' ')
    if (arrMessageText.length !== 2) {
        const text = `Sorry, cryptocurrency  is invalid. Please use this format: \n/deletefavorite currencySymbol \nExample: \n/deletefavorite BTC \n`
        API.telegramAPI.sendMessage(chatId, text)
        return
    }
    const name = arrMessageText[1]
    const currency = { name: name, chatId: chatId }
    const findCurrency = await db.findOne(currency)
    if (!findCurrency) {
        const text = `Error, ${name}, cryptocurrency is not on the list of favorites`
        API.telegramAPI.sendMessage(chatId, text)
        return
    }

    db.deleteOne(currency, (err, result) => {
        let text = ''
        if (err) text = 'Error, cryptocurrency not deleted added, try again'
        else text = 'Cryptocurrency deleted successfully '
        API.telegramAPI.sendMessage(chatId, text)
    });
}

const listFavoriteCurrency = async (chatId, db) => {

    const arrayCurrency = await db.find({chatId:chatId}).toArray()
    if (!arrayCurrency.length) {
        const text = 'Favorites list is empty'
        API.telegramAPI.sendMessage(chatId, text)
        return
    }
    let stringCurrency = ''
    arrayCurrency.forEach((item, i) => {
        if (i === arrayCurrency.length - 1) stringCurrency += item.name
        else stringCurrency += item.name + ','
    })
    const data = await API.coinmarketAPI.getСryptocurrency(stringCurrency)
    if (data?.error) {
        const text = "Error, coinmarketcap server not responding,please try again"
        API.telegramAPI.sendMessage(chatId, text)
        return
    }
    const arrayNameCurrency = stringCurrency.split(',')
    let result = '* Favorite currency list: \n*'
    arrayNameCurrency.forEach(item => {
        result += "/" + data[`${item}`].symbol + "  _" + data[`${item}`].quote.USD.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) + '_' + '\n'
    })
    API.telegramAPI.sendMessage(chatId, result)
}


const checkMessage = async (chatId, messageText, isBotCommand, db) => {

    if (!isBotCommand) return
    const currency = messageText.slice(1).toUpperCase()
    const checkCurrency = await API.coinmarketAPI.checkСryptocurrency(currency)
    if (checkCurrency?.error) {
        text = 'Error, coinmarketcap server not responding,please try again'
        API.telegramAPI.sendMessage(chatId, text)
        return
    }
    else if (!checkCurrency) {
        const text = `Error, unknown command use command: /help`
        API.telegramAPI.sendMessage(chatId, text)
        return
    }
    getСryptocurrency(chatId, currency, db)
}

export { getListCryptocurrencies, addCurrency, removeCurrency, listFavoriteCurrency, helpMessage, startMessage, checkMessage }
