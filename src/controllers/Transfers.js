import db from '../config/database.js'
import dayjs from 'dayjs';


export const newTransfer = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    const { value, description, type } = req.body;
    const transfer = { value, description, type, date: dayjs().format('DD/MM')};

    try {
        const session = await db.collection("sessions").findOne({ token });
        if (!session) return res.status(401).send("You are not logged in.");

        await db.collection("transfers").insertOne({ userId: session.userId, ...transfer });

        res.status(201).send("New transfer registered.");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Database error.")
    }
}

export const getUserTransfers = async (req, res) => {
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

}