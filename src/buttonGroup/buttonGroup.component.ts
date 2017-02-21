import { Component, Directive, Input, NgModule, ElementRef, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IgxRippleModule } from "../../src/directives/ripple.directive";
import { IgxButtonModule, IgxButton } from "../button/button.directive";

// ====================== BUTTON GROUP ================================
// The `<igx-buttonGroup>` component is a  container for buttons
@Component({
    selector: 'igx-buttongroup',
    moduleId: module.id, // commonJS standard
    templateUrl: 'buttongroup-content.component.html',
    host: {
        'role': "group",
        '(click)': "selectButton($event)"
    },
})

export class IgxButtonGroup implements AfterViewInit {
    private _innerStyle: string = "igx-buttonGroup";
    @ViewChildren(IgxButton) buttonCollection: QueryList<IgxButton>;
    @Input() multiSelection: boolean = false;
    @Input() disabled: boolean = false;
    @Input() public values: any;
    
    // public selectedButtons: Array<IgxButton> = [];

    constructor(private element: ElementRef) {
        // this.selectedButtons = [];
    }

    selectButton(event) {
        // debugger;
        // this.selectedButtons.push(button);
        // alert("hey");
        console.log(event.target);
    }

    // public _clickHandler(args, owner) {
    //     if(!!args.target.attributes["igxButton"]) {
    //         debugger;
    //         this.selectButton(<IgxButton>args.target);
    //     }
    // }
    
    ngAfterViewInit() {
        // debugger;
    }
}

@NgModule({
    declarations: [IgxButtonGroup],
    imports: [IgxButtonModule, CommonModule, IgxRippleModule],
    exports: [IgxButtonGroup]
})

export class IgxButtonGroupModule {
}