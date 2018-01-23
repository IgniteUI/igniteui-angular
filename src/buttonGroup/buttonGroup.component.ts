import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject, Input, NgModule, Output, QueryList, Renderer2, ViewChildren
} from "@angular/core";
import { IgxButton, IgxButtonModule } from "../button/button.directive";
import { IgxRippleModule } from "../directives/ripple.directive";
import { IgxIconModule } from "../icon/icon.component";

export enum ButtonGroupAlignment { horizontal, vertical }

// ====================== BUTTON GROUP ================================
// The `<igx-buttonGroup>` component is a  container for buttons
@Component({
    selector: "igx-buttongroup",
    styleUrls: ["./buttongroup.component.scss"],
    templateUrl: "buttongroup-content.component.html"
})

export class IgxButtonGroup implements AfterViewInit {
    @ViewChildren(IgxButton) public buttons: QueryList<IgxButtonGroup>;
    @Input() set itemContentCssClass(value: string) {
        this._itemContentCssClass = value || this._itemContentCssClass;
    }
    get itemContentCssClass(): string {
        return this._itemContentCssClass;
    }
    @Input() public multiSelection: boolean = false;
    @Input() public values: any;
    @Input() public disabled: boolean = false;

    public selectedIndexes: number[] = [];

    @Input() set alignment(value: ButtonGroupAlignment) {
        this._isVertical = value === ButtonGroupAlignment.vertical;
    }
    get alignment(): ButtonGroupAlignment {
        return this._isVertical ? ButtonGroupAlignment.vertical : ButtonGroupAlignment.horizontal;
    }

    @Output() public onSelect = new EventEmitter();
    @Output() public onUnselect = new EventEmitter();

    public get isVertical(): boolean {
        return this._isVertical;
    }
    private _isVertical: boolean;
    private _itemContentCssClass: string;

    constructor(private _el: ElementRef, private _renderer: Renderer2, cdr: ChangeDetectorRef) {
    }

    get selectedButtons(): IgxButtonGroup[] {
        return this.buttons.filter((b, i) => {
            return this.selectedIndexes.indexOf(i) !== -1;
        });

    }

    public selectButton(index: number) {
        if (this.buttons.toArray()[index]._el.nativeElement.getAttribute("data-togglable") === "false"
            || this.buttons.toArray()[index]._el.nativeElement.classList.contains("igx-button--disabled")) {
            return;
        }
        const buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.push(index);
        buttonElement.setAttribute("data-selected", true);
        this.onSelect.emit({ button: this.buttons.toArray()[index], index });
        this.values[index].selected = true;

        // deselect other buttons if multiSelection is not enabled
        if (!this.multiSelection && this.selectedIndexes.length > 0) {
            this.buttons.forEach((b, i) => {
                if (i !== index && this.selectedIndexes.indexOf(i) !== -1) {
                    this.deselectButton(i);
                }
            });
        }
    }

    public deselectButton(index: number) {
        if (this.buttons.toArray()[index]._el.nativeElement.getAttribute("data-togglable") === "false"
            || this.buttons.toArray()[index]._el.nativeElement.classList.contains("igx-button--disabled")) {
            return;
        }
        const buttonElement = this.buttons.toArray()[index]._el.nativeElement;
        this.selectedIndexes.splice(this.selectedIndexes.indexOf(index), 1);
        buttonElement.setAttribute("data-selected", false);
        this.onUnselect.emit({ button: this.buttons.toArray()[index], index });
        this.values[index].selected = false;
    }

    public ngAfterViewInit() {
        // initial selection
        setTimeout(() => {
            this.buttons.forEach((button, index) => {
                if (!button.disabled && button._el.nativeElement.getAttribute("data-selected") === "true") {
                    this.selectButton(index);
                }
            });
        }, 0);
    }

    public _clickHandler(event, i) {
        if (this.selectedIndexes.indexOf(i) !== -1) {
            this.deselectButton(i);
        } else {
            this.selectButton(i);
        }
    }
}

@NgModule({
    declarations: [IgxButtonGroup],
    exports: [IgxButtonGroup],
    imports: [IgxButtonModule, CommonModule, IgxRippleModule, IgxIconModule]
})

export class IgxButtonGroupModule {
}
