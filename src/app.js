import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Joi from 'joi';
import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid';


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
    confirmPassword: Joi.ref('password')
});

const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,20}$'))
})

const transferSchema = Joi.object({
    value: Joi.number().required(),
    description: Joi.string().required(),
})

app.post("/cadastro", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    const { error } = signUpSchema.validate({ name, email, password, confirmPassword }, { abortEarly: false });
    if (error) {
        const AllErrors = error.details.map((e) => e.message);
        return res.status(422).send(AllErrors);
    }

    try {
        const emailExist = await db.collection("users").findOne({ email });
        if (emailExist) return res.status(409).send("Email is already in use.");

        const hashPassword = bcrypt.hashSync(password, 10);
        await db.collection("users").insertOne({ name, email, password: hashPassword });

        res.send("Thank you for registering.");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Database error.")
    }
})

app.post("/", async (req, res) => {
    const { email, password } = req.body;

    const { error } = signInSchema.validate({ email, password }, { abortEarly: false });
    if (error) return res.status(422).send("Invalid's email and/or password.");
    try {
        const user = await db.collection("users").findOne({ email });
        const checkPassword = bcrypt.compareSync(password, user.password);

        if (user && checkPassword) {
            const token = uuid();

            await db.collection("sessions").insertOne({ userId: user._id, token, tokenExpeditionDate: Date.now() });

            return res.send(token);
        } else {
            return res.status(409).send("Invalid's email and/or password.");
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send("Database error.")
    }
})

app.post("/nova-entrada", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    const { value, description } = req.body;
    const valueNumber = Number(value.replace(",", "."));
    const { error } = transferSchema.validate({ value: valueNumber, description }, { abortEarly: false });
    if (error) return res.status(422).send("Invalid data(s).");

    const entryTransfer = { value: valueNumber, description, type: 'entry' };

    try {
        const session = await db.collection("sessions").findOne({ token });
        if (!session) return res.status(401).send("You are not logged in.");

        await db.collection("transfers").insertOne({ userId: session.userId, ...entryTransfer });

        res.status(201).send("New entry registered.");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Database error.")
    }
})

app.post("/nova-saida", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    const { value, description } = req.body;
    const valueNumber = Number(value.replace(",", "."));
    const { error } = transferSchema.validate({ value: valueNumber, description }, { abortEarly: false });
    if (error) return res.send(422).send("Invalid data(s).");

    const exitTransfer = { value: valueNumber, description, type: "exit" };
    try {
        const session = await db.collection("sessions").findOne({ token });
        if (!session) return res.status(401).send("You are not logged in.");

        await db.collection("transfers").insertOne({ userId: session.userId, ...exitTransfer });

        res.status(201).send("New exit registered.");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Database error.");
    }
})

app.get("/home", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const session = await db.collection("sessions").findOne({ token });
        if (!session) return res.sendStatus(401);
        const userTransfers = await db.collection("transfers").find({ userId: session.userId }).toArray();
        let saldo = 0;
        userTransfers.forEach(transfer => {
            if (transfer.type === "entry") {
                saldo += Number(transfer.value);
            } else {
                saldo -= Number(transfer.value);
            }
        });
        const { name } = await db.collection("users").findOne({ _id: session.userId });
        res.send({ name, userTransfers, saldo });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Database error.");
    }

})

app.listen(PORT, () => console.log(`The app starts on PORT: ${PORT}`));