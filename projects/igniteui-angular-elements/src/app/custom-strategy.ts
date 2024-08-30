import { ApplicationRef, ChangeDetectorRef, ComponentFactory, ComponentRef, Injector, OnChanges, QueryList, Type, ViewContainerRef, reflectComponentType } from '@angular/core';
import { NgElement } from '@angular/elements';
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponentConfig, ContentQueryMeta } from './component-config';

import { ComponentNgElementStrategy, ComponentNgElementStrategyFactory, extractProjectableNodes, isFunction } from './ng-element-strategy';
import { TemplateWrapperComponent } from './wrapper/wrapper.component';

export const ComponentRefKey = Symbol('ComponentRef');
const SCHEDULE_DELAY = 10;

/** @hidden @internal */
export abstract class IgcNgElement extends NgElement {
    public override readonly ngElementStrategy: IgxCustomNgElementStrategy;
}

/**
 * Custom Ignite UI for Angular Elements strategy
 */
class IgxCustomNgElementStrategy extends ComponentNgElementStrategy {

    // public override componentRef: ComponentRef<any>|null = null;

    protected element: IgcNgElement;
    /** Native Angular parent (if any) the Element is created under, usually as template of dynamic component (e.g. HGrid row island paginator) */
    protected angularParent: ComponentRef<any>;
    /** Cached child instances per query prop. Used for dynamic components's child templates that normally persist in Angular runtime */
    protected cachedChildComponents: Map<string, ComponentRef<any>[]> = new Map();
    private setComponentRef: (value: ComponentRef<any>) => void;

    /**
     * Resolvable component reference.
     * The parent instance can/will still be creating when children connect
     * or will move them around in the DOM and still trigger connect out-of-order.
     * This can be awaited by the children so they can resolve their parent ref
     * after they've been moved and the parent is done initializing.
     */
    public [ComponentRefKey] = new Promise<ComponentRef<any>>((resolve, _) => this.setComponentRef = resolve);

    private _templateWrapper: TemplateWrapperComponent;
    protected get templateWrapper(): TemplateWrapperComponent {
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
        this.element = element as IgcNgElement;

        // set componentRef to non-null to prevent DOM moves from re-initializing
        // TODO: Fail handling or cancellation needed?
        (this as any).componentRef = {};

        const toBeOrphanedChildren = Array.from(element.children).filter(x => !this._componentFactory.ngContentSelectors.some(sel => x.matches(sel)));
        for (const iterator of toBeOrphanedChildren) {
            // TODO: special registration OR config for custom
        }
        let parentInjector: Injector;
        let parentAnchor: ViewContainerRef;
        const parents: IgcNgElement[] = [];
        let parentConfig: ComponentConfig;
        const componentConfig = this.config?.find(x => x.component === this._componentFactory.componentType);

        const configParents = componentConfig?.parents
            .map(parentType => this.config.find(x => x.component === parentType))
            .filter(x => x.selector);

        if (configParents?.length) {
            let node = element as IgcNgElement;
            while (node?.parentElement) {
                node = node.parentElement.closest<IgcNgElement>(configParents.flatMap(x => [
                    x.selector,
                    reflectComponentType(x.component).selector
                ]).join(','));
                if (node) {
                    parents.push(node);
                }
            }
            // select closest of all possible config parents
            let parent = parents[0];

            // Collected parents may include direct Angular HGrids, so only wait for configured parent elements:
            const configParent = configParents.find(x => x.selector === parent?.tagName.toLocaleLowerCase());
            if (configParent && !customElements.get(configParent.selector)) {
                await customElements.whenDefined(configParent.selector);
            }

            // ngElementStrategy getter is protected and also has initialization logic, though that should be safe at this point
            if (parent?.ngElementStrategy) {
                this.angularParent = parent.ngElementStrategy.angularParent;
                const parentComponentRef = await parent?.ngElementStrategy[ComponentRefKey];
                parentInjector = parentComponentRef?.injector;

                // TODO: Consider general solution (as in Parent w/ @igxAnchor tag)
                if (element.tagName.toLocaleLowerCase() === 'igc-grid-toolbar'
                    || element.tagName.toLocaleLowerCase() === 'igc-paginator') {
                    // NOPE: viewcontainerRef will re-render this node again, no option for rootNode :S
                    // this.componentRef = parentAnchor.createComponent(this.componentFactory.componentType, { projectableNodes, injector: childInjector });
                    const parentComponentRef = await parent?.ngElementStrategy[ComponentRefKey];
                    parentAnchor = parentComponentRef?.instance.anchor;
                }
            } else if ((parent as any)?.__componentRef) {
                this.angularParent = (parent as any).__componentRef;
                parentInjector = this.angularParent.injector;
            }
        }

        // need to be able to reset the injector (as protected) to the parent's to call super normally
        (this as any).injector = parentInjector || this._injector;
        // super.initializeComponent(element);

        /**
         * Modified copy of super.initializeComponent:
         */
        const childInjector = Injector.create({ providers: [], parent: (this as any).injector });
        const projectableNodes = extractProjectableNodes(
            element,
            this._componentFactory.ngContentSelectors,
        );
        (this as any).componentRef = this._componentFactory.create(childInjector, projectableNodes, element);
        this.setComponentRef((this as any).componentRef);
        (this as any).viewChangeDetectorRef = (this as any).componentRef.injector.get(ChangeDetectorRef);

        (this as any).implementsOnChanges = isFunction(((this as any).componentRef.instance as OnChanges).ngOnChanges);

        //we need a name ref on the WC element to be copied down for the purposes of blazor.
        //alternatively we need to be able to hop back out to the WC element on demand.
        if (element) {
            if ((this as any).componentRef.instance) {
                (this as any).componentRef.instance.___wcElement = element;
            }
        }

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

        for (let i = 0; i < parents.length; i++) {
            const parent = parents[i];

            // find the respective config entry
            parentConfig = configParents.find(x => x.selector === parent?.tagName.toLocaleLowerCase());

            if (!parentConfig) {
                continue;
            }

            const componentType = this._componentFactory.componentType;
            // TODO - look into more cases where query expects a certain base class but gets a subclass.
            // Related to https://github.com/IgniteUI/igniteui-angular/pull/12134#discussion_r983147259
            const contentQueries = parentConfig.contentQueries.filter(x => x.childType === componentType || x.childType === componentConfig.provideAs);

            for (const query of contentQueries) {
                if (i > 0 && !query.descendants) {
                    continue;
                }

                const parentRef = await parent.ngElementStrategy[ComponentRefKey];
                if (query.isQueryList) {
                    parent.ngElementStrategy.scheduleQueryUpdate(query.property);
                    if (this.angularParent) {
                        // Cache the component in the parent (currently only paginator for HGrid),
                        // so it is kept in the query even when detached from DOM
                        this.addToParentCache(parent, query.property);
                    }
                } else {
                    parentRef.instance[query.property] = componentRef.instance;
                    parentRef.changeDetectorRef.detectChanges();
                }
            }
        }

        if (['igc-grid', 'igc-tree-grid', 'igc-hierarchical-grid'].includes(element.tagName.toLocaleLowerCase())) {
            this.patchGridPopups();
        }
    }

    public override setInputValue(property: string, value: any, transform?: (value: any) => any): void {
        if ((this as any).componentRef === null ||
            !(this as any).componentRef.instance) {
            (this as any).initialInputValues.set(property, value);
            return;
        }
        const componentRef = (this as any).componentRef as ComponentRef<any>;
        const componentConfig = this.config?.find(x => x.component === this._componentFactory.componentType);

        if (value === componentRef.instance[property]) {
            return;
        }
        if (componentRef && componentConfig?.templateProps?.includes(property)) {
            // const oldValue = this.getInputValue(property);
            if (this.templateWrapper.templateFunctions.includes(value)) return;
            const oldRef = componentRef.instance[property];
            const oldValue = oldRef && this.templateWrapper.getTemplateFunction(oldRef);
            if (oldValue === value) {
                return;
            }
            value = this.templateWrapper.addTemplate(value);
            // TODO: discard oldValue
        }
        if (componentRef && componentConfig?.boolProps?.includes(property)) {
            // bool coerce:
            value = value != null && `${value}` !== 'false';
        }
        if (componentRef && componentConfig?.numericProps?.includes(property)) {
            // number coerce:
            if (!isNaN(Number(value) - parseFloat(value))) {
                value = Number(value);
            }
            // TODO: reject value if not? Or fallback value?
        }

        // TODO(D.P.): Check API use and expose needed props to avoid unwrap OR handle component ref props w/ config
        if (componentConfig.selector === 'igc-pivot-data-selector' && property === 'grid' && value) {
            value = value.ngElementStrategy?.componentRef?.instance || value;
        }
        super.setInputValue(property, value, transform);
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

    //#region schedule query update
    private schedule = new Map<string, () => void>();

    /**
     * Schedule an update for a content query for the component
     * @param queryName The name of the query property to update
     */
    public scheduleQueryUpdate(queryName: string) {
        if (this.schedule.has(queryName)) {
            this.schedule.get(queryName)();
        }

        const id = setTimeout(() => this.updateQuery(queryName), SCHEDULE_DELAY);
        this.schedule.set(queryName, () => clearTimeout(id));
    }

    private updateQuery(queryName: string) {
        this.schedule.delete(queryName);
        const componentRef = (this as any).componentRef as ComponentRef<any>;
        if (componentRef) {
            const componentConfig = this.config?.find(x => x.component === this._componentFactory.componentType);
            const query = componentConfig.contentQueries.find(x => x.property === queryName);
            const children = this.runQueryInDOM(this.element, query);
            let childRefs = [];
            for (const child of children) {
                // D.P. Use sync componentRef to avoid having this being stuck waiting while another update is queued
                // While for initialized comps resolved promises will almost certainly yield within the same cycle https://stackoverflow.com/a/64371201 (tested)
                // On the off chance one of many component is stuck initializing(async) and the update runs, don't want it to be stuck waiting for that too
                // Also the newly initialized comp will schedule an update again anyway
                // const childRef = await child.ngElementStrategy[ComponentRefKey];
                const childRef = (child.ngElementStrategy as any).componentRef as ComponentRef<any>;
                if (childRef?.instance) {
                    childRefs.push(childRef.instance);
                }
            }
            if (query.descendants && this.cachedChildComponents.has(queryName)) {
                childRefs = [...this.cachedChildComponents.get(queryName), ...childRefs];
            }
            const list = (this as any).componentRef.instance[query.property] as QueryList<any>;
            list.reset(childRefs);
            list.notifyOnChanges();
        }
    }

    private runQueryInDOM(element: HTMLElement, query: ContentQueryMeta): IgcNgElement[] {
        const childConfigs = this.config.filter(x => x.component === query.childType || query.childType === x.provideAs);
        const childSelector = childConfigs
            .map(x => x.selector)
            .filter(x => x)
            .join(',');

        let children = Array.from(element.querySelectorAll<IgcNgElement>(childSelector));

        if (children.length && !query.descendants) {
            // combined parent selectors tad assuming, but for now it just covers column+group in single query so might be fine
            const parents = new Set(childConfigs.map(x => x.parents).flat());
            const parentSelectors = this.config.filter(x => parents.has(x.component)).map(x => x.selector).filter(x => x).join(',');

            children = children.filter(x => x.parentElement.closest(parentSelectors) === element);
        }
        return children;
    }

    private addToParentCache(parentElement: IgcNgElement, queryName: string) {
        var cachedComponents = parentElement.ngElementStrategy.cachedChildComponents.get(queryName) || [];
        cachedComponents.push((this as any).componentRef.instance);
        parentElement.ngElementStrategy.cachedChildComponents.set(queryName, cachedComponents);
    }
    //#endregion schedule query update

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

    //#region Grid popups hide on scroll
    /**
     * Close popup igc- components in the Grid on scroll, replicating what the grids do with `hideOverlays`
     * TODO: Integrate in components directly (Elements extended components/mixin)
     * TODO: Optimization opportunity to only hook the event listeners when a related template is passed/active
     */
    private patchGridPopups() {
        const toggles = new Set<HTMLElement & { hide(): void /* IgcToggleComponent */ }>();
        const componentRef = (this as any).componentRef as ComponentRef<any>;

        const scrollSub = fromEvent(this.element, 'gridScroll').pipe(takeUntil(componentRef.instance.destroy$));
        scrollSub.subscribe(() => {
            // this.element.querySelectorAll<IgcComboComponent<any>>('igc-combo,igc-select').forEach(c => c.hide());
            // this.element.dispatchEvent(new CustomEvent('scroll', { bubbles: false }));
            if (toggles.size) {
                toggles.forEach(t => {
                    if (t.isConnected) {
                        t.hide();
                    }
                });
                toggles.clear();
            }
        });

        fromEvent(this.element, 'igcOpened').pipe(takeUntil(componentRef.instance.destroy$)).subscribe((e: CustomEvent) => {
            if (!Object.keys(e.detail).length) {
                // toggle directive-based components emit void details
                // TODO: need better flag
                toggles.add(e.target as any);
            }
        });
    }
    //#endregion

    override disconnect(): void {
        if (this.angularParent) {
            this.angularParent.onDestroy(() => super.disconnect());
        } else {
            super.disconnect();
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
