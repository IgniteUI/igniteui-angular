import { ChangeDetectorRef, Component, QueryList, TemplateRef, ViewChildren, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { TemplateRefWrapper } from './template-ref-wrapper';

import { render, type RootPart, type TemplateResult } from 'lit';

type TemplateFunction = (arg: any) => TemplateResult;

@Component({
    selector: 'igx-template-wrapper',
    templateUrl: './wrapper.component.html',
    styleUrls: ['./wrapper.component.scss'],
    imports: []
})
export class TemplateWrapperComponent {
    private cdr = inject(ChangeDetectorRef);


    public templateFunctions: TemplateFunction[] = [];
    public templateRendered = new Subject<HTMLElement>();
    private childParts: WeakMap<HTMLElement, RootPart> = new WeakMap();

    /**
     * All template refs
     * Warning: the first is always the root `@for` template
     * (internally creates one like the old `<ng-template ngFor` would). TODO(D.P.): filter it out?
     */
    @ViewChildren(TemplateRef)
    public templateRefs: QueryList<TemplateRef<any>>;
  
    protected litRender(container: HTMLElement, templateFunc: (arg: any) => TemplateResult, arg: any) {
        const part = render(templateFunc(arg), container);

        let existingPart = this.childParts.get(container);
        if (existingPart && existingPart !== part) {
            // should be just one per container, this might be redundant
            this.embeddedViewDestroyCallback(container);
            existingPart = undefined;
        }
        if (!existingPart) {
            this.childParts.set(container, part);
        }
        this.templateRendered.next(container);
    }

    public addTemplate(templateFunc: TemplateFunction): TemplateRef<any> {
        this.templateFunctions.push(templateFunc);
        this.cdr.detectChanges();
        return new TemplateRefWrapper(this.templateRefs.last, templateFunc, this.embeddedViewDestroyCallback);
    }

    public getTemplateFunction(templateRef: TemplateRefWrapper<any>): TemplateFunction | undefined {
        if (!templateRef) {
            return;
        }
        const index = this.templateRefs.toArray().indexOf(templateRef.innerTemplateRef);
        return this.templateFunctions[index - 1];
    }

    /**
     * Set connectivity on RootPart produced by {@link https://lit.dev/docs/api/templates/#render render()}
     * when Angular destroys the owning EmbeddedView.
     *
     * Required for any `AsyncDirective` in the template result, as those rely on the part to trigger
     * the lifecycle hooks like `disconnected`, and is the "responsibility of the caller to `render`".
     * @see {@link https://lit.dev/docs/api/misc/#RootPart} Details section.
     */
    protected embeddedViewDestroyCallback = (container: HTMLElement) => {
        if (container && this.childParts.has(container)) {
            this.childParts.get(container).setConnected(false);
            this.childParts.delete(container);
        }
    }
}
