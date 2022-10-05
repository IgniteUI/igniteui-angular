import { Type } from '@angular/core';
import { createCustomElement, NgElementConfig, NgElementConstructor } from '@angular/elements';
import { ComponentConfig } from './component-config';
import { IgxCustomNgElementStrategyFactory } from './custom-strategy';

export type IgxNgElementConfig = Omit<NgElementConfig, 'strategyFactory'> & { registerConfig: ComponentConfig[] };

export function createIgxCustomElement<T>(component: Type<any>, config: IgxNgElementConfig): NgElementConstructor<T> {
    const strategyFactory = new IgxCustomNgElementStrategyFactory(component, config.injector, config.registerConfig);
    const elementCtor = createCustomElement<T>(component, {
        ...config,
        strategyFactory
    });

    const componentConfig = config.registerConfig?.find(x => x.component === component);

    for (const method of componentConfig?.methods) {
        elementCtor.prototype[method] = function() {
            const instance = this.ngElementStrategy.componentRef.instance;
            return this.ngElementStrategy.runInZone(() => instance[method].apply(instance, arguments));
        }
    }

    // TODO: all 'template' props, setInput check for componentRef!, accumulated Props before init, object componentRef
    // let propName = 'sortHeaderIconTemplate';
    // Object.defineProperty(elementCtor.prototype, propName, {
    //     get(): any {
    //         // TODO:
    //         throw 'Not implemented';
    //     },
    //     set(newValue: any): void {
    //         if (!newValue) return;
    //         this.ngElementStrategy.assignTemplateCallback(propName, newValue);
    //     },
    //     configurable: true,
    //     enumerable: true,
    // });

    return elementCtor;
}
