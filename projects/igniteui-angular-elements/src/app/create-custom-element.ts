import { Type } from '@angular/core';
import { createCustomElement, NgElementConfig, NgElementConstructor } from '@angular/elements';
import { ComponentConfig } from './component-config';
import { IgxCustomNgElementStrategyFactory } from './custom-strategy';

export type IgxNgElementConfig = Omit<NgElementConfig, 'strategyFactory'> & { registerConfig: ComponentConfig[] };

export function createIgxCustomElement<T>(component: Type<any>, config: IgxNgElementConfig): NgElementConstructor<T> {
    const strategyFactory = new IgxCustomNgElementStrategyFactory(component, config.injector, config.registerConfig);

    guardAttributeNames<T>(strategyFactory);

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

/**
 * Prevent direct dash case conversion from mishandling some property name cases
 * (e.g. `showPivotConfigurationUI`-> `show-pivot-configuration-u-i`)
 *
 * @remarks
 * TODO(D.P.): ATM `createCustomElement` maps attribute to props with simple dasherize
 * and both the util and produced map are all context-locked and can't be extended. Also
 * `componentFactory.inputs` is a logical getter and thus can't be modified directly.
 *
 * @param strategyFactory IgxCustomNgElementStrategyFactory with resolved componentFactory
 */
function guardAttributeNames<T>(strategyFactory: IgxCustomNgElementStrategyFactory) {
    // const inputs = strategyFactory.componentFactory.inputs; // technically readonly

    // getComponentDef not public, also technically readonly map
    // the key is the non-minified (template) name
    const inputs: {[P in keyof T]: string} = (strategyFactory.componentFactory as any).componentDef.inputs;

    for (const key in inputs) {
        const input = inputs[key];
        // detect consecutive capital letters in `templateName` and lower a portion of them
        if (/[A-Z]{2,}/.test(key)) {
            // showPivotConfigurationUI -> showPivotConfigurationUi -> show-pivot-configuration-ui
            // evenRowCSS -> evenRowCss -> even-row-css
            // DOMRect -> DomRect -> dom-rect
            const newKey = key.replace(/(?<=[A-Z])[A-Z]+(?![a-z])/g, char => char.toLowerCase());
            inputs[newKey] = input;
            // TODO: consider deleting the original key
        }
    }
}
