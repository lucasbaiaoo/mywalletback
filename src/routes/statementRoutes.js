import { getStatement, postStatement } from "../controllers/statementController.js"
import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/statement", authMiddleware, postStatement)

router.get("/statement", authMiddleware, getStatement)

export default router;