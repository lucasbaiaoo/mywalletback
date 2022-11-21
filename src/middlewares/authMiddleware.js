import db from "../database/db.js";

export async function authMiddleware(req, res, next) {
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
    res.locals.session = session;
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

  next();
}
