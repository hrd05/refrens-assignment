import dateFormat from "dateformat";
import { parse } from "csv-parse/sync";
import XLSX from 'xlsx';
import { groupBy as lodash_groupBy } from 'lodash';
import { validations } from "./validations";

// let ENVIRONMENT: any = process.env.APP_ENV || "localhost";

export class functions {
  constructor() {}

  /**
   * Send output to client with status code and message
   * @param status_code status code of a response
   * @param status_message status message of a response
   * @param data response data
   * @returns object with 3 parameters
   */
  output(status_code: number, status_message: any, data: any = null) {
    let output = {
      status_code: status_code.toString(),
      status_message: status_message,
      datetime: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
      data: data,
    };

    /* if (data.length > 0 || Object.keys(data).length) {
            output.data = data;
        } else {
            delete output.data;
        } */

    return output;
  }

  excelSerialToJSDate(excelSerial: number): string {
    const jsDate = new Date((excelSerial - 25569) * 86400 * 1000);
    return dateFormat(jsDate, "yyyy-mm-dd");
  }


  parseInvoiceFile(file: any): any[] {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
      const csvString = file.data.toString("utf-8");
      return parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    }

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const workbook = XLSX.read(file.data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let rows = XLSX.utils.sheet_to_json(sheet);

      rows = rows.map((row: any) => {
        if(typeof row["Date"] === 'number'){
          row['Date'] = this.excelSerialToJSDate(row['Date']);
        }
        return row;
      })

      return rows;
    }

    throw new Error("File must be CSV or Excel format");
  }

  async processInvoiceFile(file: any) {
    let returnData = {
      error: true,
      message: 'SOMETHING_WENT_WRONG',
      data: {}
    } as { error: boolean, message: string, data: any }

    const validationsObj = new validations();

    try {
      // Parse File
      const parsedData = this.parseInvoiceFile(file);

      if (!parsedData.length) {
        throw new Error('Empty or invalid CSV/Excel File');
      }

      let validateResult = validationsObj.validateParsedInvoiceFile(parsedData);

      if (validateResult.error) {
        returnData.message = validateResult.message;
        return returnData;
      }

      let validatedRows = validateResult.data;
    
      // group by invoice number
      const grouped = lodash_groupBy(validatedRows, "Invoice Number");

      const createdInvoices: any[] = [];
      const failedInvoices: any[] = [];

      // Process each invoice
      for (const invoiceNum in grouped) {
        const invoiceLines = grouped[invoiceNum];

        // If any line has errors → mark whole invoice failed
        if (invoiceLines.some((r) => r.Errors && r.Errors.length)) {
          failedInvoices.push({
            invoiceNumber: invoiceNum,
            errors: invoiceLines.map((r) => r.Errors),
          });
          continue;
        }

        // Build invoice JSON
        const first = invoiceLines[0];

        const invoiceJson = {
          invoiceNumber: first["Invoice Number"],
          date: first["Date"],
          customerName: first["Customer Name"],
          items: invoiceLines.map((r) => ({
            description: r["Item Description"],
            quantity: Number(r["Item Quantity"]),
            price: Number(r["Item Price"]),
            total: Number(r["Item Total"]),
          })),
          invoiceTotal: 0
        };

        // Compute final total
        const recomputedTotal = invoiceJson.items.reduce((sum, it) => sum + it.total, 0);

        invoiceJson["invoiceTotal"] = recomputedTotal;

        // Mock Service
        const result = await this.mockCreateInvoiceService(invoiceJson);
        if(result.success){
          createdInvoices.push(invoiceJson);
        }
        else{
          failedInvoices.push({
            invoiceNumber: invoiceNum,
            error: result.error
          })
        }

      }

      returnData.error = false;
      returnData.message = 'Success';
      returnData.data = {
        validatedRows,
        createdInvoices,
        failedInvoices
      }
      return returnData;
    }
    catch (err: any) {
      returnData.error = true;
      returnData.message = err?.message || 'SOMETHING_WENT_WRONG';
      return returnData;
    }
  }

  async mockCreateInvoiceService(invoiceJson: any) {
    try {
      console.log("Creating Invoice:", invoiceJson);
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }
}
