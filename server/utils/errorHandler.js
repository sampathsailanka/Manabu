import { StatusCodes, getReasonPhrase } from "http-status-codes";
import AppError from "./AppError.js";

const errorHandler = (error, request, h) => {
  const statusCode = error.isOperational
    ? error.statusCode
    : StatusCodes.INTERNAL_SERVER_ERROR;
  const status = error.isOperational ? error.status : "error";
  const message = error.isOperational
    ? error.message
    : getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR);

  const response = {
    status,
    message,
    ...AppError(
      process.env.NODE_ENV === "development" && { stack: error.stack }
    ),
  };

  return h.response(response).code(statusCode);
};

export default errorHandler;