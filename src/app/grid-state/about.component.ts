import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IgxButtonDirective } from 'igniteui-angular';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    imports: [IgxButtonDirective, RouterLink]
})
export class AboutComponent {
}
