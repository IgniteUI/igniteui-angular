import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import {
    TicksOrientation,
    IgxSliderComponent,
    TickLabelsOrientation,
} from 'igniteui-angular';
import {
    defineComponents,
    IgcSliderComponent,
    IgcSliderLabelComponent,
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';

defineComponents(IgcSliderComponent, IgcSliderLabelComponent);

@Component({
    selector: 'app-slider-showcase-sample',
    styleUrls: ['slider-showcase.sample.scss'],
    templateUrl: 'slider-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxSliderComponent]
})
export class SliderShowcaseSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        value: {
            control: {
                type: 'number',
                defaultValue: 0
            }
        },
        minValue: {
            label: 'Min Value',
            control: {
                type: 'number',
                defaultValue: 0
            }
        },
        maxValue: {
            label: 'Max Value',
            control: {
                type: 'number',
                defaultValue: 100
            }
        },
        step: {
            control: {
                type: 'number',
                defaultValue: 1
            }
        },
        lowerBound: {
            label: 'Lower Bound',
            control: {
                type: 'number',
                defaultValue: 0
            }
        },
        upperBound: {
            label: 'Upper Bound',
            control: {
                type: 'number',
                defaultValue: 100
            }
        },
        primaryTicks: {
            label: 'Primary Ticks',
            control: {
                type: 'number',
                defaultValue: 0
            }
        },
        secondaryTicks: {
            label: 'Secondary Ticks',
            control: {
                type: 'number',
                defaultValue: 0
            }
        },
        ticksOrientation: {
            label: 'Ticks Orientation',
            control: {
                type: 'button-group',
                options: ['mirror', 'start', 'end'],
                defaultValue: 'end'
            }
        },
        tickLabelOrientation: {
            label: 'Tick Label Orientation',
            control: {
                type: 'button-group',
                options: ['0', '90', '-90'],
                labels: ['horizontal', 'top to bottom', 'bottom to top'],
                defaultValue: '0'
            }
        },
        disabled: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        primaryTickLabels: {
            label: 'Hide Primary Tick Labels',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        secondaryTickLabels: {
            label: 'Hide Secondary Tick Labels',
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

    private ticksOrientationMap = new Map<string, TicksOrientation>(
        Object.entries({
            start: TicksOrientation.Top,
            end: TicksOrientation.Bottom,
            mirror: TicksOrientation.Mirror
        })
    );

    private tickLabelOrientationMap = new Map<string, TickLabelsOrientation>(
        Object.entries({
            '0': TickLabelsOrientation.Horizontal,
            '90': TickLabelsOrientation.TopToBottom,
            '-90': TickLabelsOrientation.BottomToTop
        })
    );

    protected get angularTickLabelOrientation(): TickLabelsOrientation {
        const orientation = this.propertyChangeService.getProperty(
            'tickLabelOrientation'
        );
        return (
            this.tickLabelOrientationMap.get(orientation) ??
            TickLabelsOrientation.Horizontal
        );
    }

    protected get ticksOrientationAngular(): TicksOrientation {
        const orientation =
            this.propertyChangeService.getProperty('ticksOrientation');
        return (
            this.ticksOrientationMap.get(orientation) || TicksOrientation.Bottom
        );
    }
}
