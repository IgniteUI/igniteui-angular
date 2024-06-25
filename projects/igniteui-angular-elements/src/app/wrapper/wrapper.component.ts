import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, NgModule, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ChildStandaloneComponent } from './child-standalone/child-standalone.component';
import { TemplateRefWrapper } from './template-ref-wrapper';

import { render, TemplateResult } from 'lit-html';

type TemplateFunction = (arg: any) => TemplateResult;
@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class TemplateWrapperComponent {
    @ContentChild(ChildStandaloneComponent)
    public child: ChildStandaloneComponent | Element;

    public templateFunctions: TemplateFunction[] = [];

    /**
     * All template refs
     * Warning: the first is always the root `ngFor` template. TODO(D.P.): filter it out?
     */
    @ViewChildren(TemplateRef)
    public templateRefs: QueryList<TemplateRef<any>>;

    public get childComponent(): ChildStandaloneComponent | Element {
        if (!this.child) {
            const collection = document.getElementsByTagName('app-child-standalone');
            this.child = collection?.length ? collection.item(0) : null;
        }
        return this.child
    }

    constructor(private cdr: ChangeDetectorRef) { }

    public changeChildText() {
      if (this.childComponent) {
        (this.childComponent as ChildStandaloneComponent).text = "Parent modified text.";
      }
    }

    public litRender(container: HTMLElement, templateFunc: (arg: any) => TemplateResult, arg: any) {
        render(templateFunc(arg), container);
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

@NgModule({
    declarations: [
        TemplateWrapperComponent,
        ChildStandaloneComponent
    ],
    exports: [
        TemplateWrapperComponent,
        ChildStandaloneComponent
    ],
    imports: [
      BrowserModule,
      CommonModule
    ]
  })
  export class WrapperModule {}
