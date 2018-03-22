import { Component } from "@angular/core";

@Component({
    selector: "mask-sample",
    styleUrls: ["sample.component.css", "../../app.samples.css"],
    templateUrl: "./sample.component.html"
})
export class MaskSampleComponent {
    public person: Person;

    constructor() {
        this.person = {
          birthday: null,
          name: "John Doe",
          socialSecurityNumber: "",
          phone: ""
        };
      }

      public validateDate(dateInput, snackbar) {
        if (!this.isDateValid(dateInput.value)) {
          this.notify(snackbar, "Invalid Date", dateInput);
        }
      }
    
      public validateSSN(ssnInput, snackbar) {
        if (!this.isSSNValid(ssnInput.value)) {
          this.notify(snackbar, "Invalid SSN", ssnInput);
        }
      }
    
      private isDateValid(date) {
        return (new Date(date).toLocaleString() !== "Invalid Date");
      }
    
      private isSSNValid(ssn) {
        const ssnPattern = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/;
        return (ssn.match(ssnPattern));
      }
    
      private notify(snackbar, message, input) {
        snackbar.message = message;
        snackbar.show();
        input.focus();
      }
}
export class Person {
    constructor(
        public name: string,
        public socialSecurityNumber: string,
        public birthday: Date,
        public phone: string
      ) {  }
}

