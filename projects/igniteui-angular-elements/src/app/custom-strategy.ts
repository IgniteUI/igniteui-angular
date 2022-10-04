import { ApplicationRef, ChangeDetectorRef, ComponentFactory, ComponentRef, Injector, OnChanges, QueryList, Type, ViewContainerRef } from '@angular/core';
import { NgElement, NgElementStrategy, NgElementStrategyFactory,  } from '@angular/elements';
import { ComponentConfig } from './component-config';

// TODO: Should be from '@angular/elements' when actually public
import { ComponentNgElementStrategy, ComponentNgElementStrategyFactory, extractProjectableNodes, isFunction } from './ng-element-strategy';
import { TemplateWrapperComponent } from './wrapper/wrapper.component';

export const ComponentRefKey = Symbol('ComponentRef');

abstract class IgcNgElement extends NgElement {
    public override readonly ngElementStrategy: IgxCustomNgElementStrategy;
}

/**
 * Custom Ignite UI for Angular Elements strategy
 */
class IgxCustomNgElementStrategy extends ComponentNgElementStrategy {

    private setComponentRef: (value: ComponentRef<any>) => void;

    /**
     * Resolvable component reference.
     * The parent instance can/will still be creating when children connect
     * or will move them around in the DOM and still trigger connect out-of-order.
     * This can be awaited by the children so they can resolve their parent ref
     * after they've been moved and the parent is done initializing.
     */
    public [ComponentRefKey] = new Promise<ComponentRef<any>>((resolve, _) => this.setComponentRef = resolve);

    private _templateWrapper : TemplateWrapperComponent;
    protected get templateWrapper() : TemplateWrapperComponent {
        if (!this._templateWrapper) {
            const componentRef = (this as any).componentRef as ComponentRef<any>;
            const viewRef = componentRef.injector.get(ViewContainerRef);
            this._templateWrapper = viewRef.createComponent(TemplateWrapperComponent).instance;
        }
        return this._templateWrapper;
    }

    constructor(private _componentFactory: ComponentFactory<any>, private _injector: Injector, private config: ComponentConfig[]) {
        super(_componentFactory, _injector);
    }

    override async initializeComponent(element: HTMLElement) {
        if (!element.isConnected) {
            // D.P. 2022-09-20 do not initialize on connectedCallback that is not actually connected
            // connectedCallback may be called once your element is no longer connected
            // https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
            return;
        }

        // set componentRef to non-null to prevent DOM moves from re-initializing
        // TODO: Fail handling or cancellation needed?
        (this as any).componentRef = {};

        const toBeOrphanedChildren = Array.from(element.children).filter(x => !this._componentFactory.ngContentSelectors.some(sel => x.matches(sel)));
        for (const iterator of toBeOrphanedChildren) {
            // TODO: special registration OR config for custom
        }
        let parentInjector: Injector;
        let parentAnchor: ViewContainerRef;
        let parent: IgcNgElement;
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
            parent = element.parentElement.closest(configParents.map(x => x.selector).join(',')) as IgcNgElement;
            // find the respective config entry
            parentConfig = configParents.find(x => x.selector === parent?.tagName.toLocaleLowerCase());

            // ngElementStrategy getter is protected and also has initialization logic, though that should be safe at this point
            const parentComponentRef = await parent?.ngElementStrategy[ComponentRefKey];
            parentInjector = parentComponentRef?.injector;
        }

        // TODO: Consider general solution (as in Parent w/ @igxAnchor tag)
        if (element.tagName.toLocaleLowerCase() === 'igc-grid-toolbar'
            || element.tagName.toLocaleLowerCase() === 'igc-paginator') {
            // NOPE: viewcontainerRef will re-render this node again, no option for rootNode :S
            // this.componentRef = parentAnchor.createComponent(this.componentFactory.componentType, { projectableNodes, injector: childInjector });
            const parentComponentRef = await parent.ngElementStrategy[ComponentRefKey];
            parentAnchor = parentComponentRef?.instance.anchor;
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
         this.setComponentRef((this as any).componentRef);
         (this as any).viewChangeDetectorRef = (this as any).componentRef.injector.get(ChangeDetectorRef);

         (this as any).implementsOnChanges = isFunction(((this as any).componentRef.instance as OnChanges).ngOnChanges);

         this.initializeInputs();
         this.initializeOutputs((this as any).componentRef);

         this.detectChanges();

         if (parentAnchor && parentInjector) {
            // attempt to attach the newly created ViewRef to the parents's instead of the App global
            const parentViewRef = parentInjector.get<ViewContainerRef>(ViewContainerRef);
            // preserve original position in DOM (in case of projection, e.g. grid pager):
            const domParent = element.parentElement;
            const nextSibling = element.nextSibling;
            parentAnchor.insert((this as any).componentRef.hostView); //bad, moves in DOM, AND need to be in inner anchor :S
            //restore original DOM position
            domParent.insertBefore(element, nextSibling);
            this.detectChanges();
        } else if (!parentAnchor) {
            const applicationRef = this._injector.get<ApplicationRef>(ApplicationRef);
            applicationRef.attachView((this as any).componentRef.hostView);
        }
         /**
         * End modified copy of super.initializeComponent
         */

        // componentRef should also likely be protected:
        const componentRef = (this as any).componentRef as ComponentRef<any>;

        if (parentConfig && parent) {
            const componentType = this._componentFactory.componentType;
            // TODO - look into more cases where query expects a certain base class but gets a subclass.
            // Related to https://github.com/IgniteUI/igniteui-angular/pull/12134#discussion_r983147259
            const contentQueries = parentConfig.contentQueries.filter(x => x.childType === componentType || x.childType.isPrototypeOf(componentType));

            for (const query of contentQueries) {
                const parentRef = await parent.ngElementStrategy[ComponentRefKey];

                if (query.isQueryList) {
                    const list = parentRef.instance[query.property] as QueryList<any>;
                    list.reset([...list.toArray(), componentRef.instance]);
                    list.notifyOnChanges();
                } else {
                    parentRef.instance[query.property] = componentRef.instance;
                }
                parentRef.changeDetectorRef.detectChanges();
            }
        }
    }

   
     

    public override setInputValue(property: string, value: any): void {        
        const componentRef = (this as any).componentRef as ComponentRef<any>;
        const componentConfig = this.config?.find(x => x.component === this._componentFactory.componentType);
        if (componentRef && componentConfig?.templateProps?.includes(property)) {
            // const oldValue = this.getInputValue(property);
            value = this.templateWrapper.addTemplate(value);
            // TODO: discard oldValue
        }
        if ((this as any).componentRef === null ||
            !(this as any).componentRef.instance) {
            (this as any).initialInputValues.set(property, value);
                return;
        }
        super.setInputValue(property, value);
    }

    public override getInputValue(property: string): any {
        let returnValue = super.getInputValue(property);

        const componentConfig = this.config?.find(x => x.component === this._componentFactory.componentType);
        const componentRef = (this as any).componentRef as ComponentRef<any>;
        if (componentRef && componentConfig?.templateProps?.includes(property)) {
            returnValue = this.templateWrapper.getTemplateFunction(returnValue) || returnValue;
        }

        return returnValue;
    }

    /**
     * assignTemplateCallback
     */
    public assignTemplateCallback(templateProp: string, callback: any) {
        const componentRef = (this as any).componentRef as ComponentRef<any>;
        if (componentRef) {
            const templateRef = this.templateWrapper.addTemplate(callback);
            componentRef.instance[templateProp] = templateRef;
            componentRef.changeDetectorRef.detectChanges();
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
