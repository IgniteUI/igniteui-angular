import { Directive, ElementRef, Input, NgModule } from "@angular/core";

@Directive({
    exportAs: "igxSelection",
    selector: "[igxAutoSelect]"
})
export class IgxAutoSelectDirective {

    private selectionState = true;

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
        if (this.selected && this.nativeElement.value.length) {
            requestAnimationFrame(() => this.nativeElement.setSelectionRange(0, this.nativeElement.value.length));
        }
    }
}

@NgModule({
    declarations: [IgxAutoSelectDirective],
    exports: [IgxAutoSelectDirective]
})
export class IgxAutoSelectModule { }
