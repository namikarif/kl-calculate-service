import {BillingLineDiscountDto} from './billing-line-discount.dto';

export class BillingLineDto {
  id?: number;
  dividable?: boolean;
  external_id?: string;
  company?: any;
  line_type?: string;
  material?: any;
  line_num?: number;
  unit_set?: any;
  unit_set_line?: any;
  unit_multiplier?: number;
  barcode?: string;
  sales_person?: any;
  currency?: any;
  exchange_rate?: number;
  local_price?: number;
  vat_rate?: number;
  vat_included?: string;
  quantity?: number;
  price?: number;
  net_price?: number;
  discount_rate?: string;
  discount_amount?: number;
  expense_rate?: string;
  document_disc_amount?: number;
  document_expense_amount?: number;
  expense_amount?: number;
  vat_amount?: number;
  without_vat_amount?: number;
  net_total_amount?: number;
  gross_total_amount?: number;
  deduction_amount?: number;
  deduction1?: number;
  deduction2?: number;
  warehouse?: any;
  in_out?: string;
  discounts?: Array<BillingLineDiscountDto>;
  expense_rate_type?: string;
  calculation_type?: string;
  vat_group?: any;
  rec_status?: string;
  explanation?: string;
}
