import { Router } from "express";
import bookctl from "../controllers/bookctl.ts"

const book = Router()

book.post("/", bookctl.createbook);
book.get("/", bookctl.getAllBooks);
book.put("/:id", bookctl.updatebook);
book.delete("/:id", bookctl.deletebook);



export default book