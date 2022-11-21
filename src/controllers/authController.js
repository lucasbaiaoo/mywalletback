import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import joi from "joi";
import db from "../database/db.js";

const signInSchema = joi.object({
  email: joi.string().email().trim().required(),
  password: joi.string().required()
});

const signUpSchema = joi.object({
  name: joi.string().trim().required(),
  email: joi.string().email().trim().required(),
  password: joi.string().alphanum().required()
});

export async function signUp(req, res) {
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
  };

  export async function signIn(req, res) {
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
  };