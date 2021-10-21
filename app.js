import express from 'express'
import mongodb from 'mongodb'


import config from './config/config.js'
import { routes } from "./routes/routes.js"


const DB_CONN = config.DB_CONN
const DB_NAME = config.DB_NAME
const DB_COLLECTION = config.DB_COLLECTION
const PORT = config.PORT || 4000
const app = express()
app.use(express.json());


const start = async () => {
    const client = new mongodb.MongoClient(DB_CONN, { useUnifiedTopology: true })
    await client.connect()
    const db = client.db(DB_NAME).collection(DB_COLLECTION)
    routes(app, db)
    app.listen(PORT, () => {
        console.log(`app listening at http://localhost:${PORT}`);
    })
}

start()

