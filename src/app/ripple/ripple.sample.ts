import { Component } from '@angular/core';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';

@Component({
    selector: 'app-ripple-sample',
    styleUrls: ['ripple.sample.css'],
    templateUrl: 'ripple.sample.html',
    standalone: true,
    imports: [IgxRippleDirective]
})
export class RippleSampleComponent {}
