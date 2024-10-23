import {Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation} from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IGX_INPUT_GROUP_DIRECTIVES,
    IGX_LIST_DIRECTIVES,
    IgxAvatarComponent,
    IgxBadgeComponent,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxCardComponent,
    IgxCheckboxComponent,
    IgxDialogComponent,
    IgxFilterDirective,
    IgxFilterPipe,
    IgxIconComponent,
    IgxRippleDirective,
    IgxSwitchComponent
} from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { defineComponents, IgcListComponent, IgcAvatarComponent, IgcListHeaderComponent, IgcListItemComponent, IgcIconComponent, registerIconFromText } from 'igniteui-webcomponents';

defineComponents(IgcListComponent, IgcListHeaderComponent, IgcListItemComponent, IgcAvatarComponent, IgcIconComponent);

const more_horiz = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>'
registerIconFromText('more_horiz', more_horiz)

interface Employee {
    imageURL: string;
    name: string;
    position: string;
    description: string;
}

@Component({
    selector: 'app-list-showcase-sample',
    styleUrls: ['list-showcase.sample.scss'],
    templateUrl: 'list-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgFor,
        FormsModule,
        IgxButtonGroupComponent,
        IgxBadgeComponent,
        IgxCardComponent,
        IgxRippleDirective,
        IgxIconComponent,
        IgxCheckboxComponent,
        IgxAvatarComponent,
        IgxSwitchComponent,
        IgxFilterDirective,
        IgxButtonDirective,
        IgxDialogComponent,
        IgxFilterPipe,
        SizeSelectorComponent,
        IGX_LIST_DIRECTIVES,
        IGX_INPUT_GROUP_DIRECTIVES
    ]
})
export class ListShowcaseSampleComponent {
    public employeeItems: Employee[] = [{
        imageURL: 'assets/images/avatar/18.jpg',
        name: 'Marin Popov',
        position: 'Web designer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?'
    }, {
        imageURL: 'assets/images/avatar/2.jpg',
        name: 'Simeon Simeonov',
        position: 'Front-end Developer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?'
    }, {
        imageURL: 'assets/images/avatar/7.jpg',
        name: 'Stefan ivanov',
        position: 'UX Architect',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel?, consectetur adipisicing elit. Aperiam, vel?'
    }, {
        imageURL: 'assets/images/avatar/6.jpg',
        name: 'Svilen Dimchevski',
        position: 'Graphic designer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam, vel, consectetur adipisicing elit. Aperiam, vel??'
    }];
}
