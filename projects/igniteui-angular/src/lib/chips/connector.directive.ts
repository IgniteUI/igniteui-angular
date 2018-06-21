import { Directive, HostBinding } from '@angular/core';

@Directive({
    selector: 'igx-connector,[igxConnector]'
})
export class IgxConnectorDirective {
    @HostBinding('class.igx-input-group__bundle-suffix')
    public defaultClass = true;
}
