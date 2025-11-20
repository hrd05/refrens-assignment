import dateFormat from "dateformat";

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
}
