import {BillingDto} from './billing.dto';
import {CalculationDiscountDto} from './calculation-discount.dto';
import {CalculationExpenseDto} from './calculation-expense.dto';

export class CalculationDto {
  billing: BillingDto;
  discount: CalculationDiscountDto;
  expense: CalculationExpenseDto;
}
