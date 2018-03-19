import { Directive, HostBinding } from "@angular/core";

@Directive({
    selector: "[igxLabel]"
})
export class IgxLabelDirective {
    @HostBinding("class.igx-form-group__label")
    public defaultClass = true;
}
