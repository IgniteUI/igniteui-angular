import { Directive, HostBinding } from "@angular/core";

@Directive({
    selector: "igx-suffix,[igxSuffix]"
})
export class IgxSuffixDirective {
    @HostBinding("class.igx-form-group__bundle-suffix")
    public defaultClass = true;
}
