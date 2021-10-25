import axios from 'axios'
import config from '../config/config.js'


const TG_TOKEN = config.TG_TOKEN
const TG_URL = config.TG_URL

export default class TelegramAPI {

    async sendMessage(chatId, text, keyboard) {
        await axios.post(`${TG_URL}${TG_TOKEN}/sendMessage`, {
            chat_id: chatId, text, parse_mode: 'Markdown',
            reply_markup: keyboard
        })

    };

}