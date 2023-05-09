import { Component } from '@angular/core';
import { IgxAvatarComponent, IgxDragDirective } from 'igniteui-angular';

@Component({
    selector: 'app-avatar-sample',
    styleUrls: ['avatar.sample.scss'],
    templateUrl: `avatar.sample.html`,
    standalone: true,
    imports: [IgxAvatarComponent, IgxDragDirective]
})
export class AvatarSampleComponent {
}
