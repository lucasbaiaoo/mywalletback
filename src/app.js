import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try{
    await mongoClient.connect();
} catch (error) {
    console.log(error);
}

db = mongoClient.db("myWallet");

const server = express();
server.use(cors());
server.use(express.json());

server.post("/sign-up", async (req, res) => {
    const user = req.body;
    const hashPassword = bcrypt.hashSync(user.password, 10);
  
    try {
      await db.collection("users").insertOne({ ...user, password: hashPassword });
      res.sendStatus(201);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  });

server.listen(5000);