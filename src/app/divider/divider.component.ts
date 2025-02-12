import { Component, QueryList, ViewChildren } from '@angular/core';
import {
	IgxDividerDirective, IgxHintDirective,
	IgxIconComponent,
	IgxInputDirective,
	IgxInputGroupComponent, IgxLabelDirective, IgxSwitchComponent,
} from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import {
	AbstractControl,
	FormControl,
	FormsModule,
	ReactiveFormsModule,
	ValidationErrors,
	ValidatorFn,
} from '@angular/forms';

@Component({
    selector: 'app-divider',
    imports: [
        CommonModule,
        FormsModule,
        IgxSwitchComponent,
        IgxDividerDirective,
        IgxInputGroupComponent,
        IgxInputDirective,
        IgxIconComponent,
        IgxLabelDirective,
        ReactiveFormsModule,
        IgxSwitchComponent,
        IgxHintDirective
    ],
    templateUrl: './divider.component.html',
    styleUrls: ['./divider.component.scss']
})
export class DividerComponent {
	@ViewChildren(IgxDividerDirective) private dividers: QueryList<IgxDividerDirective>;

	public direction = false;
	public dashed = false;
	public middle = false;
	public inset = '0px';

	public insetControl = new FormControl('', [this.validateCSSUnit()]);

	public validateCSSUnit(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const inputValue = control.value;

			// If the value is zero, it's invalid
			if (this.isZeroValue(inputValue)) {
				return { invalidCSSUnit: true };
			}

			// If the value contains only alphabets, it's invalid
			if (this.containsOnlyText(inputValue)) {
				return { invalidCSSUnit: true };
			}

			// If the value contains only numbers, it's invalid
			if (this.containsOnlyNumbers(inputValue)) {
				return { invalidCSSUnit: true };
			}

			// If the value doesn't start with a number or a negative sign followed by a number, it's invalid
			if (!this.startsWithNumberOrNegativeNumber(inputValue)) {
				return { invalidCSSUnit: true };
			}

			// If the value doesn't match the valid CSS units, it's invalid
			if (!this.isValidCSSUnit(inputValue)) {
				return { invalidCSSUnit: true };
			}

			return null;
		};
	}

	private isZeroValue(value: string) {
		return value === '0';
	}

	private containsOnlyText(value: string) {
		return /^[a-zA-Z]+$/.test(value);
	}

	private containsOnlyNumbers(value: string) {
		return /^-?[0-9]+$/.test(value);
	}

	private startsWithNumberOrNegativeNumber(value: string) {
		return /^-?[0-9]/.test(value);
	}

	private isValidCSSUnit(value: string) {
		const validUnits = /^-?\d+(\.\d+)?(px|em|rem|vw|vh|%)$/;
		return validUnits.test(value);
	}


	public onInsetInputChange(event: any) {
		const value = event.target.value;
		// Update the inset value whenever the user types
		this.inset = value;
	}

	public toggleDirection(event: any) {
		this.direction = event.checked;
		this.updateDivider();
	}

	public toggleType(event: any) {
		this.dashed = event.checked;
		this.updateDivider();
	}

	public toggleMiddle(event: any) {
		this.middle = event.checked;
		this.updateDivider();
	}

	private updateDivider() {
		// Update the igx-divider properties
		this.dividers.forEach((divider) => {
			divider.vertical = this.direction;
			divider.type = this.dashed ? 'dashed' : 'solid';
			divider.middle = this.middle;
			divider.inset = this.inset;
		});
	}
}
