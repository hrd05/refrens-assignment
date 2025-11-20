import express, { Request, Response } from "express";
import { functions } from "../library/functions";

const router = express.Router();

router.post("/create", createInvoice);

async function createInvoice(req: Request, res: Response) {
  const functionsObj = new functions();

  if (!req.files || !req.files.csv_file) {
    return res.send(
      functionsObj.output(0, "Please provide a CSV file to proceed")
    );
  }

  res.send(functionsObj.output(1, "Success"));
}

module.exports = router;
