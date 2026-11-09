import { ComponentFixture, TestBed } from '@angular/core/testing';
import { html } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';
import { TemplateWrapperComponent } from './wrapper.component';
import { TemplateRefWrapper } from './template-ref-wrapper';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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

describe('WrapperComponent', () => {
  let component: TemplateWrapperComponent;
  let fixture: ComponentFixture<TemplateWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TemplateWrapperComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render template', () => {
    const context = { text: "Oh hi" };
    const templateRef = component.addTemplate((ctx) => html`<span id="template1">${ctx.text}</span>`);
    const embeddedView = templateRef.createEmbeddedView(context);
    embeddedView.detectChanges();

    const span = embeddedView.rootNodes[0].querySelector("#template1");
    expect(span).toBeDefined();
    expect(span.textContent).toBe(context.text);
  });


  it('should update connectivity on template with AsyncDirective', () => {
    const context = { text: "OH HI" };
    const templateRef = component.addTemplate((ctx) => html`<span id="template1">${toLowerAsync(ctx.text)}</span>`);
    const embeddedView = templateRef.createEmbeddedView(context);
    embeddedView.detectChanges();

    const span = embeddedView.rootNodes[0].querySelector("#template1");
    expect(span).toBeDefined();
    expect(span.textContent).toBe(context.text.toLocaleLowerCase());
    expect(directiveLog).toEqual(['render']);

    embeddedView.destroy();
    expect(directiveLog).toEqual(['render', 'disconnected']);
  });

  it('should expose the context through a proxy with implicit and context props', () => {
    let templateContext: any;
    const context = { $implicit: 'implicit value', text: 'text value' };
    const templateRef = component.addTemplate((ctx) => {
      templateContext = ctx;
      return html`<span>${ctx.implicit}</span>`;
    });
    const embeddedView = templateRef.createEmbeddedView(context);
    embeddedView.detectChanges();

    expect(templateContext.implicit).toBe('implicit value');
    expect(templateContext.text).toBe('text value');
    expect(templateContext.context).toBe(templateContext);
    expect('implicit' in templateContext).toBe(true);
    expect('text' in templateContext).toBe(false);
    // not bridged, so the bridge props are not handled:
    expect(templateContext.___contentId).toBeUndefined();
    expect(templateContext.___immediate).toBeUndefined();
    expect(embeddedView.rootNodes[0].textContent).toBe('implicit value');
  });

  it('should init and teardown bridged templates with their content context', () => {
    let templateContext: any;
    const templateFunc: any = (ctx) => {
      templateContext = ctx;
      return html`<span>Bridged</span>`;
    };
    templateFunc.___isBridged = true;
    templateFunc.___onTemplateInit = vi.fn();
    templateFunc.___onTemplateTeardown = vi.fn();

    const templateRef = component.addTemplate(templateFunc);
    const embeddedView = templateRef.createEmbeddedView({});
    const root = embeddedView.rootNodes[0];

    expect(templateFunc.___onTemplateInit).toHaveBeenCalledTimes(1);
    const [initFunc, initRoot, contentContext] = templateFunc.___onTemplateInit.mock.calls[0];
    expect(initFunc).toBe(templateFunc);
    expect(initRoot).toBe(root);
    expect(contentContext.root).toBe(root);
    expect(contentContext.templateFunction).toBe(templateFunc);
    expect(contentContext._id).toBeTruthy();
    expect(root._id).toBe(contentContext._id);
    expect((templateRef as any)._contentContext.get(contentContext._id)).toBe(contentContext);

    embeddedView.detectChanges();
    expect(templateContext.___contentId).toBe(contentContext._id);
    expect(templateContext.___immediate).toBe(true);
    expect(templateContext.___root).toBe(root);

    embeddedView.destroy();
    expect(templateFunc.___onTemplateTeardown).toHaveBeenCalledExactlyOnceWith(templateFunc, root, contentContext);
    expect((templateRef as any)._contentContext.size).toBe(0);
  });

  it('should expose the inner template elementRef and ssrId', () => {
    const templateRef = component.addTemplate(() => html``) as TemplateRefWrapper<any>;

    expect(templateRef.elementRef).toBe(templateRef.innerTemplateRef.elementRef);
    expect(templateRef.ssrId).toBe((templateRef.innerTemplateRef as any).ssrId);
  });

  it('should resolve the template function from a wrapped template ref', () => {
    const first = () => html`<span>1</span>`;
    const second = () => html`<span>2</span>`;
    const firstRef = component.addTemplate(first) as TemplateRefWrapper<any>;
    const secondRef = component.addTemplate(second) as TemplateRefWrapper<any>;

    expect(component.getTemplateFunction(firstRef)).toBe(first);
    expect(component.getTemplateFunction(secondRef)).toBe(second);
    expect(component.getTemplateFunction(null)).toBeUndefined();
  });

  it('should emit templateRendered with the template container', () => {
    const rendered: HTMLElement[] = [];
    component.templateRendered.subscribe(container => rendered.push(container));
    const templateRef = component.addTemplate(() => html`<span>Rendered</span>`);
    const embeddedView = templateRef.createEmbeddedView({});
    embeddedView.detectChanges();

    expect(rendered).toEqual([embeddedView.rootNodes[0]]);
    expect(rendered[0].textContent).toBe('Rendered');
  });
});
