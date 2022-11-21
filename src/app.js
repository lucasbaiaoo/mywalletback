import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

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