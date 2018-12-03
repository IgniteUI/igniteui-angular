// generate schema:
// npx typescript-json-schema migrations/common/schema/index.ts SelectorChanges -o migrations/common/schema/selector.schema.json --required

export interface ThemePropertyChanges {
    /** An array of changes to theme function properties */
    changes: ThemePropertyChange[];
}
export interface ThemePropertyChange extends ChangeAction {
    /** Name of the theme property */
    name: string;
    /** Theming function this parameter belongs to */
    owner: string;
}

export interface SelectorChanges {
    /** An array of changes to component/directive selectors */
    changes: SelectorChange[];
}
export interface SelectorChange extends TemplateElement, ChangeAction {}

export interface BindingChanges {
    /** An array of changes to input/output properties */
    changes: BindingChange[];
}
export interface BindingChange extends ChangeAction {
    /** Name of the input/output property to change */
    name: string;
    /** Component that emits the output or accepts the input */
    owner: TemplateElement;
    /** Move property value between owner's element tags. */
    moveBetweenElementTags?: boolean;
    /** An array of function names that will be executed as conditions. */
    conditions?: string[];
}

export interface ClassChanges {
    /** An array of changes to output properties */
    changes: ClassChange[];
}
export interface ClassChange {
    /** Name of the class to change */
    name: string;
    /** Replace original name with new one */
    replaceWith: string;
}

export interface ChangeAction {
    /** Replace original selector/property with new one */
    replaceWith?: string;
    /** Remove directive/component/property */
    remove?: boolean;
}

export interface TemplateElement {
    /** Type of selector the change applies to - either component or directive */
    type: ElementType;
    /** Original selector to apply change to */
    selector: string;
}

export interface ImportsChange {
    /** Name of the module to change */
    name: string;
    /** Replace original name with new one */
    replaceWith: string;
}

export interface ImportsChanges {
    /** An array of changes to imports array */
    changes: ImportsChange[];
}

export enum ElementType {
    directive = 'directive',
    component = 'component'
}
