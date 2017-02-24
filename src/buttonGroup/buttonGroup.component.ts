import { Component, Directive, Input, NgModule, ElementRef, QueryList, ViewChildren, Inject, forwardRef, AfterViewInit, Renderer } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IgxRippleModule } from "../../src/directives/ripple.directive";
import { IgxButtonModule, IgxButton } from "../button/button.directive";

export enum ButtonGroupAlignment { horizontal, vertical };

// ====================== BUTTON GROUP ================================
// The `<igx-buttonGroup>` component is a  container for buttons
@Component({
    selector: 'igx-buttongroup',
    moduleId: module.id, // commonJS standard
    templateUrl: 'buttongroup-content.component.html',
    styleUrls: ['buttongroup.component.css'],
    host: {
        'role': "group",
        '[class.igx-button-group-vertical]': '_isVertical'
    },
})

export class IgxButtonGroup implements AfterViewInit {
    @ViewChildren(IgxButton) buttons: QueryList<IgxButtonGroup>;
    @Input() multiSelection: boolean = false;
    @Input() disabled: boolean = false;
    @Input() values: any;
      
    @Input() set alignment (value: ButtonGroupAlignment) {
        this._isVertical = value == ButtonGroupAlignment.vertical;
    }

    // get alignment(): ButtonGroupAlignment {
    //     return this.alignment;
    // }

    private _innerStyle: string = "igx-button-group";
    private _isVertical:Boolean;
    
    public selectedIndexes: Array<number> = [];

    constructor(private _el: ElementRef, private _renderer: Renderer) {
    }

    _clickHandler(event, i) {
         if(this.selectedIndexes.indexOf(i) != -1) {
            this.deselectButton(i);
        } else {
            this.selectButton(i);
        }
    }

    get selectedButtons(): Array<IgxButtonGroup> {
        return this.buttons.filter((b, i) => {
            return this.selectedIndexes.indexOf(i) != -1;
        })

    } 

    selectButton(index: number) {
        var buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.push(index);
        buttonElement.setAttribute("data-selected", true);
        
        if(!this.multiSelection && this.selectedIndexes.length > 0) {
            this.buttons.forEach((b, i) => {
                if(i != index && this.selectedIndexes.indexOf(i) != -1) {
                    this.deselectButton(i);
                }
            })
        }
    }

    deselectButton(index: number) {
         var buttonElement = this.buttons.toArray()[index]._el.nativeElement;
         this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
         buttonElement.setAttribute("data-selected", false);
    }
    
    ngAfterViewInit() {
        // initial selection
        this.buttons.forEach((button, index) => {
            if(!button.disabled && button._el.nativeElement.getAttribute("data-selected") === 'true') {
                this.selectButton(index);
            }
        });
    }
}

@NgModule({
    declarations: [IgxButtonGroup, IgxButtonGroup],
    imports: [IgxButtonModule, CommonModule, IgxRippleModule],
    exports: [IgxButtonGroup]
})

export class IgxButtonGroupModule {
}