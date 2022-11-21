import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

dotenv.config();

const signInSchema = joi.object({
  email: joi.string().email().trim().required(),
  password: joi.string().required()
});

const signUpSchema = joi.object({
  name: joi.string().trim().required(),
  email: joi.string().email().trim().required(),
  password: joi.string().alphanum().required()
});

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
  const validation = signUpSchema.validate(req.body, {abortEarly: false});

    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message);
        res.status(422).send(errors);
        return;
    }

  try {
    await db.collection("users").insertOne({ ...user, password: hashPassword });
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

server.post("/sign-in", async (req, res) => {
  const userInfo = req.body;
  const token = uuid();
  const validation = signInSchema.validate(req.body, {abortEarly: false});

    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message);
        res.status(422).send(errors);
        return;
    }

  try {
    const user = await db
      .collection("users")
      .findOne({ email: userInfo.email });

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
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

server.post("/statement", async (req, res) => {
  const statement = req.body;

  try {
    await db
      .collection("transactions")
      .insertOne({ ...statement, price: Number(statement.price), createdAt: dayjs().format("DD/MM") });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

server.get("/statement", async (req, res) => {
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const session = await db.collection("sessions").findOne({ token });

    if (!session) {
      res.sendStatus(401);
      return;
    }

    const user = await db.collection("users").findOne({
      _id: session.userId,
    });

    if (user) {
      const userTransactions = await db.collection("transactions").find({name: user.name}).toArray();
      let balance = 0

      for(let i = 0; i < userTransactions.length; i++){
        if(userTransactions[i].type === "income"){
          balance += userTransactions[i].price
        } else {
          balance -= userTransactions[i].price
        }
      }
      res.send({userTransactions, balance});
    }
  } catch (error) {
    console.log(err);
    res.sendStatus(500);
  }
});

server.listen(5000);
