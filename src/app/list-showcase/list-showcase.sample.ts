import {Component, ViewEncapsulation} from '@angular/core';
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
import { defineComponents, IgcListComponent, IgcAvatarComponent, IgcListHeaderComponent, IgcListItemComponent } from 'igniteui-webcomponents';

defineComponents(IgcListComponent, IgcListHeaderComponent, IgcListItemComponent, IgcAvatarComponent);

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
