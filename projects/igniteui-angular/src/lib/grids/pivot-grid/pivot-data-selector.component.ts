import { Component, HostBinding } from '@angular/core';

@Component({
    selector: 'igx-pivot-data-selector',
    templateUrl: './pivot-data-selector.component.html'
})

export class IgxPivotDataSelectorComponent {
    @HostBinding('class.igx-pivot-data-selector')
    public cssClass = 'igx-pivot-data-selector';
}
