import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  deepCopy<T>(source: T): T {
    if (source === undefined) {
      return null;
    } else {
      return JSON.parse(JSON.stringify(source));
    }
  }

  round(number, precision) {
    const factor = Math.pow(10, precision);
    const tempNumber = number * factor;
    const roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  }

  toIntExt(value) {
    if (value !== null) {
      if (typeof value === 'string') {
        return parseInt(value);
      } else if (typeof value === 'number') {
        return value;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  alertErrorMessage(error: any, serviceLevel = true) {
    let message = '';
    if (error instanceof HttpErrorResponse && serviceLevel === true) {
      const responseError = error.error;
      if (error.status >= 400 && responseError) {
        if (error.status === 404) {
          message = responseError.path + ' ' + responseError.error;
        } else if (error.status === 409 || error.status === 423) {
          if (responseError.hasOwnProperty('uimessage')) {
            message = responseError.uimessage[0] ? responseError.uimessage[0].text : '';
          }
        } else {
          if (responseError.hasOwnProperty('uimessage')) {
            message = responseError.uimessage[0] ? (responseError.uimessage[0].text + '\n') : '';
            if (responseError.iomessage.length > 0) {
              message = message + (responseError.iomessage[1] ? responseError.iomessage[1].text : responseError.iomessage[0].text) + '\n';
            }
          } else if (responseError.hasOwnProperty('error_description')) {
            message = responseError.error_description === 'Bad credentials' ? 'Hatalı kullanıcı adı ya da şifre' : 'Giriş yapılamadı';
          } else if (responseError.hasOwnProperty('exception')) {
            message = responseError.exception;
          } else {
            message = 'Bilinmeyen bir hata meydana geldi.';
          }
        }
      } else {
        message = 'Sunucuya bağlanılamadı.';
      }
    } else {
      if (error.name === 'HttpErrorResponse') {
        if (error.status === 400) {
          message = 'Post edilen veri hatalı';
        } else {
          message = 'Sunucuya bağlanılamadı.';
        }
      } else {
        message = error.message ? error.message : error.toString();
      }
    }
    return message;
  }
}
