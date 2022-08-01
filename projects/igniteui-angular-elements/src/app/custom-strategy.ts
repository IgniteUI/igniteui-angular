import { ApplicationRef, ChangeDetectorRef, ComponentFactory, ComponentRef, Injector, OnChanges, QueryList, Type, ViewContainerRef } from '@angular/core';
import { NgElement, NgElementStrategy, NgElementStrategyFactory,  } from '@angular/elements';
import { ComponentConfig } from './component-config';

// TODO: Should be from '@angular/elements' when actually public
import { ComponentNgElementStrategy, ComponentNgElementStrategyFactory, extractProjectableNodes, isFunction } from './ng-element-strategy';

/**
 * Custom Ignite UI for Angular Elements strategy
 */
class IgxCustomNgElementStrategy extends ComponentNgElementStrategy {

    constructor(private _componentFactory: ComponentFactory<any>, private _injector: Injector, private config: ComponentConfig[]) {
        super(_componentFactory, _injector);
    }

    override initializeComponent(element: HTMLElement) {
        const toBeOrphanedChildren = Array.from(element.children).filter(x => !this._componentFactory.ngContentSelectors.some(sel => x.matches(sel)));
        for (const iterator of toBeOrphanedChildren) {
            // TODO: special registration OR config for custom
        }
        let parentInjector: Injector;
        let parentAnchor: ViewContainerRef;
        let parent: NgElement;
        let parentConfig: ComponentConfig;
        const componentConfig = this.config?.find(x => x.component === this._componentFactory.componentType);
        if (componentConfig) {
            // TODO: configure in advance
            componentConfig.selector = element.tagName.toLocaleLowerCase();
        }
        const configParents = componentConfig?.parents
            .map(parentType => this.config.find(x => x.component === parentType))
            .filter(x => x.selector);

        if (configParents?.length) {
            // select closest of all possible config parents
            parent = element.closest(configParents.map(x => x.selector).join(',')) as NgElement;
            // find the respective config entry
            parentConfig = configParents.find(x => x.selector === parent.tagName.toLocaleLowerCase());

            // ngElementStrategy getter is protected and also has initialization logic, though that should be safe at this point
            // TODO: Extend `NgElement` interface with Igx-specific prop(s) (const!) for the strategy so this can be accessed cleanly?
            parentInjector = parent['ngElementStrategy']['componentRef'].injector as Injector;
        }

        if (element.tagName.toLocaleLowerCase() === 'igx-grid-toolbar') {
            // NOPE: viewcontainerRef will re-render this node again, no option for rootNode :S
            // this.componentRef = parentAnchor.createComponent(this.componentFactory.componentType, { projectableNodes, injector: childInjector });
            parentAnchor = parent['ngElementStrategy']['componentRef'].instance.anchor;
        }

        // need to be able to reset the injector (as protected) to the parent's to call super normally
        (this as any).injector = parentInjector || this._injector;
        // super.initializeComponent(element);

        /**
         * Modified copy of super.initializeComponent:
         */
         const childInjector = Injector.create({providers: [], parent: (this as any).injector});
         const projectableNodes =
             extractProjectableNodes(element, this._componentFactory.ngContentSelectors);
         (this as any).componentRef = this._componentFactory.create(childInjector, projectableNodes, element);
         (this as any).viewChangeDetectorRef = (this as any).componentRef.injector.get(ChangeDetectorRef);

         (this as any).implementsOnChanges = isFunction(((this as any).componentRef.instance as OnChanges).ngOnChanges);

         this.initializeInputs();
         this.initializeOutputs((this as any).componentRef);

         this.detectChanges();

         if (parentAnchor && parentInjector) {
            // attempt to attach the newly created ViewRef to the parents's instead of the App global
            const parentViewRef = parentInjector.get<ViewContainerRef>(ViewContainerRef);
            parentAnchor.insert((this as any).componentRef.hostView); //bad, moves in DOM, AND need to be in inner anchor :S
            this.detectChanges();
        } else if (!parentAnchor) {
            const applicationRef = this._injector.get<ApplicationRef>(ApplicationRef);
            applicationRef.attachView((this as any).componentRef.hostView);
        }
         /**
         * End modified copy of super.initializeComponent
         */

        // componentRef should also likely be protected:
        const componentRef = (this as any).componentRef;

        if (parentConfig && parent) {
            const contentQueries = parentConfig.contentQueries.filter(x => x.childType === this._componentFactory.componentType);

            for (const query of contentQueries) {
                const parentRef = parent['ngElementStrategy']['componentRef'] as ComponentRef<any>;

                if (query.isQueryList) {
                    const list = parentRef.instance[query.property] as QueryList<any>;
                    list.reset([...list.toArray(), componentRef.instance]);
                } else {
                    parentRef.instance[query.property] = componentRef.instance;
                }
                parentRef.changeDetectorRef.detectChanges();
            }
        }
    }
}

/**
 * Custom Ignite UI for Angular Elements strategy factory
 */
export class IgxCustomNgElementStrategyFactory extends ComponentNgElementStrategyFactory {

    /**
     * Create a new custom Ignite UI for Angular Elements strategy factory
     * @param component The component type
     * @param injector The injector for the component
     * @param config Additional component hierarchy configuration
     */
    constructor(component: Type<any>, injector: Injector, private config: ComponentConfig[]) {
        super(component, injector);
    }

    public override create(injector: Injector) {
        return new IgxCustomNgElementStrategy(this.componentFactory, injector, this.config);
    }
}
