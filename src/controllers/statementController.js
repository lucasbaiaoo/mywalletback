import dayjs from "dayjs";
import db from "../database/db.js";

export async function postStatement (req, res) {
    const statement = req.body;
    const session = res.locals.session;  
  
      const user = await db.collection("users").findOne({
        _id: session.userId,
      });
      try {
        await db
        .collection("transactions")
        .insertOne({ ...statement, price: Number(statement.price), createdAt: dayjs().format("DD/MM"), name: user.name });
      res.sendStatus(201);
      } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
};

export async function getStatement (req, res) {
  const session = res.locals.session;  

    try {
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
      console.log(error);
      res.sendStatus(500);
    }
  };
