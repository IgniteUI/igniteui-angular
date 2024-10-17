import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IgxAvatarComponent } from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import { defineComponents, IgcAvatarComponent } from "igniteui-webcomponents";
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../properties-panel/property-change.service';

defineComponents(IgcAvatarComponent);

@Component({
    selector: 'app-avatar-showcase-sample',
    styleUrls: ['avatar-showcase.sample.scss'],
    templateUrl: `avatar-showcase.sample.html`,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [CommonModule, IgxAvatarComponent]
})

export class AvatarShowcaseSampleComponent implements OnInit {
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
                defaultValue: 'https://images.unsplash.com/photo-1514041790697-53f1f86214d2?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=b7ac79503fbe78855a346c8d814f95ba&auto=format&fit=crop&w=1650&q=80'
            }
        },
        initials: {
            control: {
                type: 'text',
                defaultValue: 'RK'
            }
        }
    }

    constructor(protected propertyChangeService: PropertyChangeService) {}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    protected get src() {
        return this.propertyChangeService.getProperty('src');
    }

    protected get shape() {
        return this.propertyChangeService.getProperty('shape');
    }

    protected get initials() {
        return this.propertyChangeService.getProperty('initials');
    }

    protected get size() {
        return this.propertyChangeService.getProperty('size');
    }
}
