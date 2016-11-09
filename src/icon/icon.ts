import { Component, ElementRef, Input, NgModule, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'igx-icon',
	moduleId: module.id,
	templateUrl: 'icon.html'
})

export class IgxIcon {
	@ViewChild('icon') themeIcon: ElementRef;

	private font: string = 'material';
	private active: string = 'true';
	private iconColor: string;
	private iconName: string;

    constructor(public el: ElementRef) {}

	@Input('fontSet') set fontSet(value: string) {
		this.font = value || this.font;
	}
	
	@Input('isActive') set isActive(value: string) {
		this.active = value || this.active;
	}

	@Input('color') set color(value: string) {
		this.iconColor = value;
		this.el.nativeElement.style.color = this.iconColor;
	}

	@Input('name') set name(value: string) {
		this.iconName = value;
	}

	get getFontSet(): string {
		return this.font;
	}

	get getActive(): boolean {
		if(this.active.toLowerCase() == 'true') {
			return true;
		} else if(this.active.toLowerCase() == 'false') {
			return false;
		}
	}

	get getIconColor(): string {
		return this.iconColor;
	}

	get getIconName(): string {
		return this.iconName;
	}
}

@NgModule({
    declarations: [IgxIcon],
    exports: [IgxIcon],
    imports: [CommonModule]
})
export class IgxIconModule {}