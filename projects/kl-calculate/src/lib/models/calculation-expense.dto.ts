import {CalculationDiscountDto} from './calculation-discount.dto';
import {BillingLineDiscountDto} from './billing-line-discount.dto';
import {BillingDiscountDto} from './billing-discount.dto';

export class CalculationExpenseDto {
  net_unit_amount: number;
  line_amount: number;
  document_amount: number;
  vat_amount: number;
  temp_vat_amount: number;
  calculationDiscount: CalculationDiscountDto;
  lineExpenses: Array<BillingLineDiscountDto>;
  expenses: Array<BillingDiscountDto>;
}

