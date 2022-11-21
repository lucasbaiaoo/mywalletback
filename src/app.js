import express from "express";
import cors from "cors";
import { signIn, signUp } from "./controllers/authController.js";
import { getStatement, postStatement } from "./controllers/statementController.js";
import authRouters from "./routes/authRoutes.js"
import statementRouters from "./routes/statementRoutes.js"

const server = express();
server.use(cors());
server.use(express.json());
server.use(authRouters);
server.use(statementRouters);

server.listen(5000);
