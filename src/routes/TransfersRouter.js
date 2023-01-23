import { Router } from "express";
import { getUserTransfers, newTransfer } from "../controllers/Transfers.js";
import validateSchema from "../middlewares/validateSchema.js";
import transferSchema from "../schemas/TransferSchema.js";


const TransfersRouter = Router();

TransfersRouter.post("/nova-entrada", validateSchema(transferSchema), newTransfer)

TransfersRouter.post("/nova-saida", validateSchema(transferSchema), newTransfer)

TransfersRouter.get("/home", getUserTransfers)

export default TransfersRouter;