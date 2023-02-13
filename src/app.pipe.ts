import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

// Validate given body, params, query and transform into Dto
// Return HttpException with BadRequest when validation failed.
// HttpException from looks like:
//   {
//     "errors": {
//       "fieldWithError": ["reason1", "reason2"]
//     }
//   }
export class ValidatorPipe extends ValidationPipe {
  public createExceptionFactory() {
    return (validationErrors: ValidationError[]) => {
      let errors = {};
      for (const validError of validationErrors) {
        errors[validError.property] = Object.values(validError.constraints);
      }
      return new HttpException({ errors }, HttpStatus.UNPROCESSABLE_ENTITY);
    };
  }
}
