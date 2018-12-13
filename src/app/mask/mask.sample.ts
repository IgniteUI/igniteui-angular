import { Component, Pipe, PipeTransform } from '@angular/core';

interface IPerson {
  name: string;
  socialSecurityNumber: string;
  birthday: Date;
  phone: string;
}

@Component({
    selector: 'app-mask-sample',
    styleUrls: ['mask.sample.css'],
    templateUrl: './mask.sample.html'
})
export class MaskSampleComponent {
    person: IPerson;

    value = '1255';
    mask = '##.##';
    placeholder = '-##.## %';
    displayFormat = new DisplayFormatPipe();
    inputFormat = new InputFormatPipe();

    constructor() {
        this.person = {
          birthday: null,
          name: 'John Doe',
          socialSecurityNumber: '',
          phone: ''
        };
      }

      validateDate(dateInput, snackbar) {
        if (!this.isDateValid(dateInput.value)) {
          this.notify(snackbar, 'Invalid Date', dateInput);
        }
      }

      validateSSN(ssnInput, snackbar) {
        if (!this.isSSNValid(ssnInput.value)) {
          this.notify(snackbar, 'Invalid SSN', ssnInput);
        }
      }

      isDateValid(date) {
        return (new Date(date).toLocaleString() !== 'Invalid Date');
      }

      isSSNValid(ssn) {
        const ssnPattern = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/;
        return (ssn.match(ssnPattern));
      }

      notify(snackbar, message, input) {
        snackbar.message = message;
        snackbar.actionText = 'Dismiss';
        snackbar.show();
      }
}

@Pipe({ name: 'displayFormat' })
export class DisplayFormatPipe implements PipeTransform {
    transform(value: any): string {
        let val = value;

        if (val === '__.__') {
          val = '';
        }

        if (val && val.indexOf('_') !== -1) {
          val = val.replace(new RegExp('_', 'g'), '0');
        }

        if (val && val.indexOf('%') === -1) {
          val += ' %';
        }

        if (val && val.indexOf('-') === -1) {
          val = val.substring(0, 0) + '-' + val.substring(0);
        }

        return val;
    }
}

@Pipe({ name: 'inputFormat' })
export class InputFormatPipe implements PipeTransform {
    transform(value: any): string {
        let val = value;

        if (!val) {
          val = '__.__';
        }

        if (val.indexOf(' %') !== -1) {
          val = val.replace(new RegExp(' %', 'g'), '');
        }

        if (val.indexOf('-') !== -1) {
          val = val.replace(new RegExp('-', 'g'), '');
        }

        return val;
    }
}
