import { Type } from '@angular/core';
import { createCustomElement, NgElementConfig, NgElementConstructor } from '@angular/elements';
import { FilteringExpressionsTree, FilteringLogic, IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxGridComponent, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand } from 'igniteui-angular';
import { ComponentConfig } from './component-config';
import { IgxCustomNgElementStrategyFactory } from './custom-strategy';
import type { IgniteComponent } from '../utils/register';

export type IgxNgElementConfig = Omit<NgElementConfig, 'strategyFactory'> & { registerConfig: ComponentConfig[] };
type IgxElementConstructor<T> = NgElementConstructor<T> & { tagName: string};

export function createIgxCustomElement<T>(component: Type<T>, config: IgxNgElementConfig): IgxElementConstructor<T> {
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

    // Reuse `createCustomElement`'s approach for Inputs, should work for any prop too:
    componentConfig?.additionalProperties.forEach((p) => {
        let set: (v: any) => void | undefined;


        if (p.name in elementCtor.prototype) {
            throw new Error(`Potentially illegal property name ${p.name} defined for ${component.name}`);

        }

        if (p.writable) {
            set = function (newValue) {
                this.ngElementStrategy.setInputValue(p.name, newValue);
            }
        }

        Object.defineProperty(elementCtor.prototype, p.name, {
            get() {
                return this.ngElementStrategy.getInputValue(p.name);
            },
            set,
            configurable: true,
            enumerable: true,
        });
    });

    if (component === IgxGridComponent) {
        /**
         * @deprecated API access workaround moved from Grid for possible existing use compat. Remove in future version
         */
        function getFilterFactory () {
            return {
                stringFilteringOperand: IgxStringFilteringOperand.instance(),
                numberFilteringOperand: IgxNumberFilteringOperand.instance(),
                timeFilteringOperand: IgxTimeFilteringOperand.instance(),
                dateTimeFilteringOperand: IgxDateTimeFilteringOperand.instance(),
                dateFilteringOperand: IgxDateFilteringOperand.instance(),
                booleanFilteringOperand: IgxBooleanFilteringOperand.instance(),
                createFilteringExpressionTree: (operator: FilteringLogic, fieldName?: string) => {
                    return new FilteringExpressionsTree(operator, fieldName);
                }
            };
        }
        elementCtor.prototype.getFilterFactory = getFilterFactory;
    }

    // assign static `tagName` for register/define:
    Object.defineProperty(elementCtor, 'tagName', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: componentConfig?.selector
    });

    return elementCtor as typeof elementCtor & { tagName: string};
}

export function withRegister<T>(elementCtor: IgxElementConstructor<T>, register: () => void): IgniteComponent<T> {
    Object.defineProperty(elementCtor, 'register', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: register
    });

    return elementCtor as IgniteComponent<T>;
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

            // const newKey = key.replace(/(?<=[A-Z])[A-Z]+(?![a-z])/g, char => char.toLowerCase()); // no Lookbehind assertion in Safari yet
            const newKey = key.replace(/([A-Z])([A-Z]+)(?![a-z])/g, (match, p1, p2) => p1 + p2.toLowerCase());
            inputs[newKey] = input;
            // TODO: consider deleting the original key
        }
    }
}
