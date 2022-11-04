export class BillingLineDiscountDto {
  rec_status?: string;
  external_id: string;
  discount_line_type: string;
  amount: number;
  currency_amount: number;
  rate: number;
  exchange_rate: number;
}
