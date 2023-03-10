import { Component, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IgxHintDirective } from '../../../projects/igniteui-angular/src/lib/directives/hint/hint.directive';
import { IgxSnackbarComponent } from '../../../projects/igniteui-angular/src/lib/snackbar/snackbar.component';
import { IgxTextSelectionDirective } from '../../../projects/igniteui-angular/src/lib/directives/text-selection/text-selection.directive';
import { IgxMaskDirective } from '../../../projects/igniteui-angular/src/lib/directives/mask/mask.directive';
import { IgxLabelDirective } from '../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';

interface IPerson {
  name: string;
  socialSecurityNumber: string;
  birthday: Date;
  phone: string;
}

@Component({
    selector: 'app-mask-sample',
    styleUrls: ['mask.sample.scss'],
    templateUrl: './mask.sample.html',
    standalone: true,
    imports: [FormsModule, IgxInputGroupComponent, IgxInputDirective, IgxLabelDirective, IgxMaskDirective, IgxTextSelectionDirective, IgxSnackbarComponent, IgxHintDirective]
})
export class MaskSampleComponent {
    public person: IPerson;
    public value = '1255';
    public mask = '##.##';
    public placeholder = '-##.## %';
    public displayFormat = new DisplayFormatPipe();
    public inputFormat = new InputFormatPipe();

    constructor() {
        this.person = {
          birthday: null,
          name: 'John Doe',
          socialSecurityNumber: '',
          phone: ''
        };
    }

    public validateDate(dateInput, snackbar) {
        if (!this.isDateValid(dateInput.value)) {
            this.notify(snackbar, 'Invalid Date');
        }
    }

    public validateSSN(ssnInput, snackbar) {
        if (!this.isSSNValid(ssnInput.value)) {
            this.notify(snackbar, 'Invalid SSN');
        }
    }

    public isDateValid(date) {
        return (new Date(date).toLocaleString() !== 'Invalid Date');
    }

    public isSSNValid(ssn) {
        const ssnPattern = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/;
        return (ssn.match(ssnPattern));
    }

    public notify(snackbar, message) {
        snackbar.message = message;
        snackbar.actionText = 'Dismiss';
        snackbar.open();
    }
}

@Pipe({
    name: 'displayFormat',
    standalone: true
})
export class DisplayFormatPipe implements PipeTransform {
    public transform(value: any): string {
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

@Pipe({
    name: 'inputFormat',
    standalone: true
})
export class InputFormatPipe implements PipeTransform {
    public transform(value: any): string {
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
