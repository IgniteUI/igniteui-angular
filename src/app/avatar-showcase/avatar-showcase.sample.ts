import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { IgxAvatarComponent } from 'igniteui-angular';
import { CommonModule } from '@angular/common';
import { defineComponents, IgcAvatarComponent } from "igniteui-webcomponents";
import { PropertyPanelConfig, PropertiesPanelComponent } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../property-change.service';

defineComponents(IgcAvatarComponent);

@Component({
    selector: 'app-avatar-showcase-sample',
    styleUrls: ['avatar-showcase.sample.scss'],
    templateUrl: `avatar-showcase.sample.html`,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [CommonModule, IgxAvatarComponent, PropertiesPanelComponent]
})

export class AvatarShowcaseSampleComponent implements OnInit, OnDestroy {
    constructor(protected propertyChangeService: PropertyChangeService) { }

    public ngOnInit(): void {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    public ngOnDestroy(): void {
        this.propertyChangeService.clearPanelConfig();
    }

    public get src(): string {
        return this.propertyChangeService.getProperty('src');
    }

    public get shape(): string {
        return this.propertyChangeService.getProperty('shape');
    }

    public get initials(): string {
        return this.propertyChangeService.getProperty('initials');
    }

    public get size(): string {
        return this.propertyChangeService.getProperty('size');
    }

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
                defaultValue: 'circle'
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
                type: 'text'
            }
        }
    }
}
