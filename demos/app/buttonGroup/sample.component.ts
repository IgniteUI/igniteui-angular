import { Component, OnInit } from "@angular/core";
import { IgxButtonGroupModule, ButtonGroupAlignment } from "../../../src/buttonGroup/buttonGroup.component";
import { IgxDirectivesModule } from "../../../src/modules";
import { IgxButton } from "../../../src/button/button.directive";

interface IButton {
    type?: string,
    ripple?: string,
    label?: string,
    selected?: boolean,
    color?: string,
    bgcolor?: string,
    icon?: string
}

class Button {
    private type: string;
    private ripple: string;
    private label: string;
    private selected: boolean;
    private color: string;
    private bgcolor: string;
    private icon: string;

    constructor(obj?: IButton) {
        this.type = obj.type || 'raised';
        this.ripple = obj.ripple || 'orange';
        this.label = obj.label || 'Button label';
        this.selected = obj.selected || false;
        this.color = obj.color || '#484848';
        this.bgcolor = obj.bgcolor || 'white';
        this.icon = obj.icon || 'home';
    }
}

@Component({
    selector: "buttongroup-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html'
})

export class ButtonGroupSampleComponent implements OnInit  {
    private multi:boolean = true;
    private alignment = ButtonGroupAlignment.vertical;

    constructor() {}
    private buttons: Array<Button>;
    
    public ngOnInit(): void {

        this.buttons = [
            new Button({
                type: 'raised',
                label: 'Euro',
                selected: true,
            //    icon: 'mdi-currency-eur'
            }),
            new Button({
                type: 'raised',
                label: 'British Pound',
                selected: true,
             //   icon: 'mdi-currency-gbp'
            }),
            new Button({
                type: 'raised',
                label: 'US Dollar',
                selected: false,
            })
        ]
    }
}
