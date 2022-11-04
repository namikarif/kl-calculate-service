export class BillingDiscountDto {
  id?: number;
  external_id?: string;
  line_type?: string;
  edit?: boolean;
  line_num?: number;
  currency?: any;
  exchange_rate?: number;
  currency_amount?: number;
  rate?: number;
  amount?: number;
  amount_with_rate?: number;
  calculation_type?: string;
  discount_type?: string;
  rec_status?: string;
}
