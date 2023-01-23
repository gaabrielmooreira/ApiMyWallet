import db from "../config/database.js";

export default async function authValidation(req,res,next) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token) return res.status(422).send("Token is not found!");

    try {
        const session = await db.collection("sessions").findOne({ token })

        if (!session) return res.status(401).send("You are not logged in.")

        res.locals.session = session;

        next();
    } catch (error) {
        res.status(500).send(error);
    }

}