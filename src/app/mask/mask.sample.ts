import { Component } from '@angular/core';

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

