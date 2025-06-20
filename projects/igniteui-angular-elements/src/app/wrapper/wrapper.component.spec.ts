import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { html } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';
import { TemplateWrapperComponent } from './wrapper.component';

const directiveLog = [];
class ToLowerAsyncDirective extends AsyncDirective {
    public override render(text: string) {
        directiveLog.push('render');
        return text.toLocaleLowerCase();
    }

    protected override disconnected(): void {
        directiveLog.push('disconnected');
    }
}
export const toLowerAsync = directive(ToLowerAsyncDirective);

@Component({
    template: `<igx-template-wrapper></igx-template-wrapper>`,
    imports: [TemplateWrapperComponent]
})
class TestTemplateWrapperComponent {
    @ViewChild(TemplateWrapperComponent)
    public templateWrapper;

    constructor(public viewContainerRef: ViewContainerRef) { }
}

describe('WrapperComponent', () => {
  let component: TestTemplateWrapperComponent;
  let fixture: ComponentFixture<TestTemplateWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TestTemplateWrapperComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTemplateWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    const context = { text: "Oh hi" };
    const templateRef = component.templateWrapper.addTemplate((ctx) => html`<span id="template1">${ctx.text}</span>`);
    const embeddedView = templateRef.createEmbeddedView(context);
    component.viewContainerRef.insert(embeddedView);
    embeddedView.detectChanges();

    const span = embeddedView.rootNodes[0].querySelector("#template1");
    expect(span).toBeDefined();
    expect(span.textContent).toBe(context.text);
  });


  it('should update connectivity on template with AsyncDirective', () => {
    const context = { text: "OH HI" };
    const templateRef = component.templateWrapper.addTemplate((ctx) => html`<span id="template1">${toLowerAsync(ctx.text)}</span>`);
    const embeddedView = templateRef.createEmbeddedView(context);
    component.viewContainerRef.insert(embeddedView);
    embeddedView.detectChanges();

    const span = embeddedView.rootNodes[0].querySelector("#template1");
    expect(span).toBeDefined();
    expect(span.textContent).toBe(context.text.toLocaleLowerCase());
    expect(directiveLog).toEqual(['render']);

    embeddedView.destroy();
    expect(directiveLog).toEqual(['render', 'disconnected']);
  });
});
