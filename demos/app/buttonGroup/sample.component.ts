import { Component, OnInit } from "@angular/core";
import { IgxButton } from "../../../src/button/button.directive";
import { ButtonGroupAlignment, IgxButtonGroupModule } from "../../../src/buttonGroup/buttonGroup.component";
import { IgxDirectivesModule } from "../../../src/modules";

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
    private ripple: string;
    private label: string;
    private disabled: boolean;
    private togglable: boolean;
    private selected: boolean;
    private color: string;
    private bgcolor: string;
    private icon: string;

    constructor(obj?: IButton) {
        this.ripple = obj.ripple || "gray";
        this.label = obj.label;
        this.selected = obj.selected || false;
        this.togglable = obj.togglable;
        this.disabled = obj.disabled || false;
        this.color = obj.color;
        this.bgcolor = obj.bgcolor || "white";
        this.icon = obj.icon;
    }
}

@Component({
    moduleId: module.id,
    selector: "buttongroup-sample",
    styleUrls: ["../app.samples.css", "./sample.component.css"],
    templateUrl: "./sample.component.html"
})

export class ButtonGroupSampleComponent implements OnInit {
    private multi: boolean = true;
    private alignment = ButtonGroupAlignment.vertical;
    private alignOptions: Button[];
    private fontOptions: Button[];
    private cities: Button[];
    private borders: Button[];

    constructor() { }

    public ngOnInit(): void {

        this.alignOptions = [
            new Button({
                disabled: false,
                icon: "format_align_left",
                selected: false
            }),
            new Button({
                disabled: false,
                icon: "format_align_center",
                selected: true
            }),
            new Button({
                disabled: false,
                icon: "format_align_right",
                selected: false
            }),
            new Button({
                disabled: false,
                icon: "format_align_justify",
                selected: true
            })
        ];

        this.fontOptions = [
            new Button({
                disabled: false,
                icon: "format_bold",
                selected: false
            }),
            new Button({
                disabled: false,
                icon: "format_italic",
                selected: true,
                togglable: false
            }),
            new Button({
                disabled: false,
                icon: "format_underlined",
                selected: false
            })
        ];

        this.cities = [
            new Button({
                disabled: false,
                label: "Sofia",
                selected: false,
                togglable: false
            }),
            new Button({
                disabled: false,
                label: "London",
                selected: false
            }),
            new Button({
                disabled: false,
                label: "New York",
                selected: false
            }),
            new Button({
                disabled: true,
                label: "Tokyo",
                selected: false
            })
        ];

        this.borders = [
            new Button({
                disabled: false,
                icon: "border_top",
                selected: true
            }),
            new Button({
                disabled: false,
                icon: "border_right",
                selected: false
            }),
            new Button({
                disabled: false,
                icon: "border_bottom",
                selected: false
            }),
            new Button({
                disabled: false,
                icon: "border_left",
                selected: false
            })
        ];
    }
}
