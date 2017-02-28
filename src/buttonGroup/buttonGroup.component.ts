import { Component, ChangeDetectorRef, Directive, Input, Output, NgModule, EventEmitter, ElementRef, QueryList, ViewChildren, Inject, forwardRef, AfterViewInit, Renderer } from '@angular/core';
import { CommonModule } from "@angular/common";
import { IgxRippleModule } from "../../src/directives/ripple.directive";
import { IgxButtonModule, IgxButton } from "../button/button.directive";

export enum ButtonGroupAlignment { horizontal, vertical };

// ====================== BUTTON GROUP ================================
// The `<igx-buttonGroup>` component is a  container for buttons
@Component({
    selector: 'igx-buttongroup',
    moduleId: module.id, // commonJS standard
    templateUrl: 'buttongroup-content.component.html'
})

export class IgxButtonGroup implements AfterViewInit {
    @ViewChildren(IgxButton) buttons: QueryList<IgxButtonGroup>;
    @Input() multiSelection: boolean = false;
    @Input() values: any;
    @Input() set disabled(val: Boolean) {
        this._isDisabled = val;
    }
    get disabled(): Boolean {
        return this._isDisabled;
    }

    @Input() set alignment(value: ButtonGroupAlignment) {
        this._isVertical = value == ButtonGroupAlignment.vertical;
    }

    get alignment(): ButtonGroupAlignment {
        return this._isVertical ? ButtonGroupAlignment.vertical : ButtonGroupAlignment.horizontal;
    }
    private _cssClass: string = 'igx-button-group';
    private _isVertical: Boolean;
    private _isDisabled: Boolean;

    public selectedIndexes: Array<number> = [];

    @Output() onSelect = new EventEmitter();
    @Output() onUnselect = new EventEmitter();

    constructor(private _el: ElementRef, private _renderer: Renderer, cdr: ChangeDetectorRef) {
    }

    _clickHandler(event, i) {
        if (this.selectedIndexes.indexOf(i) != -1) {
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
        this.onSelect.emit({ button: this.buttons.toArray()[index], index: index });

        // deselect other buttons if multiSelection is not enabled
        if (!this.multiSelection && this.selectedIndexes.length > 0) {
            this.buttons.forEach((b, i) => {
                if (i != index && this.selectedIndexes.indexOf(i) != -1) {
                    this.deselectButton(i);
                }
            })
        }
    }

    deselectButton(index: number) {
        var buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
        buttonElement.setAttribute("data-selected", false);
        this.onUnselect.emit({ button: this.buttons.toArray()[index], index: index });
    }

    ngAfterViewInit() {
        // initial selection
        let self = this;
        setTimeout(function () {
            self.buttons.forEach((button, index) => {
                if (!button.disabled && button._el.nativeElement.getAttribute("data-selected") === 'true') {
                    self.selectButton(index);
                }
            });
        }, 0);
    }
}

@NgModule({
    declarations: [IgxButtonGroup, IgxButtonGroup],
    imports: [IgxButtonModule, CommonModule, IgxRippleModule],
    exports: [IgxButtonGroup]
})

export class IgxButtonGroupModule {
}