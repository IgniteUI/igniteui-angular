import { Component, OnInit, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { ButtonGroupAlignment, IgxButtonDirective, IgxButtonGroupComponent, IgxIconComponent, IgxLayoutDirective } from 'igniteui-angular';


interface IButton {
    ripple?: string;
    label?: string;
    disabled?: boolean;
    togglable?: boolean;
    selected?: boolean;
    color?: string;
    bgcolor?: string;
    icon?: string;
}

class Button {
    public ripple: string;
    public label: string;
    public disabled: boolean;
    public togglable: boolean;
    public selected: boolean;
    public color: string;
    public bgcolor: string;
    public icon: string;

    constructor(obj?: IButton) {
        this.ripple = obj.ripple || 'gray';
        this.label = obj.label;
        this.selected = obj.selected || false;
        this.togglable = obj.togglable;
        this.disabled = obj.disabled || false;
        this.color = obj.color;
        this.bgcolor = obj.bgcolor;
        this.icon = obj.icon;
    }
}

@Component({
    selector: 'app-buttongroup-sample',
    templateUrl: 'buttonGroup.sample.html',
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxIconComponent, NgFor, IgxLayoutDirective]
})

export class ButtonGroupSampleComponent implements OnInit {
    @ViewChild('programmatic')
    private bg: IgxButtonGroupComponent;

    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;
    public alignOptions: Button[];
    public fontOptions: Button[];
    public cities: Button[];
    public borders: Button[];
    public buttons = ['One', 'Two', 'Three', 'Four'];
    public selectedIndex = 1;

    constructor() { }

    public ngOnInit(): void {

        this.alignOptions = [
            new Button({
                disabled: false,
                icon: 'format_align_left',
                selected: false
            }),
            new Button({
                disabled: false,
                icon: 'format_align_center',
                selected: true
            }),
            new Button({
                disabled: false,
                icon: 'format_align_right',
                selected: false
            }),
            new Button({
                disabled: false,
                icon: 'format_align_justify',
                selected: true
            })
        ];

        this.fontOptions = [
            new Button({
                disabled: false,
                icon: 'format_bold',
                selected: false
            }),
            new Button({
                disabled: false,
                icon: 'format_italic',
                selected: true,
                togglable: false
            }),
            new Button({
                disabled: false,
                icon: 'format_underlined',
                selected: false
            })
        ];

        this.cities = [
            new Button({
                disabled: false,
                label: 'Sofia',
                selected: false,
                togglable: false
            }),
            new Button({
                disabled: false,
                label: 'London',
                selected: false
            }),
            new Button({
                disabled: false,
                label: 'New York',
                selected: false
            }),
            new Button({
                disabled: true,
                label: 'Tokyo',
                selected: false
            })
        ];

        this.borders = [
            new Button({
                disabled: false,
                icon: 'border_top',
                selected: true
            }),
            new Button({
                disabled: false,
                icon: 'border_right',
                selected: false
            }),
            new Button({
                disabled: false,
                icon: 'border_bottom',
                selected: false
            }),
            new Button({
                disabled: false,
                icon: 'border_left',
                selected: false
            })
        ];
    }

    public switchContent() {
        if(this.selectedIndex >= this.buttons.length - 1) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex++;
        }
    }

    public selectLast() {
        this.selectedIndex = 3;
        this.bg.selectButton(3);
    }

}
