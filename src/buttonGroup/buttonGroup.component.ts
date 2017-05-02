import { Component, ChangeDetectorRef, Input, Output, NgModule, EventEmitter, ElementRef, QueryList, ViewChildren, Inject, forwardRef, AfterViewInit, Renderer2 } from '@angular/core';
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
    @Input() set itemContentCssClass(value: string){
        this._itemContentCssClass = value || this._itemContentCssClass;
    }
    get itemContentCssClass(): string {
        return this._itemContentCssClass;
    }
    @Input() multiSelection: boolean = false;
    @Input() values: any;
    @Input() disabled: boolean = false;
    @Input() set alignment(value: ButtonGroupAlignment) {
        this._isVertical = value == ButtonGroupAlignment.vertical;
    }
    get alignment(): ButtonGroupAlignment {
        return this._isVertical ? ButtonGroupAlignment.vertical : ButtonGroupAlignment.horizontal;
    }

    private _isVertical: Boolean;
    private _itemContentCssClass: string;
    public selectedIndexes: Array<number> = [];

    @Output() onSelect = new EventEmitter();
    @Output() onUnselect = new EventEmitter();

    constructor(private _el: ElementRef, private _renderer: Renderer2, cdr: ChangeDetectorRef) {
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
        if(this.buttons.toArray()[index]._el.nativeElement.getAttribute("data-togglable") === 'false'
        || this.buttons.toArray()[index]._el.nativeElement.classList.contains("igx-button--disabled")) {
            return;
        }
        var buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.push(index);
        buttonElement.setAttribute("data-selected", true);
        this.onSelect.emit({ button: this.buttons.toArray()[index], index: index });
        this.values[index].selected = true;

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
        if(this.buttons.toArray()[index]._el.nativeElement.getAttribute("data-togglable") === 'false'
        || this.buttons.toArray()[index]._el.nativeElement.classList.contains("igx-button--disabled")) {
            return;
        }
        var buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
        buttonElement.setAttribute("data-selected", false);
        this.onUnselect.emit({ button: this.buttons.toArray()[index], index: index });
        this.values[index].selected = false;
    }

    ngAfterViewInit() {
        // initial selection
        setTimeout(() => {
            this.buttons.forEach((button, index) => {
                if (!button.disabled && button._el.nativeElement.getAttribute("data-selected") === 'true') {
                    this.selectButton(index);
                }
            });
        }, 0)
    }
}

@NgModule({
    declarations: [IgxButtonGroup, IgxButtonGroup],
    imports: [IgxButtonModule, CommonModule, IgxRippleModule],
    exports: [IgxButtonGroup]
})

export class IgxButtonGroupModule {
}
