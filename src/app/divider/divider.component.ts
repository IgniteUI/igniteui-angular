import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxButtonDirective, IgxDividerDirective } from 'igniteui-angular';

@Component({
	selector: 'app-divider',
	standalone: true,
	imports: [CommonModule, IgxDividerDirective, IgxButtonDirective],
	templateUrl: './divider.component.html',
	styleUrls: ['./divider.component.scss'],
})
export class DividerComponent {
	@ViewChild(IgxDividerDirective) igxDivider: IgxDividerDirective;

	public direction = false;
	public dashed = false;

	private toggleDividerDirection() {
		this.direction = !this.direction;
		this.updateDivider();
	}

	private toggleDividerType() {
		this.dashed = !this.dashed;
		this.updateDivider();
	}

	get verticalClass() {
		return this.direction ? 'vertical' : '';
	}

	private updateDivider() {
		// Update the igx-divider's 'vertical' property
		this.igxDivider.vertical = this.direction;

		// Update the igx-divider's 'type' property
		this.igxDivider.type = this.dashed ? 'dashed' : 'solid';
	}
}
