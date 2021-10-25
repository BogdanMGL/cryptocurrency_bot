import axios from 'axios'
import config from '../config/config.js'



const COIN_URL = config.COIN_URL
axios.defaults.headers.common['X-CMC_PRO_API_KEY'] = config.COIN_API_KEY;

export default class CoinmarketAPI {

    async getListCryptocurrencies() {
        const params = {
            'start': '1',
            'limit': '30',
            'convert': 'USD',
        }
        const result = await axios.get(`${COIN_URL}listings/latest`, { params })
            .then((res) => res.data.data)
            .catch((err) => { return { error: true } })
        return result
    }


    async checkСryptocurrency(currency) {
        const result = await axios.get(`${COIN_URL}quotes/latest`, { params: { 'symbol': currency } })
            .then((res) => true)
            .catch((err) => {
                if (err?.response?.status === 404) return { erorr: true }
                else return false
            })
        return result
    }


    async getСryptocurrency(currency) {
        const result = await axios.get(`${COIN_URL}quotes/latest`, { params: { 'symbol': currency } })
            .then((res) =>  res.data.data)
            .catch((err) => {return { error: true }})
        return result
    }
}
