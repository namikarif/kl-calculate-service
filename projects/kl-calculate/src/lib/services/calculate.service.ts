import {Injectable} from '@angular/core';
import {BillingDto} from '../models/billing.dto';
import {BillingDiscountDto} from '../models/billing-discount.dto';
import {CalculationDto} from '../models/calculation.dto';
import {BillingLineDto} from '../models/billing-line.dto';
import {BillingLineDiscountDto} from '../models/billing-line-discount.dto';
import {CalculationDiscountDto} from '../models/calculation-discount.dto';
import {CalculationExpenseDto} from '../models/calculation-expense.dto';
import {UtilService} from './util.service';

@Injectable({
  providedIn: 'root'
})
export class CalculateService {

  newBilling: BillingDto = new BillingDto();
  purchaseCalculation: CalculationDto = new CalculationDto();


  constructor(private utilService: UtilService) {

  }


  deductionAmount(vatAmount: number, deduction1: number, deduction2: number) {
    let deductionRate = 0;
    let deductionAmount = 0;
    if ((deduction1 > 0) && (deduction2 > 0)) {
      deductionRate = (deduction1 / deduction2) * 100;
      deductionAmount = (vatAmount / 100) * deductionRate;
    }

    return deductionAmount;
  }

  calculate(billing: BillingDto, priceCalculateFromGross = false) {
    this.newBilling.discount_amount = 0;
    this.newBilling.expense_amount = 0;
    this.newBilling.vat_amount = 0;
    this.newBilling.without_vat_amount = 0;
    this.newBilling.net_total_amount = 0;
    this.newBilling.gross_total_amount = 0;
    this.newBilling.discounts = new Array<BillingDiscountDto>();
    this.newBilling.lines = new Array<BillingLineDto>();

    const purchaseCalculation: CalculationDto = new CalculationDto();

    billing.lines.forEach(externalBillingLine => {
      let line_discount_rate = '';
      let line_expense_rate = '';
      let localPrice = 0;
      let billingLine: BillingLineDto = new BillingLineDto();
      let lineCalculationDiscount: CalculationDiscountDto = new CalculationDiscountDto();
      let lineCalculationExpense: CalculationExpenseDto = new CalculationExpenseDto();
      lineCalculationDiscount.net_unit_amount = 0;
      lineCalculationDiscount.line_amount = 0;
      lineCalculationDiscount.document_amount = 0;
      lineCalculationDiscount.discounts = new Array<BillingDiscountDto>();
      lineCalculationDiscount.lineDiscounts = new Array<BillingLineDiscountDto>();
      lineCalculationExpense.net_unit_amount = 0;
      lineCalculationExpense.line_amount = 0;
      lineCalculationExpense.document_amount = 0;
      lineCalculationExpense.vat_amount = 0;
      lineCalculationExpense.temp_vat_amount = 0;
      lineCalculationExpense.expenses = new Array<BillingDiscountDto>();
      lineCalculationExpense.lineExpenses = new Array<BillingLineDiscountDto>();

      billing.discount_amount = 0;
      billing.expense_amount = 0;
      billing.vat_amount = 0;
      billing.without_vat_amount = 0;
      billing.net_total_amount = 0;
      //billing.gross_total_amount = 0;

      billingLine = this.utilService.deepCopy(externalBillingLine);
      billingLine.document_disc_amount = 0;
      billingLine.document_expense_amount = 0;
      billingLine.vat_amount = 0;
      billingLine.without_vat_amount = 0;
      billingLine.net_total_amount = 0;
      //billingLine.gross_total_amount = 0;
      if (billingLine.rec_status === 'DELETE') {
        return;
      }


      // Birim Fiyat tutardan hesaplanacak ise
      if (priceCalculateFromGross) {
        if (billingLine.quantity > 0 && billingLine.gross_total_amount > 0) {
          localPrice = billingLine.gross_total_amount / billingLine.quantity;
          localPrice = this.utilService.round(localPrice, 5);
          billingLine.price = localPrice;
        }
      }

      localPrice = billingLine.price;

      if (billingLine.exchange_rate > 0) {
        localPrice = localPrice * billingLine.exchange_rate;
      }
      if (billingLine.vat_included === 'NO') {
        lineCalculationDiscount.net_unit_amount = localPrice;
      } else {
        lineCalculationDiscount.net_unit_amount = (localPrice / (1 + (billingLine.vat_rate / 100)));
      }
      lineCalculationDiscount.net_unit_amount = this.utilService.round(lineCalculationDiscount.net_unit_amount, 5);
      lineCalculationExpense.net_unit_amount = lineCalculationDiscount.net_unit_amount;

      lineCalculationDiscount = this.prepareDiscount(lineCalculationDiscount, billingLine, billing.discounts, billing.lines);
      billingLine.discount_amount = lineCalculationDiscount.line_amount;
      lineCalculationExpense.calculationDiscount = lineCalculationDiscount;

      lineCalculationExpense = this.prepareExpense(lineCalculationExpense, billingLine, billing.discounts, billing.lines);
      billingLine.expense_amount = lineCalculationExpense.line_amount;
      lineCalculationDiscount.document_amount = this.utilService.round(lineCalculationDiscount.document_amount, 2);
      lineCalculationDiscount.line_amount = this.utilService.round(lineCalculationDiscount.line_amount, 2);
      lineCalculationExpense.document_amount = this.utilService.round(lineCalculationExpense.document_amount, 2);
      lineCalculationExpense.line_amount = this.utilService.round(lineCalculationExpense.line_amount, 2);
      lineCalculationExpense.vat_amount = this.utilService.round(lineCalculationExpense.vat_amount, 2);

      billingLine.gross_total_amount = this.utilService.round(billingLine.quantity * localPrice, 2);
      billingLine.without_vat_amount = lineCalculationDiscount.net_unit_amount * billingLine.quantity;
      billingLine.vat_amount = (billingLine.without_vat_amount / 100) * billingLine.vat_rate;
      billingLine.local_price = this.utilService.round(localPrice, 5);
      billingLine.net_price = this.utilService.round(lineCalculationDiscount.net_unit_amount, 5);
      if ((billingLine.deduction1 != null) && (billingLine.deduction2 != null)) {
        billingLine.deduction_amount = (this.utilService.round(this.deductionAmount(billingLine.vat_amount, billingLine.deduction1, billingLine.deduction2), 2));
      } else {
        billingLine.deduction_amount = 0;
      }
      billingLine.deduction_amount = this.utilService.round(billingLine.deduction_amount, 2);
      billingLine.without_vat_amount = this.utilService.round(billingLine.without_vat_amount, 2);
      billingLine.vat_amount = this.utilService.round(billingLine.vat_amount, 2);
      billingLine.without_vat_amount = this.utilService.round(billingLine.without_vat_amount + lineCalculationExpense.line_amount + lineCalculationExpense.document_amount, 2);
      billingLine.vat_amount = this.utilService.round(billingLine.vat_amount + lineCalculationExpense.vat_amount - billingLine.deduction_amount, 2);
      billingLine.net_total_amount = this.utilService.round(billingLine.vat_amount + billingLine.without_vat_amount, 2);
      billingLine.gross_total_amount = this.utilService.round(billingLine.gross_total_amount, 2);
      billingLine.discounts = new Array<BillingLineDiscountDto>();

      lineCalculationDiscount.discounts.forEach(discount => {
        let foundDiscount = new BillingDiscountDto();
        foundDiscount = this.newBilling.discounts.find(_discount =>
          _discount.line_type === discount.line_type &&
          _discount.external_id !== null &&
          _discount.external_id === discount.external_id);
        if (foundDiscount) {
          foundDiscount.amount = foundDiscount.amount + discount.amount;
        } else {
          this.newBilling.discounts.push(discount);
        }
      });

      lineCalculationDiscount.lineDiscounts.forEach(discount => {
        line_discount_rate = line_discount_rate + discount.rate + '+';
        billingLine.discounts.push(discount);
      });

      if (line_discount_rate.length > 0) {
        line_discount_rate = line_discount_rate.substring(0, line_discount_rate.length - 1);
        billingLine.discount_rate = line_discount_rate;
      }


      lineCalculationExpense.expenses.forEach(expense => {
        let foundDiscount = new BillingDiscountDto();
        foundDiscount = this.newBilling.discounts.find(_discount =>
          _discount.line_type === expense.line_type &&
          _discount.external_id !== null &&
          _discount.external_id === expense.external_id);
        if (foundDiscount) {
          foundDiscount.amount = foundDiscount.amount + expense.amount;
        } else {
          this.newBilling.discounts.push(expense);
        }
      });

      lineCalculationExpense.lineExpenses.forEach(expense => {
        line_expense_rate = line_expense_rate + expense.rate + '+';
        billingLine.discounts.push(expense);
      });

      if (line_expense_rate.length > 0) {
        line_expense_rate = line_expense_rate.substring(0, line_expense_rate.length - 1);
        billingLine.expense_rate = line_expense_rate;
      }


      this.newBilling.lines.push(billingLine);
      if (billingLine.document_disc_amount != null) {
        this.newBilling.discount_amount = this.utilService.round((this.newBilling.discount_amount + billingLine.document_disc_amount + billingLine.discount_amount), 2);
      }
      if (billingLine.document_expense_amount != null) {
        this.newBilling.expense_amount = this.utilService.round((this.newBilling.expense_amount + billingLine.document_expense_amount + billingLine.expense_amount), 2);
      }
      if (billingLine.vat_amount != null) {
        this.newBilling.vat_amount = this.utilService.round((this.newBilling.vat_amount + billingLine.vat_amount), 2);
      }
      if (billingLine.without_vat_amount != null) {
        this.newBilling.without_vat_amount = this.utilService.round((this.newBilling.without_vat_amount + billingLine.without_vat_amount), 2);
      }
      if (billingLine.net_total_amount != null) {
        this.newBilling.net_total_amount = this.utilService.round((this.newBilling.net_total_amount + billingLine.net_total_amount), 2);
      }
      if (billingLine.gross_total_amount != null) {
        this.newBilling.gross_total_amount = this.utilService.round((this.newBilling.gross_total_amount + billingLine.gross_total_amount), 2);
      }
    });

    purchaseCalculation.billing = this.newBilling;
    return purchaseCalculation;
  }

  prepareDiscount(calculationDiscount: CalculationDiscountDto, billingLine: BillingLineDto, discounts: Array<BillingDiscountDto>, billingLines: Array<BillingLineDto>) {

    let tempGrossTotalAmount = 0;
    let rates = [];

    if (billingLine.discount_rate) {
      rates = billingLine.discount_rate.split('+', 20);
    }


    billingLines.forEach(externalBillingLine => {
      let localPrice = 0;
      if (externalBillingLine.exchange_rate > 0) {
        localPrice = billingLine.price * externalBillingLine.exchange_rate;
      } else {
        localPrice = externalBillingLine.price;
      }

      localPrice = this.utilService.round(localPrice, 5);

      tempGrossTotalAmount = tempGrossTotalAmount + (externalBillingLine.quantity * localPrice) - externalBillingLine.discount_amount;
    });

    if (billingLine.calculation_type === 'RATE') {
      rates.forEach(rate => {
        rate = rate.replace(',', '.');
        let discountRate = 0;
        let tempDiscountAmount = 0;
        if (rate > 0) {

          if (rate > 100) {
            discountRate = 100;
          } else {
            discountRate = parseFloat(rate);
          }

          tempDiscountAmount = ((calculationDiscount.net_unit_amount / 100) * discountRate) * billingLine.quantity;
          calculationDiscount.net_unit_amount = calculationDiscount.net_unit_amount - ((calculationDiscount.net_unit_amount / 100) * discountRate);
          calculationDiscount.line_amount = calculationDiscount.line_amount + tempDiscountAmount;

          const billingLineDiscount: BillingLineDiscountDto = new BillingLineDiscountDto();
          billingLineDiscount.external_id = billingLine.external_id;
          billingLineDiscount.discount_line_type = 'DISCOUNT';
          billingLineDiscount.rate = this.utilService.round(discountRate, 2);
          billingLineDiscount.amount = this.utilService.round(tempDiscountAmount, 2);
          calculationDiscount.lineDiscounts.push(billingLineDiscount);
        }
      });
    } else if (billingLine.calculation_type === 'AMOUNT') {
      let discountRate = 0;
      let tempDiscountAmount = 0;
      if (billingLine.discount_amount > 0) {
        discountRate = (billingLine.discount_amount / (calculationDiscount.net_unit_amount * billingLine.quantity)) * 100;
        billingLine.discount_rate = this.utilService.round(discountRate, 5).toString();
        tempDiscountAmount = ((calculationDiscount.net_unit_amount / 100) * discountRate) * billingLine.quantity;
        calculationDiscount.net_unit_amount = (calculationDiscount.net_unit_amount - ((calculationDiscount.net_unit_amount / 100) * discountRate));
        calculationDiscount.line_amount = calculationDiscount.line_amount + tempDiscountAmount;
        const billingLineDiscount: BillingLineDiscountDto = new BillingLineDiscountDto();
        billingLineDiscount.external_id = billingLine.external_id;
        billingLineDiscount.discount_line_type = 'DISCOUNT';
        billingLineDiscount.rate = this.utilService.round(discountRate, 2);
        billingLineDiscount.amount = this.utilService.round(tempDiscountAmount, 2);
        calculationDiscount.lineDiscounts.push(billingLineDiscount);
      }
    }
    calculationDiscount.line_amount = this.utilService.round(calculationDiscount.line_amount, 2);

    if (discounts.length > 0) {
      discounts.forEach(discount => {
        if (discount.line_type === 'DISCOUNT') {
          let tempDiscountAmount = 0;
          let discountRate = 0;
          if (discount.rec_status === 'DELETE') {
            return;
          }
          if ((discount.calculation_type === 'RATE') && (discount.rate > 0)) {

            if (discount.rate > 100) {
              discountRate = 100;
            } else {
              discountRate = discount.rate;
            }


            tempDiscountAmount = ((calculationDiscount.net_unit_amount / 100) * discountRate) * billingLine.quantity;
            calculationDiscount.net_unit_amount = calculationDiscount.net_unit_amount - ((calculationDiscount.net_unit_amount / 100) * discountRate);
            calculationDiscount.document_amount = calculationDiscount.document_amount + tempDiscountAmount;
          } else if ((discount.calculation_type === 'AMOUNT') && (discount.amount > 0)) {
            discountRate = (discount.amount / (tempGrossTotalAmount - calculationDiscount.line_amount)) * 100;
            discountRate = this.utilService.round(discountRate, 5);

            if (discountRate > 100) {
              discountRate = 100;
            }
            tempDiscountAmount = ((calculationDiscount.net_unit_amount / 100) * discountRate) * billingLine.quantity;
            calculationDiscount.net_unit_amount = (calculationDiscount.net_unit_amount - ((calculationDiscount.net_unit_amount / 100) * discountRate));
            calculationDiscount.document_amount = calculationDiscount.document_amount + tempDiscountAmount;

          }

          const billingDiscount: BillingDiscountDto = new BillingDiscountDto();
          billingDiscount.external_id = discount.external_id;
          billingDiscount.calculation_type = discount.calculation_type;
          billingDiscount.line_type = discount.line_type;
          billingDiscount.exchange_rate = discount.exchange_rate;
          billingDiscount.rate = this.utilService.round(discountRate, 2);
          billingDiscount.amount = this.utilService.round(tempDiscountAmount, 2);

          calculationDiscount.discounts.push(billingDiscount);
          if (billingLine.document_disc_amount === null) {
            billingLine.document_disc_amount = 0;
          }

          billingLine.document_disc_amount = (billingLine.document_disc_amount + billingDiscount.amount);
        }
      });
    }

    return calculationDiscount;
  }

  prepareExpense(calculationExpense: CalculationExpenseDto, billingLine: BillingLineDto, discounts: Array<BillingDiscountDto>, billingLines: Array<BillingLineDto>) {
    let rates = [];
    let tempGrossTotalAmount = 0;
    if (billingLine.expense_rate) {
      rates = billingLine.expense_rate.split('+', 20);
    }


    billingLines.forEach(externalBillingLine => {
      let localPrice = 0;
      if (externalBillingLine.exchange_rate > 0) {
        localPrice = billingLine.price * externalBillingLine.exchange_rate;
      } else {
        localPrice = externalBillingLine.price;
      }

      localPrice = this.utilService.round(localPrice, 5);
      tempGrossTotalAmount = tempGrossTotalAmount + (externalBillingLine.quantity * localPrice);
    });


    if (billingLine.calculation_type === 'RATE') {
      rates.forEach(rate => {
        rate = rate.replace(',', '.');
        let expenseRate = 0;
        let tempExpenseAmount = 0;

        expenseRate = rate;

        if (expenseRate > 0) {

          if (billingLine.expense_rate_type === 'BEFORE_DISCOUNT') {
            tempExpenseAmount = ((calculationExpense.net_unit_amount / 100) * expenseRate) * billingLine.quantity;
          } else if (billingLine.expense_rate_type === 'AFTER_DISCOUNT') {
            tempExpenseAmount = ((calculationExpense.calculationDiscount.net_unit_amount / 100) * expenseRate) * billingLine.quantity;
          }
          tempExpenseAmount = this.utilService.round(tempExpenseAmount, 2);
          calculationExpense.vat_amount = (calculationExpense.vat_amount + ((tempExpenseAmount / 100) * billingLine.vat_rate));
          calculationExpense.vat_amount = this.utilService.round(calculationExpense.vat_amount, 2);
          calculationExpense.line_amount = calculationExpense.line_amount + tempExpenseAmount;
          const billingLineDiscount: BillingLineDiscountDto = new BillingLineDiscountDto();
          billingLineDiscount.external_id = billingLine.external_id;
          billingLineDiscount.discount_line_type = 'EXPENSE';
          billingLineDiscount.rate = this.utilService.round(expenseRate, 2);
          billingLineDiscount.amount = this.utilService.round(tempExpenseAmount, 2);
          calculationExpense.lineExpenses.push(billingLineDiscount);
        }
      });
    } else if (billingLine.calculation_type === 'AMOUNT') {
      let expenseRate = 0;
      let tempExpenseAmount = 0;
      if (billingLine.expense_rate_type === 'BEFORE_DISCOUNT') {
        expenseRate = (billingLine.expense_amount / (calculationExpense.net_unit_amount * billingLine.quantity) * 100);
        billingLine.expense_rate = this.utilService.round(expenseRate, 5).toString();
        tempExpenseAmount = ((calculationExpense.net_unit_amount / 100) * expenseRate) * billingLine.quantity;
        tempExpenseAmount = this.utilService.round(tempExpenseAmount, 2);
      }

      if (billingLine.expense_rate_type === 'AFTER_DISCOUNT') {
        expenseRate = (billingLine.expense_amount / (calculationExpense.calculationDiscount.net_unit_amount * billingLine.quantity) * 100);
        tempExpenseAmount = ((calculationExpense.calculationDiscount.net_unit_amount / 100) * expenseRate) * billingLine.quantity;
        tempExpenseAmount = this.utilService.round(tempExpenseAmount, 2);
      }
      calculationExpense.vat_amount = (calculationExpense.vat_amount + ((tempExpenseAmount / 100) * billingLine.vat_rate));
      calculationExpense.vat_amount = this.utilService.round(calculationExpense.vat_amount, 2);
      calculationExpense.line_amount = calculationExpense.line_amount + tempExpenseAmount;
      const billingLineDiscount: BillingLineDiscountDto = new BillingLineDiscountDto();
      billingLineDiscount.external_id = billingLine.external_id;
      billingLineDiscount.discount_line_type = 'EXPENSE';
      billingLineDiscount.rate = this.utilService.round(expenseRate, 2);
      billingLineDiscount.amount = this.utilService.round(tempExpenseAmount, 2);
      calculationExpense.lineExpenses.push(billingLineDiscount);
    }

    if (discounts.length > 0) {
      discounts.forEach(discount => {
        if (discount.line_type === 'EXPENSE') {
          let tempExpenseAmount = 0;
          let tempExpenseVatAmount = 0;
          let expenseRate = 0;
          if (discount.rec_status === 'DELETE') {
            return;
          }
          if ((discount.calculation_type === 'RATE') && (discount.rate > 0)) {

            if (discount.rate > 100) {
              expenseRate = 100;
            } else {
              expenseRate = discount.rate;
            }

            if (billingLine.expense_rate_type === 'BEFORE_DISCOUNT') {
              tempExpenseAmount = ((calculationExpense.net_unit_amount / 100) * expenseRate) * billingLine.quantity;
              tempExpenseAmount = this.utilService.round(tempExpenseAmount, 2);

              tempExpenseVatAmount = (tempExpenseAmount / 100) * billingLine.vat_rate;
              tempExpenseVatAmount = this.utilService.round(tempExpenseVatAmount, 2);
            }


          }
          if (discount.calculation_type === 'AMOUNT' && (discount.amount > 0)) {
            if (billingLine.expense_rate_type === 'BEFORE_DISCOUNT') {

              expenseRate = (discount.amount / tempGrossTotalAmount) * 100;

              tempExpenseAmount = ((calculationExpense.net_unit_amount / 100) * expenseRate) * billingLine.quantity;
              tempExpenseAmount = this.utilService.round(tempExpenseAmount, 2);

              tempExpenseVatAmount = (tempExpenseAmount / 100) * billingLine.vat_rate;
              tempExpenseVatAmount = this.utilService.round(tempExpenseVatAmount, 2);


            }

          }

          calculationExpense.document_amount = (calculationExpense.document_amount + tempExpenseAmount);
          calculationExpense.vat_amount = (calculationExpense.vat_amount + tempExpenseVatAmount);

          const billingDiscount: BillingDiscountDto = new BillingDiscountDto();
          billingDiscount.external_id = discount.external_id;
          billingDiscount.calculation_type = discount.calculation_type;
          billingDiscount.line_type = discount.line_type;
          billingDiscount.exchange_rate = discount.exchange_rate;
          billingDiscount.rate = this.utilService.round(expenseRate, 2);
          billingDiscount.amount = this.utilService.round(tempExpenseAmount, 2);
          calculationExpense.expenses.push(billingDiscount);
          if (billingLine.document_expense_amount === null) {
            billingLine.document_expense_amount = 0;
          }
          billingLine.document_expense_amount = billingLine.document_expense_amount + billingDiscount.amount;
        }
      });
    }
    return calculationExpense;
  }
}
