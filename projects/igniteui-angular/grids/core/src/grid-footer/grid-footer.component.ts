import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'igx-grid-footer',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true
})
export class IgxGridFooterComponent {
}
