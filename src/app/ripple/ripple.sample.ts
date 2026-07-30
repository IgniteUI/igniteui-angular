import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgxRippleDirective } from 'igniteui-angular';

@Component({
    selector: 'app-ripple-sample',
    styleUrls: ['ripple.sample.scss'],
    templateUrl: 'ripple.sample.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxRippleDirective]
})
export class RippleSampleComponent {}
