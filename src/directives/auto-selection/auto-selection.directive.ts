import { Directive, ElementRef, Input, NgModule } from "@angular/core";

@Directive({
    exportAs: "igxSelection",
    selector: "[igxAutoSelect]"
})
export class IgxAutoSelectDirective {

    private selectionState = true;

    @Input()
    public selectionDirection: SelectionDirectionEnum = SelectionDirectionEnum.backward;

    @Input("igxAutoSelect")
    get selected(): boolean {
        return this.selectionState;
    }

    set selected(val: boolean) {
        this.selectionState = val;
        this.trigger();
    }

    get nativeElement() {
        return this.element.nativeElement;
    }

    constructor(private element: ElementRef) { }

    trigger() {
        if (this.selected) {
            if (this.selectionDirection === SelectionDirectionEnum.backward) {
                this.selection(0,
                    1, "backward");
            } else {
                this.selection(this.nativeElement.value.length,
                    0,
                    SelectionDirectionEnum.forward);
            }
        }
    }

    selection(selecitonStart, selectionEnd, selectionDirection) {
        requestAnimationFrame(() => this.nativeElement.setSelectionRange(selecitonStart, selectionEnd, selectionDirection));
    }
}

export enum SelectionDirectionEnum {
    backward = "backward",
    forward = "forward"
}

@NgModule({
    declarations: [IgxAutoSelectDirective],
    exports: [IgxAutoSelectDirective]
})
export class IgxAutoSelectModule { }
