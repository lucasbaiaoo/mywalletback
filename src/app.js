import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs"

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

try {
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

server.post("/sign-in", async (req, res) => {
  const userInfo = req.body;
  const token = uuid();

  const user = await db.collection("users").findOne({ email: userInfo.email });

  if (user && bcrypt.compareSync(userInfo.password, user.password)) {
    await db.collection("sessions").insertOne({
      token,
      userId: user._id,
    });

    delete user.password;

    res.send({ token, ...user });
  } else {
    res.sendStatus(401);
  }
});

server.post("/statement", async (req, res) => {
  const statement = req.body;

  try {
    await db.collection("transactions").insertOne({ statement, createdAt: dayjs().format("DD/MM") });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

server.listen(5000);
