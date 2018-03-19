import { Directive, HostBinding } from "@angular/core";

@Directive({
    selector: "igx-prefix,[igxPrefix]"
})
export class IgxPrefixDirective {
    @HostBinding("class.igx-form-group__bundle-prefix")
    public defaultClass = true;
}
