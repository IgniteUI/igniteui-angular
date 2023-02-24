import { Component } from '@angular/core';
import { IgxDragDirective } from '../../../projects/igniteui-angular/src/lib/directives/drag-drop/drag-drop.directive';
import { IgxAvatarComponent } from '../../../projects/igniteui-angular/src/lib/avatar/avatar.component';

@Component({
    selector: 'app-avatar-sample',
    styleUrls: ['avatar.sample.css'],
    templateUrl: `avatar.sample.html`,
    standalone: true,
    imports: [IgxAvatarComponent, IgxDragDirective]
})
export class AvatarSampleComponent {
}
