import { Directive, ElementRef, Input, NgModule } from "@angular/core";

@Directive({
    exportAs: "igxTextSelection",
    selector: "[igxTextSelection]"
})
export class IgxTextSelectionDirective {

    private selectionState = true;

    @Input("igxTextSelection")
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
    declarations: [IgxTextSelectionDirective],
    exports: [IgxTextSelectionDirective]
})
export class IgxTextSelectionModule { }
