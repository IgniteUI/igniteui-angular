import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    standalone: true,
    imports: [IgxButtonDirective, RouterLink]
})
export class AboutComponent {
}
