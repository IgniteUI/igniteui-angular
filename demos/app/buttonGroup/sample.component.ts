import { Component, OnInit } from "@angular/core";
import { IgxButtonGroupModule, ButtonGroupAlignment } from "../../../src/buttonGroup/buttonGroup.component";
import { IgxDirectivesModule } from "../../../src/modules";
import { IgxButton } from "../../../src/button/button.directive";

interface IButton {
    type?: string,
    ripple?: string,
    label?: string,
    disabled?: boolean
    selected?: boolean,
    color?: string,
    bgcolor?: string,
    icon?: string
}

class Button {
    private type: string;
    private ripple: string;
    private label: string;
    private disabled: boolean;
    private selected: boolean;
    private color: string;
    private bgcolor: string;
    private icon: string;

    constructor(obj?: IButton) {
        this.ripple = obj.ripple || 'gray';
        this.label = obj.label;
        this.selected = obj.selected || false;
        this.disabled = obj.disabled || false;
        this.color = obj.color;
        this.bgcolor = obj.bgcolor || 'white';
        this.icon = obj.icon;
    }
}

@Component({
    selector: "buttongroup-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html',
    styleUrls: ['./sample.styles.css']
})

export class ButtonGroupSampleComponent implements OnInit {
    private multi: boolean = true;
    private alignment = ButtonGroupAlignment.vertical;

    constructor() { }

    private alignOptions: Array<Button>;
    private fontOptions: Array<Button>;
    private cities: Array<Button>;
    private borders: Array<Button>;

    onSelect(args) {
        console.log(args.index + " is selected")
    }
    onUnselect(args) {
        console.log(args.index + " is deselected")
    }
    public ngOnInit(): void {

        this.alignOptions = [
            new Button({
                selected: false,
                disabled: false,
                icon: 'format_align_left'
            }),
            new Button({
                selected: true,
                disabled: false,
                icon: 'format_align_center'
            }),
            new Button({
                selected: false,
                disabled: false,
                icon: 'format_align_right'
            }),
            new Button({
                selected: true,
                disabled: false,
                icon: 'format_align_justify'
            })
        ]

        this.fontOptions = [
            new Button({
                selected: false,
                disabled: false,
                icon: 'format_bold'
            }),
            new Button({
                selected: true,
                disabled: false,
                icon: 'format_italic'
            }),
            new Button({
                selected: false,
                disabled: false,
                icon: 'format_underlined'
            })
        ]

        this.cities = [
            new Button({
                label: 'Sofia',
                selected: true,
                disabled: false
            }),
            new Button({
                label: 'London',
                selected: false,
                disabled: false
            }),
            new Button({
                label: 'New York',
                selected: false,
                disabled: false
            }),
            new Button({
                label: 'Tokyo',
                selected: false,
                disabled: true
            })
        ]

        this.borders = [
            new Button({
                selected: true,
                disabled: false,
                icon: 'border_top'
            }),
            new Button({
                selected: false,
                disabled: false,
                icon: 'border_right'
            }),
            new Button({
                selected: false,
                disabled: false,
                icon: 'border_bottom'
            }),
            new Button({
                selected: false,
                disabled: false,
                icon: 'border_left'
            })
        ]
    }
}
