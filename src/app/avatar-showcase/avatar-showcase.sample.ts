import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxAvatarComponent } from 'igniteui-angular';
import { defineComponents, IgcAvatarComponent } from "igniteui-webcomponents";

defineComponents(IgcAvatarComponent);

@Component({
    selector: 'app-avatar-showcase-sample',
    styleUrls: ['avatar-showcase.sample.scss'],
    templateUrl: `avatar-showcase.sample.html`,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxAvatarComponent]
})
export class AvatarShowcaseSampleComponent {}
