import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import user from "./routes/userroutes.ts";
import morgan from "morgan"
const app = express();
app.use(bodyParser.json());
app.use(morgan("dev"))

app.use("/user", user);


const port = process.env.PORT;
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`server running on port ${port}`);
});
