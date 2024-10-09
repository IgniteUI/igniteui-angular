import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PropertyPanelConfig } from './properties-panel/properties-panel.component';

@Injectable({
    providedIn: 'root',
})
export class PropertyChangeService {
    private propertyChanges = new BehaviorSubject<{ [key: string]: any }>({});
    public propertyChanges$ = this.propertyChanges.asObservable();

    private panelConfig = new BehaviorSubject<PropertyPanelConfig | null>(null);
    public panelConfig$ = this.panelConfig.asObservable();

    public updateProperty(key: string, value: any): void {
        const currentChanges = this.propertyChanges.getValue();
        currentChanges[key] = value;
        this.propertyChanges.next(currentChanges);
    }

    public emitInitialValues(config: PropertyPanelConfig): void {
        this.panelConfig.next(config);
        Object.keys(config).forEach((key) => {
            const defaultValue = config[key]?.control?.defaultValue;
            if (defaultValue !== undefined && defaultValue !== null) {
                this.updateProperty(key, defaultValue);
            }
        });
    }

    public setPanelConfig(config: PropertyPanelConfig | null): void {
        this.panelConfig.next(config);
    }

    public clearPanelConfig(): void {
        this.panelConfig.next(null);
    }

    public getProperty(key: string): any {
        const changes = this.propertyChanges.getValue();
        const config = this.panelConfig.getValue();
        return changes[key] !== undefined ? changes[key] : config?.[key]?.control?.defaultValue;
    }
}

