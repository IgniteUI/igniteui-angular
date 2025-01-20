import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import { IGX_EXPANSION_PANEL_DIRECTIVES } from 'igniteui-angular';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';
import {
    defineComponents,
    IgcExpansionPanelComponent,
} from 'igniteui-webcomponents';

defineComponents(IgcExpansionPanelComponent);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'expansion-panel-sample',
    templateUrl: './expansion-panel-sample.html',
    styleUrls: ['expansion-panel-sample.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IGX_EXPANSION_PANEL_DIRECTIVES]
})
export class ExpansionPanelSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        iconPosition: {
            label: 'Indicator Position',
            control: {
                type: 'radio-inline',
                options: ['left', 'right'],
                defaultValue: 'left'
            }
        },
        open: {
            control: {
                type: 'boolean'
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
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

    private iconPositionMap = new Map<string, string>([
        ['left', 'start'],
        ['right', 'end']
    ]);

    protected get iconPositionWC() {
        const position = this.propertyChangeService.getProperty('iconPosition');
        return this.iconPositionMap.get(position);
    }
}
