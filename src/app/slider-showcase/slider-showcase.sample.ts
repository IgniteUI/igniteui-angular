import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { TicksOrientation, IgxSliderComponent, TickLabelsOrientation } from 'igniteui-angular';
import { defineComponents, IgcSliderComponent, IgcSliderLabelComponent } from 'igniteui-webcomponents';
import { PropertyPanelConfig } from '../properties-panel/properties-panel.component';
import { PropertyChangeService } from '../properties-panel/property-change.service';

defineComponents(IgcSliderComponent, IgcSliderLabelComponent);

@Component({
    selector: 'app-slider-showcase-sample',
    styleUrls: ['slider-showcase.sample.scss'],
    templateUrl: 'slider-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxSliderComponent]
})
export class SliderShowcaseSampleComponent implements OnInit {
    public panelConfig : PropertyPanelConfig = {
        value: {
            control: {
                type: 'number'
            }
        },
        minValue: {
            label: 'Min Value',
            control: {
                type: 'number'
            }
        },
        maxValue: {
            label: 'Max Value',
            control: {
                type: 'number'
            }
        },
        step: {
            control: {
                type: 'number'
            }
        },
        lowerBound: {
            label: 'Lower Bound',
            control: {
                type: 'number'
            }
        },
        upperBound: {
            label: 'Upper Bound',
            control: {
                type: 'number'
            }
        },
        primaryTicks: {
            label: 'Primary Ticks',
            control: {
                type: 'number'
            }
        },
        secondaryTicks: {
            label: 'Secondary Ticks',
            control: {
                type: 'number'
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
                type: 'boolean'
            }
        },
        primaryTickLabels: {
            label: 'Hide Primary Tick Labels',
            control: {
                type: 'boolean'
            }
        },
        secondaryTickLabels: {
            label: 'Hide Secondary Tick Labels',
            control: {
                type: 'boolean'
            }
        }
    }

    constructor(protected propertyChangeService: PropertyChangeService) {}

    public ngOnInit() {
        this.propertyChangeService.setPanelConfig(this.panelConfig);
    }

    private ticksOrientationMap = {
        start: TicksOrientation.Top,
        end: TicksOrientation.Bottom,
        mirror: TicksOrientation.Mirror
    };

    private tickLabelOrientationMap: { [key: string]: TickLabelsOrientation } = {
        '0': TickLabelsOrientation.Horizontal,
        '90': TickLabelsOrientation.TopToBottom,
        '-90': TickLabelsOrientation.BottomToTop,
    };

    protected get angularTickLabelOrientation(): TickLabelsOrientation {
        const orientation = this.propertyChangeService.getProperty('tickLabelOrientation');
        return this.tickLabelOrientationMap[orientation] ?? TickLabelsOrientation.Horizontal;
    }

    protected get wcTickLabelOrientation(): number {
        return this.propertyChangeService.getProperty('tickLabelOrientation');
    }

    protected get value(): number {
        return this.propertyChangeService.getProperty('value') || 0;
    }

    protected get disabled(): boolean {
        return !!this.propertyChangeService.getProperty('disabled');
    }

    protected get minValue(): number {
        return this.propertyChangeService.getProperty('minValue') || 0;
    }

    protected get maxValue(): number {
        return this.propertyChangeService.getProperty('maxValue') || 100;
    }

    protected get step(): number {
        return this.propertyChangeService.getProperty('step') || 1;
    }

    protected get lowerBound(): number {
        return this.propertyChangeService.getProperty('lowerBound') || 0;
    }

    protected get upperBound(): number {
        return this.propertyChangeService.getProperty('upperBound') || 100;
    }

    protected get primaryTicks(): number {
        return this.propertyChangeService.getProperty('primaryTicks') || 0;
    }

    protected get secondaryTicks(): number {
        return this.propertyChangeService.getProperty('secondaryTicks') || 0;
    }

    protected get ticksOrientationAngular(): TicksOrientation {
        const orientation = this.propertyChangeService.getProperty('ticksOrientation');
        return this.ticksOrientationMap[orientation] || TicksOrientation.Bottom;
    }

    protected get ticksOrientationWC(): string {
        return this.propertyChangeService.getProperty('ticksOrientation');
    }

    protected get primaryTickLabels(): boolean {
        return !!this.propertyChangeService.getProperty('primaryTickLabels');
    }

    protected get secondaryTickLabels(): boolean {
        return !!this.propertyChangeService.getProperty('secondaryTickLabels');
    }
}
