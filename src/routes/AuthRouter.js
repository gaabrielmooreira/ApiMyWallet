import { Router } from "express";
import { signIn, signUp } from '../controllers/Auth.js';
import validateSchema from "../middlewares/validateSchema.js";
import { signUpSchema, signInSchema } from "../schemas/AuthSchema.js";

const AuthRouter = Router();

AuthRouter.post("/cadastro", validateSchema(signUpSchema), signUp)

AuthRouter.post("/", validateSchema(signInSchema), signIn)

export default AuthRouter;