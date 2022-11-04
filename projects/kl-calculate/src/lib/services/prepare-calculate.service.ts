import {Injectable} from '@angular/core';
import {CalculateService} from './calculate.service';
import {UtilService} from './util.service';
import {BillingLineDto} from '../models/billing-line.dto';

@Injectable()
export class PrepareCalculateService {

  constructor(private utilService: UtilService,
              private calculateService: CalculateService) {
  }

  keys = [
    'quantity',
    'price',
    'currency',
    'expense_rate_type',
    'calculation_type',
    'exchange_rate',
    'unit_set_line',
    'vat_group',
    'vat_rate',
    'vat_included',
    'gross_total_amount',
    'discount_rate',
    'discount_amount',
    'expense_rate',
    'expense_amount',
    'external_id'
  ];

  billingline = {
    external_id: '0000',
    expense_rate_type: 'BEFORE_DISCOUNT',
    calculation_type: 'RATE',
    vat_rate: 0,
    vat_included: 'NO',
    quantity: 0,
    price: 0,
    net_price: 0,
    vat_amount: 0,
    net_total_amount: 0,
    gross_total_amount: 0,
    discount_rate: '0',
    discount_amount: 0,
    document_disc_amount: 0,
    document_expense_amount: 0,
    expense_rate: '0',
    expense_amount: 0,
    deduction1: 0,
    deduction2: 0,
    without_vat_amount: 0,
    discounts: []
  };
  public billing = [{
    lines: [],
    discounts: [],
    document_type: ''
  }];

  public calculate(lines, discounts, document_type?, priceCalculateFromGross = false) {
    const returnedData = this.calculateService.calculate({lines: lines, discounts: discounts}, priceCalculateFromGross);
    return returnedData.billing;
  }

  calculateUnitPrice(unitPrice, unitMultiplier, currentMultiplier) {
    return (unitPrice * unitMultiplier) / currentMultiplier;
  }

  /* Belge Altı indirim ve Masraf hesaplaması için billing  ve line objesi oluştulur */
  public prepareDocumentDiscount(discountCollection, lineCollection, document_type) {
    if (lineCollection.length > 0) {
      this.billing[0].document_type = document_type;
      this.billing[0].lines = [];
      for (let i = 0; i < lineCollection.length; i++) {
        this.billing[0].lines.push(this.utilService.deepCopy(this.billingline));
        this.keys.forEach(key => {
          this.billing[0].lines[i][key] = lineCollection[i][key];
        });
        this.billing[0].discounts = discountCollection;
      }
      const returnedData = this.calculateService.calculate(this.billing[0]);
      return returnedData.billing;
    }
  }

  /* Satir hesaplaması için billingLine objesi oluşturulur */
  public prepareLines(lines: Array<BillingLineDto>) {
    this.billing[0].lines = [];
    return new Promise((resolve, reject) => {
      for (let i = 0; i < lines.length; i++) {
        this.billing[0].lines.push(this.utilService.deepCopy(this.billingline));
        this.keys.forEach(key => {
          this.billing[0].lines[i][key] = lines[i][key];
        });
      }
      resolve(this.billing[0].lines);
    });
  }
}
