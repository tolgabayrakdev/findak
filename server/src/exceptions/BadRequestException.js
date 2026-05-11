import HttpException from './HttpException.js';

export default class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}
