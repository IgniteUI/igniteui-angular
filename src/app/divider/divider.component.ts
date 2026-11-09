import { IgxDividerComponent } from 'igniteui-angular';
import { Component, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import {
    PropertyPanelConfig,
    PropertyChangeService,
    Properties,
} from '../properties-panel/property-change.service';

@Component({
    selector: 'app-divider',
    imports: [
        IgxDividerComponent,
    ],
    templateUrl: './divider.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./divider.component.scss']
})
export class DividerComponent {
    private propertyChangeService = inject(PropertyChangeService);
    private destroyRef = inject(DestroyRef);

    public panelConfig: PropertyPanelConfig = {
        type: {
            control: {
                type: 'button-group',
                options: ['solid', 'dashed'],
                defaultValue: 'solid'
            }
        },
        vertical: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        middle: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        inset: {
            label: 'Inset',
            control: {
                type: 'text',
                defaultValue: '0px'
            }
        }
    };

    public properties: Properties = Object.fromEntries(
        Object.keys(this.panelConfig).map((key) => {
            const control = this.panelConfig[key]?.control;
            return [key, control?.defaultValue];
        })
    ) as Properties;

    constructor() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const propertyChange =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                }
            );

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }
}
