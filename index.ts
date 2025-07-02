import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import user from "./routes/userroutes.ts";
import book from "./routes/bookroute.ts";
import loan from "./routes/empruntsroutes.ts"
import morgan from "morgan"
import cookieParser from "cookie-parser";
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use("/user", user);
app.use("/book", book);
app.use("/loan" , loan)

const port = process.env.PORT;
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`server running on port ${port}`);
});
