import { Component, QueryList, ViewChildren } from '@angular/core';
import {
	IgxButtonDirective,
	IgxDividerDirective,
	IgxIconComponent,
	IgxInputDirective,
	IgxInputGroupComponent, IgxLabelDirective, IgxSwitchComponent,
} from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'app-divider',
	standalone: true,
	imports: [CommonModule, FormsModule, IgxSwitchComponent, IgxButtonDirective, IgxDividerDirective, IgxInputGroupComponent, IgxInputDirective, IgxIconComponent, IgxLabelDirective, ReactiveFormsModule, IgxSwitchComponent],
	templateUrl: './divider.component.html',
	styleUrls: ['./divider.component.scss'],
})
export class DividerComponent {
	@ViewChildren(IgxDividerDirective) private dividers: QueryList<IgxDividerDirective>;

	public direction = false;
	public dashed = false;
	public middle = false;
	public inset = '0px';

	private insetControl = new FormControl('', [this.validateCSSUnit()]);

	// Define a custom validator function
	private validateCSSUnit() {
		return (control: FormControl) => {
			const value = control.value;

			if (value === '0') {
				return null; // Validation passed
			} else {
				// Check if the value contains only text or starts with text
				if (!/^[a-zA-Z]+$/.test(value) && !/^[a-zA-Z].*$/.test(value)) {
					// Define a regular expression for valid CSS units (px, em, %)
					const validCSSUnits = /(px|em|%)$/;

					if (!validCSSUnits.test(value)) {
						return { invalidCSSUnit: true }; // Validation failed
					}
				} else {
					return { invalidCSSUnit: true }; // Validation failed
				}
			}

			return null; // Validation passed
		};
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
