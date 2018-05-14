import { ExceptionFilter, Catch } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Response } from "express";

/**
 * Global Exception Filter for handling errors in the application
 * 
 * @export
 * @class GlobalExceptionFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception, response: Response) {

      const message = (exception instanceof HttpException) ? exception.getResponse() : "Internal error";
      const status = (exception instanceof HttpException) ? exception.getStatus() : 500;

      const result = {
          error: {
              status: status,
              message: JSON.stringify(exception.message),
          }
      };
      
    response
      .status(status)
      .render("error", result);
  }
}