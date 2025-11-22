import express, { Request, Response } from "express";
import { functions } from "../library/functions";

const router = express.Router();

router.post("/create", createInvoice);

async function createInvoice(req: Request, res: Response) {
  const functionsObj = new functions();

  if (!req.files || !req.files.invoice_file) {
    return res.send(functionsObj.output(0, "Please provide a CSV file to proceed"));
  }

  const file: any = req.files.invoice_file;
  try {

    let result = await functionsObj.processInvoiceFile(file);
    if (result.error) {
      throw new Error(result.message);
    }

    let { validatedRows, createdInvoices, failedInvoices } = result.data;
    return res.send(functionsObj.output(1, "Processing complete", { rows: validatedRows, createdInvoices, failedInvoices }));
    
  } catch (err: any) {
    console.error(err);
    return res.send(functionsObj.output(0, err?.message || 'SOMETHING_WENT_WRONG'));
  }
}

module.exports = router;
