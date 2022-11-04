import {BillingLineDiscountDto} from './billing-line-discount.dto';
import {BillingDiscountDto} from './billing-discount.dto';

export class CalculationDiscountDto {
  net_unit_amount?: number;
  line_amount?: number;
  document_amount?: number;
  lineDiscounts: Array<BillingLineDiscountDto>;
  discounts: Array<BillingDiscountDto>;
}
