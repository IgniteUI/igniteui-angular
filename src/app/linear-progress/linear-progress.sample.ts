import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxLinearProgressBarComponent, IgxTextAlign } from 'igniteui-angular';
import { IgcLinearProgressComponent, defineComponents } from 'igniteui-webcomponents';
import { Properties, PropertyChangeService, PropertyPanelConfig } from '../properties-panel/property-change.service';

defineComponents(IgcLinearProgressComponent);

@Component({
    selector: 'app-linear-progress-sample',
    styleUrls: ['linear-progress.sample.scss'],
    templateUrl: 'linear-progress.sample.html',
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IgxLinearProgressBarComponent]
})

export class LinearProgressSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        striped: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        indeterminate: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideLabel: {
            label: 'Hide Label',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        labelAlign: {
            label: 'Align Label',
            control: {
                type: 'select',
                options: ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'],
                defaultValue: 'top-start'
            }
        },
        value: {
            control: {
                type: 'number',
                defaultValue: 66
            }
        },
        animationDuration: {
            label: 'Animation Duration',
            control: {
                type: 'number',
                defaultValue: 300
            }
        },
        variant: {
            control: {
                type: 'select',
                options: ['primary', 'info', 'success', 'warning', 'danger'],
                defaultValue: 'primary'
            }
        }
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    protected get variantAngular() {
        const variantValue = this.propertyChangeService.getProperty('variant');

        switch (variantValue) {
            case 'primary':
                return 'default';
            case 'danger':
                return 'error';
            default:
                return variantValue;
        }
    }

    protected getTextAlignmentConfig(labelAlign: string): { textTop: boolean; textAlign: IgxTextAlign } {
        const alignMap: { [key: string]: { textTop: boolean; textAlign: IgxTextAlign } } = {
          'top-start': { textTop: true, textAlign: IgxTextAlign.START },
          'top': { textTop: true, textAlign: IgxTextAlign.CENTER },
          'top-end': { textTop: true, textAlign: IgxTextAlign.END },
          'bottom-start': { textTop: false, textAlign: IgxTextAlign.START },
          'bottom': { textTop: false, textAlign: IgxTextAlign.CENTER },
          'bottom-end': { textTop: false, textAlign: IgxTextAlign.END },
        };

        return alignMap[labelAlign] || { textTop: true, textAlign: IgxTextAlign.START };
      }
}
