import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IGX_BUTTON_GROUP_DIRECTIVES } from 'igniteui-angular';

@Component({
    selector: 'app-button-group',
    imports: [
        IGX_BUTTON_GROUP_DIRECTIVES
    ],
    templateUrl: './button-group.component.html',
    styleUrl: './button-group.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonGroupComponent { }
