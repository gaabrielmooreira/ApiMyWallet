import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import joi from 'joi';
import {MongoClient} from 'mongodb'


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
    await mongoClient.connect();
    db = mongoClient.db();
} catch (err) {
    console.log("Não foi possível conectar com o banco de dados.");
    console.log(err);
}


app.listen(PORT, () => console.log(`O servidor iniciou com sucesso na PORT: ${PORT}`));