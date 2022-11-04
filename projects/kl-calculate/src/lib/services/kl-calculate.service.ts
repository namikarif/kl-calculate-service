import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {PrepareCalculateService} from './prepare-calculate.service';
import {UtilService} from './util.service';

@Injectable({
  providedIn: 'root'
})
export class KlCalculateService {

  constructor(private http: HttpClient,
              private utilService: UtilService,
              private calculateService: PrepareCalculateService) {
  }

  calculateAndPost(access_token: string, workingPeriodId: number, api_url: string, data: any) {
    this.calculateService.prepareLines(data.lines).then(billingLine => {
      const response = this.calculateService.calculate(billingLine, data.discounts, data.document_type);
      data.lines = response.lines;
      data.discounts = response.discounts;

      data.discount_amount = 0;
      data.without_vat_amount = 0;
      data.vat_amount = 0;
      data.expense_amount = 0;
      data.net_total_amount = 0;
      data.gross_total_amount = 0;
      for (let i = 0; i < data.lines.length; i++) {
        data.net_total_amount = data.net_total_amount + this.utilService.toIntExt(data.lines[i].net_total_amount);
        data.expense_amount = data.expense_amount + this.utilService.toIntExt(data.lines[i].expense_amount) + this.utilService.toIntExt(data.lines[i].document_expense_amount);
        data.discount_amount = data.discount_amount + this.utilService.toIntExt(data.lines[i].discount_amount) + this.utilService.toIntExt(data.lines[i].document_disc_amount);
        data.vat_amount = data.vat_amount + this.utilService.toIntExt(data.lines[i].vat_amount);
        data.without_vat_amount = data.without_vat_amount + this.utilService.toIntExt(data.lines[i].without_vat_amount);
        data.gross_total_amount = data.gross_total_amount + this.utilService.toIntExt(data.lines[i].gross_total_amount);
      }

      let headers = new HttpHeaders({
        'Authorization': 'Bearer ' + access_token,
        'working-period-id': workingPeriodId ? workingPeriodId.toString() : '0'
      });

      this.http.post(api_url, data, {headers: headers}).subscribe({
        next: (response) => {

        },
        error: (error) => {
          const errorMessage = this.utilService.alertErrorMessage(error);
          alert(errorMessage);
        }
      })
    });
  }
}
