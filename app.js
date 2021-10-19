import express from "express"
import dotenv from 'dotenv'
import mongodb from 'mongodb'


import { routes } from "./routes/routes.js"


dotenv.config()
const MongoClient = mongodb.MongoClient
const DBConn = process.env.DBConn
const app = express()
app.use(express.json());
const port = process.env.PORT || 4000

MongoClient.connect(DBConn, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        return (console.log(err));
    }
    const db = client.db('CryptocurrencyBot')
    routes(app, db)
    app.listen(port, () => {
        console.log(`app listening at http://localhost:${port}`);
    })
}
)
