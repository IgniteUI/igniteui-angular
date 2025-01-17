import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import {
    IgxAvatarComponent,
    IgxIconComponent,
    IgSizeDirective,
} from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import {
    defineComponents,
    IgcAvatarComponent,
    IgcIconComponent,
    registerIconFromText,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

registerIconFromText(
    'mood',
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260Zm0 180q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>'
);
defineComponents(IgcAvatarComponent, IgcIconComponent);

@Component({
    selector: 'app-avatar-sample',
    styleUrls: ['avatar.sample.scss'],
    templateUrl: `avatar.sample.html`,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [
        CommonModule,
        IgxAvatarComponent,
        IgxIconComponent,
        IgSizeDirective,
    ],
})
export class AvatarSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'medium'
            }
        },
        shape: {
            control: {
                type: 'radio-inline',
                options: ['circle', 'rounded', 'square'],
                defaultValue: 'square'
            }
        },
        src: {
            label: 'The image source to use',
            control: {
                type: 'text',
                defaultValue:
                    'https://images.unsplash.com/photo-1514041790697-53f1f86214d2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=b7ac79503fbe78855a346c8d814f95ba&auto=format&fit=crop&w=1650&q=80'
            },
        },
        initials: {
            control: {
                type: 'text',
                defaultValue: 'DY'
            }
        }
    }

    public properties: Properties;

    constructor(
        private propertyChangeService: PropertyChangeService,
        private destroyRef: DestroyRef
    ) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const { unsubscribe } =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => unsubscribe);
    }
}
