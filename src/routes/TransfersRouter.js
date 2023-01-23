import { Router } from "express";
import { deleteUserTransfer, getUserTransfers, newTransfer } from "../controllers/Transfers.js";
import validateSchema from "../middlewares/validateSchema.js";
import transferSchema from "../schemas/TransferSchema.js";
import authValidation from "../middlewares/authValidation.js";


const TransfersRouter = Router();

TransfersRouter.use(authValidation);

TransfersRouter.post("/nova-entrada", validateSchema(transferSchema), newTransfer)

TransfersRouter.post("/nova-saida", validateSchema(transferSchema), newTransfer)

TransfersRouter.get("/home", getUserTransfers)

TransfersRouter.delete("/home/:transferId", deleteUserTransfer)

export default TransfersRouter;