import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Joi from 'joi';
import {MongoClient} from 'mongodb'
import bcrypt from 'bcrypt'


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
    console.log("Connection with database failed.");
    console.log(err);
}

const signUpSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,20}$')),
    repeatPassword: Joi.ref('password')
});

// const signInSchema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,20}$'))
// })


app.post("/cadastro", async (req,res) => {
    const {name,email,password,repeatPassword} = req.body; 

    const {error} = signUpSchema.validate({name,email,password,repeatPassword},{abortEarly: false});
    if(error) {
        const AllErrors = error.details.map((e) => e.message);
        return res.status(422).send(AllErrors);
    }

    try{
        const emailExist = await db.collection("users").findOne({email});
        if(emailExist) return res.send("Email is already in use.");

        const hashPassword = bcrypt.hashSync(password);

        await db.collection("users").insertOne({name, email, hashPassword});

        res.send("Thank you for registering.");
    } catch(err){
        console.error(err);
        return res.status(500).send("Database error.")
    }
})

// app.post("/", async (req,res) => {
//     const {email, password} = req.body;
 
//     const {error} = signInSchema.validate({email,password},{abortEarly:false});
//     if(error) return res.status(422).send("Email e/ou senha incorreto(s).");


// })

app.listen(PORT, () => console.log(`The app starts on PORT: ${PORT}`));