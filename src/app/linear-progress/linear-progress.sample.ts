import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef } from '@angular/core';
import { IgxLinearProgressBarComponent, IgxTextAlign } from 'igniteui-angular';
import {
    IgcLinearProgressComponent,
    defineComponents
} from 'igniteui-webcomponents';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig
} from '../properties-panel/property-change.service';

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
        hasAnimation: {
            label: 'Enable none indeterminate animation (Angular)',
            control: {
                type: 'boolean',
                defaultValue: true
            }
        },
        indeterminate: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        animationDuration: {
            label: 'Animation Duration in (ms)',
            control: {
                type: 'number',
                defaultValue: 500
            }
        },
        max: {
            control: {
                type: 'number',
                defaultValue: 100
            }
        },
        value: {
            control: {
                type: 'number',
                defaultValue: 50
            }
        },
        text: {
            control: {
                type: 'text',
                defaultValue: null
            }
        },
        labelAlign: {
            label: 'Align Label',
            control: {
                type: 'select',
                options: [
                    'top-start',
                    'top',
                    'top-end',
                    'bottom-start',
                    'bottom',
                    'bottom-end'
                ],
                defaultValue: 'top-start'
            }
        },
        hideLabel: {
            label: 'Hide Label',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        striped: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        variant: {
            control: {
                type: 'select',
                options: [
                    'primary',
                    'info',
                    'success',
                    'warning',
                    'danger'
                ],
                defaultValue: 'primary'
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

    protected getTextAlignmentConfig(labelAlign: string): {
        textTop: boolean;
        textAlign: IgxTextAlign;
    } {
        const top = { textTop: true };
        const bottom = { textTop: false };

        const start = { textAlign: IgxTextAlign.START };
        const center = { textAlign: IgxTextAlign.CENTER };
        const end = { textAlign: IgxTextAlign.END };

        const alignEntries = {
            'top-start': {
                ...top,
                ...start,
            },
            top: {
                ...top,
                ...center,
            },
            'top-end': {
                ...top,
                ...end,
            },
            'bottom-start': {
                ...bottom,
                ...start,
            },
            bottom: {
                ...bottom,
                ...center,
            },
            'bottom-end': {
                ...bottom,
                ...end,
            },
        };

        const alignMap = new Map<
            string,
            {
                textTop: boolean;
                textAlign: IgxTextAlign;
            }
        >(Object.entries(alignEntries));

        return (
            alignMap.get(labelAlign) || {
                textTop: true,
                textAlign: IgxTextAlign.START,
            }
        );
    }
}
