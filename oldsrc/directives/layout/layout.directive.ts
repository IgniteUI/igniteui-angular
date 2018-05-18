import { Directive, HostBinding, Input, NgModule } from "@angular/core";

@Directive({
    selector: "[igxLayout]"
})
export class IgxLayoutDirective {
    @Input("igxLayoutDir") public dir = "row";
    @Input("igxLayoutReverse") public reverse = false;
    @Input("igxLayoutWrap") public wrap = "nowrap";
    @Input("igxLayoutJustify") public justify = "flex-start";
    @Input("igxLayoutItemAlign") public itemAlign = "stretch";

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
    @Input("igxFlexGrow") public grow = 1;
    @Input("igxFlexShrink") public shrink = 1;
    @Input("igxFlex") public flex = "";
    @Input("igxFlexOrder") public order = 0;
    @Input("igxFlexBasis") public basis = "auto";

    @HostBinding("style.flex")
    get style() {
        if (this.flex) {
            return `${this.flex}`;
        }
        return `${this.grow} ${this.shrink} ${this.basis}`;
    }

    @HostBinding("style.order")
    get itemorder() {
        return this.order || 0;
    }
}

@NgModule({
    declarations: [IgxFlexDirective, IgxLayoutDirective],
    exports: [IgxFlexDirective, IgxLayoutDirective]
})
export class IgxLayoutModule { }
