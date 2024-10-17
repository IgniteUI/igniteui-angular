import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PropertyPanelConfig } from './properties-panel.component';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class PropertyChangeService {
    private propertyChanges = new BehaviorSubject<PropertyPanelConfig>({});
    public propertyChanges$ = this.propertyChanges.asObservable();

    public panelConfig = new BehaviorSubject<PropertyPanelConfig>({});
    public panelConfig$ = this.panelConfig.asObservable();

    private customControlsSource = new BehaviorSubject<TemplateRef<any> | null>(null);
    public customControls$ = this.customControlsSource.asObservable();

    public emitInitialValues(config: PropertyPanelConfig): void {
        this.panelConfig.next(config);
        Object.keys(config).forEach((key) => {
            const defaultValue = config[key]?.control?.defaultValue;
            if (defaultValue !== undefined && defaultValue !== null) {
                this.updateProperty(key, defaultValue);
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
        this.panelConfig.next(null);
    }

    public setCustomControls(controls: TemplateRef<any>): void {
        this.customControlsSource.next(controls);
    }

    public clearCustomControls(): void {
        this.customControlsSource.next(null);
    }

    constructor(private router: Router) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.clearPanelConfig();
                this.clearCustomControls();
            }
        });
    }
}

