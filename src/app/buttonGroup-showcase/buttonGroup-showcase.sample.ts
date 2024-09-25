import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import { ButtonGroupAlignment, IgxButtonDirective, IgxButtonGroupComponent, IgxIconComponent, IgxLayoutDirective } from 'igniteui-angular';
import { defineComponents, IgcButtonGroupComponent, IgcToggleButtonComponent} from "igniteui-webcomponents";

defineComponents(IgcButtonGroupComponent, IgcToggleButtonComponent);
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
    selector: 'app-buttongroup-showcase-sample',
    templateUrl: 'buttonGroup-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxButtonGroupComponent, IgxButtonDirective, IgxIconComponent, NgFor, IgxLayoutDirective]
})

export class ButtonGroupShowcaseSampleComponent implements OnInit {
    @ViewChild('programmatic')
    private bg: IgxButtonGroupComponent;

    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;
    public alignOptions: Button[];
    public cities: Button[];

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
    }
}