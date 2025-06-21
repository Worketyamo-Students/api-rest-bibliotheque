import { Router } from "express";
import loanctl from "../controllers/emprunts.ts"

const loan = Router()

loan.post("/", loanctl.createloan);
loan.get("/id/return", loanctl.getreturnedloan);




export default loan