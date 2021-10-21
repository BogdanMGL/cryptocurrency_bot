import axios from 'axios'
import config from '../config/config.js'


const TG_TOKEN = config.TG_TOKEN
const COIN_URL = config.COIN_URL
const TG_URL = config.TG_URL
axios.defaults.headers.common['X-CMC_PRO_API_KEY'] = config.COIN_API_KEY;



class TelegramAPI {

    async sendMessage(chatId, text, keyboard) {
        await axios.post(`${TG_URL}${TG_TOKEN}/sendMessage`, {
            chat_id: chatId, text, parse_mode: 'Markdown',
            reply_markup: keyboard
        })

    };

}

class CoinmarketAPI {

    async getListCryptocurrencies() {
        const params = {
            'start': '1',
            'limit': '30',
            'convert': 'USD',
        }
        let result
        await axios.get(`${COIN_URL}listings/latest`, { params })
            .then((res) => result = res.data.data)
            .catch((err) => result = { error: true })
        return result
    }


    async checkСryptocurrency(currency) {
        let result
        await axios.get(`${COIN_URL}quotes/latest`, { params: { 'symbol': currency } })
            .then((res) => result = true)
            .catch((err) => {
                if (err?.response?.status === 404) result = { erorr: true }
                else result = false
            })
        return result
    }


    async getСryptocurrency(currency) {
        let result
        await axios.get(`${COIN_URL}quotes/latest`, { params: { 'symbol': currency } })
            .then((res) => result = res.data.data)
            .catch((err) => result = { error: true })
        return result
    }
}

const telegramAPI = new TelegramAPI()
const coinmarketAPI = new CoinmarketAPI()

export { telegramAPI, coinmarketAPI }