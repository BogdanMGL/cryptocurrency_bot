import dotenv from 'dotenv'

dotenv.config()

const config = {
    COIN_URL: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/',
    TG_URL: 'https://api.telegram.org/bot',
    COIN_API_KEY: process.env.COIN_API_KEY,
    TG_TOKEN: process.env.TG_TOKEN,
    DB_CONN: process.env.DB_CONN,
    ROOT: process.env.ROOT,
    PORT: process.env.PORT,
    DB_NAME:process.env.DB_NAME,
    DB_COLLECTION:process.env.DB_COLLECTION,

}


export default config