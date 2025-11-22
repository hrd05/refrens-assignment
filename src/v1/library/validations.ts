import { functions } from "./functions";
import { constants } from '../constants';
import dateFormat from "dateformat";

export class validations {
  constructor() {}

  /**
     * Validate requet object with schema validation
     * @param req req object
     * @param res res object
     * @param next next object to move on next function
     * @param schema schema validation e.g:-
     * const schema = Joi.object({
            doctor_name: Joi.string().trim().replace(/'/g, "").required()
        });
        Ref.: https://joi.dev/api/?v=17.3.0
     */
  validateRequest(req: any, res: any, next: any, schema: any) {
    const options = {
      abortEarly: true, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: false, // remove unknown props
    };

    const { error, value } = schema.validate(req.body, options);
    if (error) {
      let functionsObj = new functions();
      res.send(functionsObj.output(0, error.message));
      return false;
      // next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
      req.body = value;
      next();
    }
  }


  isNumeric(value: any) {
    return !isNaN(Number(value));
  }

  isValidDate(dateStr: string): boolean {

    const ALLOWED_DATE_FORMATS = constants.ALLOWED_DATE_FORMATS;

    return ALLOWED_DATE_FORMATS.some(fmt => {
      try {
        return dateFormat(dateStr, fmt) ? true : false;
      } catch (e) {
        return false;
      }
    });
  }

  validateParsedInvoiceFile(parsed: any[]) {

    let returnData = {
      error: true,
      message: 'SOMETHING_WENT_WRONG',
      data: []
    } as { error: boolean, message: string, data: any[] }

    if (!parsed.length) {
      returnData.message = 'Invalid parsed array input';
      return returnData;
    }

    // Validate Headers
    const REQUIRED_FIELDS = constants.REQUIRED_FIELDS;

    const fileHeaders = Object.keys(parsed[0]);
    const missingHeaders = REQUIRED_FIELDS.filter((f) => !fileHeaders.includes(f));

    if (missingHeaders.length > 0) {
      returnData.message = `Missing required fields: ${missingHeaders.join(", ")}`;
      return returnData;
    }

    let records: InvoiceRow[] = parsed;

    // Validate each row
    const validatedRows: InvoiceRow[] = [];

    for (let row of records) {

      const errors: string[] = [];

      REQUIRED_FIELDS.forEach((f: string) => {
        if (!row[f] || row[f].toString().trim() === "") {
          errors.push(`${f} is required`)
        }
      });

      // Numeric validation
      ["Total Amount", "Item Quantity", "Item Price", "Item Total"].forEach((f) => {
        if (!this.isNumeric(row[f])) {
          errors.push(`${f} must be numeric`)
        }
      });

      // Date validation
      if (!this.isValidDate(row['Date'])) {
        errors.push(`Invalid date format: ${row['Date']}`);
      }

      row.Errors = errors.length ? errors.join("; ") : "";

      validatedRows.push(row);
    }

    returnData.error = false;
    returnData.message = 'Success';
    returnData.data = validatedRows;
    return returnData;
  }

}


export interface InvoiceRow {
  [key: string]: any;
  Errors?: string;
}