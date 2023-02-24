import { Component } from '@angular/core';
import { IgxBadgeComponent } from '../../../projects/igniteui-angular/src/lib/badge/badge.component';
import { IgxAvatarComponent } from '../../../projects/igniteui-angular/src/lib/avatar/avatar.component';

@Component({
    selector: 'app-badge-sample',
    styleUrls: ['badge.sample.css'],
    templateUrl: 'badge.sample.html',
    standalone: true,
    imports: [IgxAvatarComponent, IgxBadgeComponent]
})
export class BadgeSampleComponent {}
