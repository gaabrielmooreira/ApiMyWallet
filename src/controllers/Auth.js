import db from '../config/database.js'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid';

export const signUp = async (req, res) => {
    const { name, email, password } = req.body;

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
}

export const signIn = async (req, res) => {
    const { email, password } = req.body;

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
}