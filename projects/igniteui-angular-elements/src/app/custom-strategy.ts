import { ApplicationRef, ChangeDetectorRef, ComponentFactory, ComponentRef, DestroyRef, EventEmitter, Injector, OnChanges, QueryList, Type, ViewContainerRef, reflectComponentType } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgElement, NgElementStrategyEvent } from '@angular/elements';
import { fromEvent, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
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
    /** The parent _component_'s element (a.k.a the semantic parent, rather than the DOM one after projection) */
    protected parentElement?: WeakRef<IgcNgElement>;
    /** Native Angular parent (if any) the Element is created under, usually as template of dynamic component (e.g. HGrid row island paginator) */
    protected angularParent: ComponentRef<any>;
    /** Cached child instances per query prop. Used for dynamic components's child templates that normally persist in Angular runtime */
    protected cachedChildComponents: Map<string, ComponentRef<any>[]> = new Map();
    private setComponentRef: (value: ComponentRef<any>) => void;
    /** The maximum depth at which event arguments are processed and angular components wrapped with Proxies, that handle template set */
    private maxEventProxyDepth = 3;

    /**
     * Resolvable component reference.
     * The parent instance can/will still be creating when children connect
     * or will move them around in the DOM and still trigger connect out-of-order.
     * This can be awaited by the children so they can resolve their parent ref
     * after they've been moved and the parent is done initializing.
     */
    public [ComponentRefKey] = new Promise<ComponentRef<any>>((resolve, _) => this.setComponentRef = resolve);

    private _templateWrapperRef: ComponentRef<TemplateWrapperComponent>;
    protected get templateWrapper(): TemplateWrapperComponent {
        if (!this._templateWrapperRef) {
            const componentRef = (this as any).componentRef as ComponentRef<any>;
            const viewRef = componentRef.injector.get(ViewContainerRef);
            this._templateWrapperRef = viewRef.createComponent(TemplateWrapperComponent);
        }
        return this._templateWrapperRef.instance;
    }

    private _configSelectors: string;
    public get configSelectors(): string {
        if (!this._configSelectors) {
            this._configSelectors = this.config.map(x => x.selector).join(',');
        }
        return this._configSelectors;
    }

    constructor(private _componentFactory: ComponentFactory<any>, private _injector: Injector, private config: ComponentConfig[]) {
        super(_componentFactory, _injector);
    }

    protected override async initializeComponent(element: HTMLElement) {
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

        // const toBeOrphanedChildren = Array.from(element.children).filter(x => !this._componentFactory.ngContentSelectors.some(sel => x.matches(sel)));
        // for (const iterator of toBeOrphanedChildren) {
        //     // TODO: special registration OR config for custom
        // }
        let parentInjector: Injector;
        let parentAnchor: ViewContainerRef;
        const parents: WeakRef<IgcNgElement>[] = [];
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
                    parents.push(new WeakRef(node));
                }
            }
            // select closest of all possible config parents
            let parent = parents[0]?.deref();

            // Collected parents may include direct Angular HGrids, so only wait for configured parent elements:
            const configParent = configParents.find(x => x.selector === parent?.tagName.toLocaleLowerCase());
            if (configParent && !customElements.get(configParent.selector)) {
                await customElements.whenDefined(configParent.selector);
            }

            // ngElementStrategy getter is protected and also has initialization logic, though that should be safe at this point
            if (parent?.ngElementStrategy) {
                this.angularParent = parent.ngElementStrategy.angularParent;
                this.parentElement = new WeakRef(parent);
                let parentComponentRef = await parent?.ngElementStrategy[ComponentRefKey];
                parentInjector = parentComponentRef?.injector;

                // TODO: Consider general solution (as in Parent w/ @igxAnchor tag)
                if (element.tagName.toLocaleLowerCase() === 'igc-grid-toolbar'
                    || element.tagName.toLocaleLowerCase() === 'igc-paginator') {
                    // NOPE: viewcontainerRef will re-render this node again, no option for rootNode :S
                    // this.componentRef = parentAnchor.createComponent(this.componentFactory.componentType, { projectableNodes, injector: childInjector });
                    parentComponentRef = await parent?.ngElementStrategy[ComponentRefKey];
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

        const parentQueries = this.getParentContentQueries(componentConfig, parents, configParents);

        for (const { parent, query } of parentQueries) {
            if (query.isQueryList) {
                parent.ngElementStrategy.scheduleQueryUpdate(query.property);
                if (this.angularParent) {
                    // Cache the component in the parent (currently only paginator for HGrid),
                    // so it is kept in the query even when detached from DOM
                    this.addToParentCache(parent, query.property);
                }
            } else {
                const parentRef = await parent.ngElementStrategy[ComponentRefKey];
                parentRef.instance[query.property] = componentRef.instance;
                parentRef.changeDetectorRef.detectChanges();
            }
        }

        if (['igc-grid', 'igc-tree-grid', 'igc-hierarchical-grid'].includes(element.tagName.toLocaleLowerCase())) {
            this.patchGridPopups();
        }

        // instead of duplicating super.disconnect() w/ the scheduled destroy:
        componentRef.onDestroy(() => {
            if (this._templateWrapperRef) {
                this._templateWrapperRef.destroy();
                this._templateWrapperRef = null;
            }

            // also schedule query updates on all parents:
            this.getParentContentQueries(componentConfig, parents, configParents)
                .filter(x => x.parent?.isConnected && x.query.isQueryList)
                .forEach(({ parent, query }) => {
                    parent.ngElementStrategy.scheduleQueryUpdate(query.property);
                    if (this.angularParent) {
                        this.removeFromParentCache(parent, query.property);
                    }
                });
        });
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

            // check template for any angular-element components
            this.templateWrapper.templateRendered.pipe(takeUntilDestroyed(componentRef.injector.get(DestroyRef))).subscribe((element) => {
                element.querySelectorAll<IgcNgElement>(this.configSelectors)?.forEach((c) => {
                    // tie to angularParent lifecycle for cached scenarios like detailTemplate:
                    c.ngElementStrategy.angularParent = componentRef;
                });
            });
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
        const cachedComponents = parentElement.ngElementStrategy.cachedChildComponents.get(queryName) || [];
        cachedComponents.push((this as any).componentRef.instance);
        parentElement.ngElementStrategy.cachedChildComponents.set(queryName, cachedComponents);
    }

    private removeFromParentCache(parentElement: IgcNgElement, queryName: string) {
        let cachedComponents = parentElement.ngElementStrategy.cachedChildComponents.get(queryName) || [];
        cachedComponents = cachedComponents.filter(x => x !== (this as any).componentRef.instance);
        parentElement.ngElementStrategy.cachedChildComponents.set(queryName, cachedComponents);
    }

    /** Get all matching content questions from all parents */
    private getParentContentQueries(componentConfig: ComponentConfig, parents: WeakRef<IgcNgElement>[], configParents: ComponentConfig[]): { parent: IgcNgElement, query: ContentQueryMeta }[] {
        const queries: { parent: IgcNgElement, query: ContentQueryMeta }[] = [];

        for (let i = 0; i < parents.length; i++) {
            const parent = parents[i]?.deref();

            // find the respective config entry
            const parentConfig = configParents.find(x => x.selector === parent?.tagName.toLocaleLowerCase());
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
                queries.push({ parent, query });
            }
        }

        return queries;
    }
    //#endregion schedule query update


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

    public override disconnect(): void {
        if (this.angularParent) {
            this.angularParent.onDestroy(() => super.disconnect());
        } else {
            super.disconnect();
        }
    }

    //#region Handle event args that return reference to components, since they return angular ref and not custom elements.
    /** Sets up listeners for the component's outputs so that the events stream emits the events. */
    protected override initializeOutputs(componentRef: ComponentRef<any>): void {
        const eventEmitters: Observable<NgElementStrategyEvent>[] = this._componentFactory.outputs.map(
            ({ propName, templateName }) => {
                const emitter: EventEmitter<any> = componentRef.instance[propName];
                return emitter.pipe(map((value: any) => ({ name: templateName, value: this.patchOutputComponents(propName, value) })));
            },
        );

        (this as any).eventEmitters.next(eventEmitters);
    }

    protected patchOutputComponents(eventName: string, eventArgs: any) {
        // Single out only `columnInit` event for now. If more events pop up will require a config generation.
        if (eventName !== "columnInit") {
            return eventArgs;
        }
        return this.createProxyForComponentValue(eventArgs, 1).value;
    }

    /**
     * Nested search of event args that contain angular components and replace them with proxies.
     * If event args are array of angular component instances should return array of proxies of each of those instances.
     * If event args are object that has a single property being angular component should return same object except the angular component being a proxy of itself.
     */
    protected createProxyForComponentValue(value: any, depth: number): { value: any, hasProxies: boolean } {
        if (depth > this.maxEventProxyDepth) {
            return { value, hasProxies: false };
        }

        let hasProxies = false;
        // TO DO!: Not very reliable as it is a very internal API and could be subject to change. If something comes up, should be changed.
        if (value?.__ngContext__) {
            const componentConfig = this.config.find((info: ComponentConfig) => value.constructor === info.component);
            if (componentConfig?.templateProps) {
                return { value: this.createElementsComponentProxy(value, componentConfig), hasProxies: true };
            }
        } else if (Array.isArray(value)) {
            if (!value[0]) {
                return { value, hasProxies: false };
            } else {
                // For array limit their parsing to first level and check if first item has created proxy inside.
                const firstItem = this.createProxyForComponentValue(value[0], this.maxEventProxyDepth);
                if (firstItem.hasProxies) {
                    const mappedArray = value.slice(1, value.length).map(item => this.createProxyForComponentValue(item, depth + 1));
                    mappedArray.unshift(firstItem);
                    return { value: mappedArray, hasProxies: true };
                }
            }
        } else if (typeof value === "object" && Object.entries(value).length && !(value instanceof Event)) {
            for (const [key, item] of Object.entries(value)) {
                if (!item) {
                    value[key] = item;
                } else {
                    const parsedItem = this.createProxyForComponentValue(item, depth + 1);
                    value[key] = parsedItem.value;
                    hasProxies = parsedItem.hasProxies || hasProxies;
                }
            }
        }

        return { value, hasProxies };
    }

    /** Create proxy for a component that handles setting template props, making sure it provides correct TemplateRef and not Lit template */
    protected createElementsComponentProxy(component: any, config: ComponentConfig) {
        const parentThis = this;
        return new Proxy(component, {
            set(target: any, prop: string, newValue: any) {
                // For now handle only template props
                if (config.templateProps.includes(prop)) {
                    const oldRef = target[prop];
                    const oldValue = oldRef && parentThis.templateWrapper.getTemplateFunction(oldRef);
                    if (oldValue === newValue) {
                        newValue = oldRef;
                    } else {
                        newValue = parentThis.templateWrapper.addTemplate(newValue);
                    }
                }
                target[prop] = newValue;

                return true;
            }
        });
    }
    //#endregion
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
