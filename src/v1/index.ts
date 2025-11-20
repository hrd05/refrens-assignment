import express from "express";

const router = express.Router();

/**
 * Check Access of a chemist or a Staff
 */
async function checkAccess(req: any, res: any, next: any) {
  // Logic to check access

  next();
}

/*
 *  Controllers (route handlers)
 */
let invoiceRouter = require("./controller/invoice");
/*
 * Primary app routes.
 */

router.use("/invoice", invoiceRouter);

module.exports = router;
