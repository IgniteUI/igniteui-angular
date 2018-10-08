import { Directive, HostBinding } from '@angular/core';

@Directive({
    selector: 'igx-remove-button,[igxRemoveButton]'
})
export class IgxRemoveButtonDirective {
    @HostBinding('class.igx-chip-remove_button')
    public defaultClass = true;
}
