import { Directive, HostBinding, Input, NgModule } from "@angular/core";

@Directive({
    selector: "[igxLayout]"
})
export class IgxLayoutDirective {
    @Input("igxLayoutDir") public dir: string = "row";
    @Input("igxLayoutReverse") public reverse: boolean = false;
    @Input("igxLayoutWrap") public wrap: string = "nowrap";
    @Input("igxLayoutJustify") public justify: string = "flex-start";
    @Input("igxLayoutItemAlign") public itemAlign: string = "flex-start";

    @HostBinding("style.display") public display = "flex";
    @HostBinding("style.flex-wrap") get flexwrap() { return this.wrap; }
    @HostBinding("style.justify-content") get justifycontent() { return this.justify; }
    @HostBinding("style.align-items") get align() { return this.itemAlign; }

    @HostBinding("style.flex-direction")
    get direction() {
        if (this.reverse) {
            return (this.dir === "row") ? "row-reverse" : "column-reverse";
        }
        return (this.dir === "row") ? "row" : "column";
    }
}

@Directive({
    selector: "[igxFlex]"
})
export class IgxFlexDirective {
    @Input("igxFlexGrow") public grow: number = 1;
    @Input("igxFlexShrink") public shrink: number = 1;
    @Input("igxFlex") public flex: string = "";
    @Input("igxFlexOrder") public order: number = 0;

    @HostBinding("style.flex")
    get style() {
        if (this.flex) {
            return `${this.flex}`;
        }
        return `${this.grow} ${this.shrink} auto`;
    }

    @HostBinding("style.order")
    get itemorder() {
        return this.order || 0;
    }
}

@NgModule({
    declarations: [IgxLayoutDirective, IgxFlexDirective],
    exports: [IgxFlexDirective, IgxLayoutDirective]
})
export class IgxLayout { }
