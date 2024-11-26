import { IgxActionStripComponent, IgxActionStripMenuItemDirective } from './action-strip.component';
import { Component, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { configureTestSuite } from '../test-utils/configure-suite';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { wait } from '../test-utils/ui-interactions.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxIconComponent } from '../icon/icon.component';

const ACTION_STRIP_CONTAINER_CSS = 'igx-action-strip__actions';
const DROP_DOWN_LIST = 'igx-drop-down__list';

describe('igxActionStrip', () => {
    let fixture;
    let actionStrip: IgxActionStripComponent;
    let actionStripElement: ElementRef;
    let parentContainer: ElementRef;
    let innerContainer: ViewContainerRef;

    configureTestSuite(() => {
        return TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxActionStripComponent,
                IgxActionStripTestingComponent,
                IgxActionStripMenuTestingComponent,
                IgxActionStripCombinedMenuTestingComponent
            ]
        });
    });

    describe('Unit tests: ', () => {

        it('should properly show and hide using API', () => {
            fixture = TestBed.createComponent(IgxActionStripComponent);
            actionStrip = fixture.componentInstance as IgxActionStripComponent;
            fixture.detectChanges();

            const el = document.createElement('div');
            fixture.debugElement.nativeElement.appendChild(el);
            actionStrip.show(el);
            expect(actionStrip.hidden).toBeFalsy();
            expect(actionStrip.context).toBe(el);
            actionStrip.hide();
            expect(actionStrip.hidden).toBeTruthy();
            fixture.debugElement.nativeElement.removeChild(el);
        });

    });

    describe('Initialization and rendering tests: ', () => {

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxActionStripTestingComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            actionStripElement = fixture.componentInstance.actionStripElement;
            parentContainer = fixture.componentInstance.parentContainer;
            innerContainer = fixture.componentInstance.innerContainer;
        });

        it('should be overlapping its parent container when no context is applied', () => {
            const parentBoundingRect = parentContainer.nativeElement.getBoundingClientRect();
            const actionStripBoundingRect = actionStripElement.nativeElement.getBoundingClientRect();
            expect(parentBoundingRect.top).toBe(actionStripBoundingRect.top);
            expect(parentBoundingRect.bottom).toBe(actionStripBoundingRect.bottom);
            expect(parentBoundingRect.left).toBe(actionStripBoundingRect.left);
            expect(parentBoundingRect.right).toBe(actionStripBoundingRect.right);
        });

        it('should be overlapping context.element when context is applied', () => {
            actionStrip.show(innerContainer);
            fixture.detectChanges();
            const innerBoundingRect = innerContainer.element.nativeElement.getBoundingClientRect();
            const actionStripBoundingRect = actionStripElement.nativeElement.getBoundingClientRect();
            expect(innerBoundingRect.top).toBe(actionStripBoundingRect.top);
            expect(innerBoundingRect.bottom).toBe(actionStripBoundingRect.bottom);
            expect(innerBoundingRect.left).toBe(actionStripBoundingRect.left);
            expect(innerBoundingRect.right).toBe(actionStripBoundingRect.right);
        });

        it('should allow interacting with the content elements', () => {
            const asIcon = fixture.debugElement.query(By.css('.asIcon'));
            asIcon.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            expect(fixture.componentInstance.flag).toBeTruthy();
        });

        it('should not display the action strip when setting it hidden', () => {
            actionStrip.hidden = true;
            fixture.detectChanges();
            const asQuery = fixture.debugElement.query(By.css('igx-action-strip'));
            expect(asQuery.nativeElement.style.display).toBe('none');
        });
    });

    describe('render content as menu', () => {

        it('should render tree-dot button which toggles the content as menu', () => {
            fixture = TestBed.createComponent(IgxActionStripMenuTestingComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            const actionStripContainer = fixture.debugElement.query(By.css(`.${ACTION_STRIP_CONTAINER_CSS}`));
            // there should be one rendered child and one hidden dropdown
            expect(actionStripContainer.nativeElement.children.length).toBe(2);
            let dropDownList = fixture.debugElement.query(By.css(`.${DROP_DOWN_LIST}`));
            expect(dropDownList.nativeElement.getAttribute('aria-hidden')).toBe('true');
            const icon = fixture.debugElement.query(By.css(`igx-icon`));
            icon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            dropDownList = fixture.debugElement.query(By.css(`.${DROP_DOWN_LIST}`));
            expect(dropDownList.nativeElement.getAttribute('aria-hidden')).toBe('false');
            const dropDownItems = dropDownList.queryAll(By.css('igx-drop-down-item'));
            expect(dropDownItems.length).toBe(3);
        });

        it('should emit onMenuOpen/onMenuOpening when toggling the menu', () => {
            pending('implementation');
        });

        it('should allow combining content outside and inside the menu', () => {
            fixture = TestBed.createComponent(IgxActionStripCombinedMenuTestingComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            const actionStripContainer = fixture.debugElement.query(By.css(`.${ACTION_STRIP_CONTAINER_CSS}`));
            // there should be one rendered child and one hidden dropdown and one additional icon
            expect(actionStripContainer.nativeElement.children.length).toBe(3);
            let dropDownList = fixture.debugElement.query(By.css(`.${DROP_DOWN_LIST}`));
            expect(dropDownList.nativeElement.getAttribute('aria-hidden')).toBe('true');
            const icon = fixture.debugElement.query(By.css(`igx-icon`));
            icon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            dropDownList = fixture.debugElement.query(By.css(`.${DROP_DOWN_LIST}`));
            expect(dropDownList.nativeElement.getAttribute('aria-hidden')).toBe('false');
            const dropDownItems = dropDownList.queryAll(By.css('igx-drop-down-item'));
            expect(dropDownItems.length).toBe(2);
        });

        it('should close the menu when hiding action strip', async () => {
            fixture = TestBed.createComponent(IgxActionStripCombinedMenuTestingComponent);
            fixture.detectChanges();
            actionStrip = fixture.componentInstance.actionStrip;
            // there should be one rendered child and one hidden dropdown and one additional icon
            const icon = fixture.debugElement.query(By.css(`igx-icon`));
            icon.parent.triggerEventHandler('click', new Event('click'));
            fixture.detectChanges();
            let dropDownList = fixture.debugElement.query(By.css(`.${DROP_DOWN_LIST}`));
            expect(dropDownList.nativeElement.getAttribute('aria-hidden')).toBe('false');
            actionStrip.hide();
            await wait();
            fixture.detectChanges();
            dropDownList = fixture.debugElement.query(By.css(`.${DROP_DOWN_LIST}`));
            expect(dropDownList.nativeElement.getAttribute('aria-hidden')).toBe('true');
        });
    });
});

@Component({
    template: `
    <div #parent style="position:relative; height: 200px; width: 400px;">
        <div #inner style="position:relative; height: 100px; width: 200px;">
            <p>
                Lorem ipsum dolor sit
            </p>
        </div>
        <igx-action-strip #actionStrip>
            <igx-icon class="asIcon" (click)="onIconClick()">alarm</igx-icon>
        </igx-action-strip>
    </div>
    `,
    imports: [IgxActionStripComponent, IgxIconComponent]
})
class IgxActionStripTestingComponent {
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;

    @ViewChild('actionStrip', { read: ElementRef, static: true })
    public actionStripElement: ElementRef;

    @ViewChild('parent', { static: true })
    public parentContainer: ElementRef;

    @ViewChild('inner', { read: ViewContainerRef, static: true })
    public innerContainer: ViewContainerRef;

    public flag = false;

    public onIconClick() {
        this.flag = true;
    }
}

@Component({
    template: `
    <div #parent style="position:relative; height: 200px; width: 400px;">
        <div>
            <p>
                Lorem ipsum dolor sit
            </p>
        </div>
        <igx-action-strip #actionStrip>
            <span *igxActionStripMenuItem>Mark</span>
            <span *igxActionStripMenuItem>Favorite</span>
            <span *igxActionStripMenuItem>Download</span>
        </igx-action-strip>
    </div>
    `,
    imports: [IgxActionStripComponent, IgxActionStripMenuItemDirective]
})
class IgxActionStripMenuTestingComponent {
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;
}

@Component({
    template: `
    <div #parent style="position:relative; height: 200px; width: 400px;">
        <div>
            <p>
                Lorem ipsum dolor sit
            </p>
        </div>
        <igx-action-strip #actionStrip>
            <span>Mark</span>
            <span *igxActionStripMenuItem>Favorite</span>
            <span *igxActionStripMenuItem>Download</span>
        </igx-action-strip>
    </div>
    `,
    imports: [IgxActionStripComponent, IgxActionStripMenuItemDirective]
})
class IgxActionStripCombinedMenuTestingComponent {
    @ViewChild('actionStrip', { read: IgxActionStripComponent, static: true })
    public actionStrip: IgxActionStripComponent;
}
