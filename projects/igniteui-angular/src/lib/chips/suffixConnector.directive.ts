import { Directive, HostBinding } from '@angular/core';

@Directive({
    selector: 'igx-suffix-connector,[igxSuffixConnector]'
})
export class IgxSuffixConnectorDirective {
    @HostBinding('class.igx-input-group__bundle-suffix')
    public defaultClass = true;
}
