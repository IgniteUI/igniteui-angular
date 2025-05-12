import { ComponentFixture, TestBed } from '@angular/core/testing';
import { html } from 'lit-html';
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
});
