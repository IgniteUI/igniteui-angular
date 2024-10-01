/**
 * Equivalent functions of those from `igniteui-webcomponents`
 * with modified component constructor type
 */
import type { NgElementConstructor } from '@angular/elements';

export type IgniteComponent<T = any> = NgElementConstructor<T> & {
    tagName: string;
    register: () => void;
};

export function registerComponent(
    component: IgniteComponent,
    ...dependencies: IgniteComponent[]
) {
    for (const dependency of dependencies) {
        dependency.register();
    }

    if (!customElements.get(component.tagName)) {
        customElements.define(component.tagName, component);
    }
}

export function defineComponents(...components: IgniteComponent[]) {
    for (const component of components) {
        component.register();
    }
}
