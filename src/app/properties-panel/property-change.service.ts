import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivationStart, Router } from '@angular/router';

export type ControlType =
    'boolean' |
    'number' |
    'range' |
    'radio' |
    'radio-inline' |
    'button-group' |
    'select' |
    'text' |
    'date' |
    'time' |
    'date-time';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PropertyPanelConfig = {
    [key: string]: {
        label?: string;
        control: {
            type: ControlType,
            options?: string[];
            labels?: string[];
            min?: number;
            max?: number;
            step?: number;
            defaultValue?: any;
        };
    };
}

export type Properties = {
    [K in keyof PropertyPanelConfig]: any;
};

@Injectable({
    providedIn: 'root',
})
export class PropertyChangeService {
    public propertyChanges = new BehaviorSubject<PropertyPanelConfig>({});
    public panelConfig = new BehaviorSubject<PropertyPanelConfig>({});
    public customControlsSource = new BehaviorSubject<TemplateRef<any> | null>(null);

    constructor(private router: Router) {
        this.router.events.subscribe(event => {
            if (event instanceof ActivationStart) {
                this.clearPanelConfig();
                this.clearCustomControls();
            }
        });

        this.panelConfig.subscribe((config) => {
            if (config) {
                const properties = {};

                Object.keys(config).forEach((key) => {
                    const defaultValue = config[key]?.control?.defaultValue;

                    if (defaultValue !== undefined && defaultValue !== null) {
                        properties[key] = defaultValue;
                    }
                });

                if (Object.entries(properties).length !== 0) {
                    this.propertyChanges.next(properties);
                }
            }
        });
    }

    public updateProperty(key: string, value: any): void {
        const currentChanges = this.propertyChanges.getValue();
        currentChanges[key] = value;
        this.propertyChanges.next(currentChanges);
    }

    public getProperty(key: string): any {
        const changes = this.propertyChanges.getValue();
        return changes[key];
    }

    public setPanelConfig(config: PropertyPanelConfig): void {
        this.panelConfig.next(config);
    }

    public clearPanelConfig(): void {
        this.panelConfig.next({});
    }

    public setCustomControls(controls: TemplateRef<any>): void {
        this.customControlsSource.next(controls);
    }

    public clearCustomControls(): void {
        this.customControlsSource.next(null);
    }
}
