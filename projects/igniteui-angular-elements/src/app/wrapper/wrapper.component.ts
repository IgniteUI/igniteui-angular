import { ChangeDetectorRef, Component, EventEmitter, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { TemplateRefWrapper } from './template-ref-wrapper';

import { render, TemplateResult } from 'lit-html';

type TemplateFunction = (arg: any) => TemplateResult;

@Component({
    selector: 'igx-template-wrapper',
    templateUrl: './wrapper.component.html',
    styleUrls: ['./wrapper.component.scss'],
    imports: []
})
export class TemplateWrapperComponent {

    public templateFunctions: TemplateFunction[] = [];
    public templateRendered = new EventEmitter<any>();

    /**
     * All template refs
     * Warning: the first is always the root `@for` template
     * (internally creates one like the old `<ng-template ngFor` would). TODO(D.P.): filter it out?
     */
    @ViewChildren(TemplateRef)
    public templateRefs: QueryList<TemplateRef<any>>;

    constructor(private cdr: ChangeDetectorRef) { }

    public litRender(container: HTMLElement, templateFunc: (arg: any) => TemplateResult, arg: any) {
        render(templateFunc(arg), container);
        this.templateRendered.emit(container);
    }

    public addTemplate(templateFunc: TemplateFunction): TemplateRef<any> {
        this.templateFunctions.push(templateFunc);
        this.cdr.detectChanges();
        return new TemplateRefWrapper(this.templateRefs.last, templateFunc);
    }

    public getTemplateFunction(templateRef: TemplateRefWrapper<any>): TemplateFunction | undefined {
        if (!templateRef) {
            return;
        }
        const index = this.templateRefs.toArray().indexOf(templateRef.innerTemplateRef);
        return this.templateFunctions[index - 1];
    }
}
