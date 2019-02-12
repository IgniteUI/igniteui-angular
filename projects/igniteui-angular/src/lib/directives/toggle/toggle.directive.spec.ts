import { ChangeDetectionStrategy, Component, DebugElement, EventEmitter, Output, ViewChild, ElementRef, OnInit } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxToggleActionDirective, IgxToggleDirective, IgxToggleModule, IgxOverlayOutletDirective } from './toggle.directive';
import {
    IgxOverlayService, OverlaySettings, ConnectedPositioningStrategy,
    AbsoluteScrollStrategy, AutoPositionStrategy, IPositionStrategy, HorizontalAlignment
} from '../../services';
import { CancelableEventArgs } from '../../core/utils';

import { configureTestSuite } from '../../test-utils/configure-suite';

describe('IgxToggle', () => {
    configureTestSuite();
    const HIDDEN_TOGGLER_CLASS = 'igx-toggle--hidden';
    const TOGGLER_CLASS = 'igx-toggle';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxToggleActionTestComponent,
                IgxToggleOutletComponent,
                IgxToggleServiceInjectComponent,
                IgxOverlayServiceComponent,
                IgxToggleTestComponent,
                TestWithOnPushComponent,
                TestWithThreeToggleActionsComponent
            ],
            imports: [NoopAnimationsModule, IgxToggleModule]
        })
            .compileComponents();
    }));

    it('IgxToggleDirective is defined', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.directive(IgxToggleDirective))).toBeDefined();
        expect(fixture.debugElement.query(By.css('ul'))).toBeDefined();
        expect(fixture.debugElement.queryAll(By.css('li')).length).toBe(4);
    });

    it('verify that initially toggled content is hidden', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();
        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
    });

    it('should show and hide content according \'collapsed\' attribute', () => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
        fixture.componentInstance.toggle.open();
        fixture.detectChanges();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBeTruthy();
    });

    it('should emit \'onOpened\' event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        spyOn(toggle.onOpened, 'emit');
        toggle.open();
        tick();
        fixture.detectChanges();

        expect(toggle.onOpened.emit).toHaveBeenCalled();
    }));

    it('should emit \'onClosed\' event', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        fixture.componentInstance.toggle.open();
        tick();
        fixture.detectChanges();

        spyOn(toggle.onClosed, 'emit');
        toggle.close();
        tick();
        fixture.detectChanges();

        expect(toggle.onClosed.emit).toHaveBeenCalled();
    }));

    it('should propagate IgxOverlay onOpened/onClosed events', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxOverlayServiceComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;
        const overlay = fixture.componentInstance.overlay;
        spyOn(toggle.onOpened, 'emit');
        spyOn(toggle.onClosed, 'emit');

        toggle.open();
        tick();
        expect(toggle.onOpened.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(false);
        toggle.close();
        tick();
        expect(toggle.onClosed.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(true);

        toggle.open();
        tick();
        expect(toggle.onOpened.emit).toHaveBeenCalledTimes(2);
        const otherId = overlay.show(fixture.componentInstance.other);
        overlay.hide(otherId);
        tick();
        expect(toggle.onClosed.emit).toHaveBeenCalledTimes(1);
        expect(toggle.collapsed).toBe(false);
        overlay.hideAll(); // as if outside click
        tick();
        expect(toggle.onClosed.emit).toHaveBeenCalledTimes(2);
        expect(toggle.collapsed).toBe(true);
    }));

    it('should open toggle when IgxToggleActionDirective is clicked and toggle is closed', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();

        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));
        const divEl: DebugElement = fixture.debugElement.query(By.directive(IgxToggleDirective));
        expect(fixture.componentInstance.toggle.collapsed).toBe(true);
        expect(divEl.classes[HIDDEN_TOGGLER_CLASS]).toBe(true);
        button.triggerEventHandler('click', null);
        tick();
        fixture.detectChanges();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classes[TOGGLER_CLASS]).toBe(true);
    }));

    it('should close toggle when IgxToggleActionDirective is clicked and toggle is opened', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();
        fixture.componentInstance.toggle.open();
        tick();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const button: DebugElement = fixture.debugElement.query(By.directive(IgxToggleActionDirective));

        expect(divEl.classList.contains(TOGGLER_CLASS)).toBe(true);

        button.triggerEventHandler('click', null);

        tick();
        fixture.detectChanges();
        expect(divEl.classList.contains(HIDDEN_TOGGLER_CLASS)).toBeTruthy();
    }));

    it('should hide content and emit \'onClosed\' event when you click outside the toggle\'s content', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
        fixture.detectChanges();

        const divEl = fixture.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const toggle = fixture.componentInstance.toggle;
        const p = fixture.debugElement.query(By.css('p'));
        spyOn(toggle.onOpened, 'emit');

        fixture.componentInstance.toggleAction.onClick();
        tick();
        expect(toggle.onOpened.emit).toHaveBeenCalled();

        expect(fixture.componentInstance.toggle.collapsed).toBe(false);
        expect(divEl.classList.contains(TOGGLER_CLASS)).toBe(true);
        spyOn(toggle.onClosed, 'emit');

        p.nativeElement.click();
        tick();
        fixture.detectChanges();

        expect(toggle.onClosed.emit).toHaveBeenCalled();
    }));

    it('Toggle should be registered into navigationService if it is passed through identifier', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleServiceInjectComponent);
        fixture.detectChanges();

        const toggleFromComponent = fixture.componentInstance.toggle;
        const toggleFromService = fixture.componentInstance.toggleAction.target as IgxToggleDirective;

        expect(toggleFromService instanceof IgxToggleDirective).toBe(true);
        expect(toggleFromService.id).toEqual(toggleFromComponent.id);
    }));

    it('Toggle should working with parent component and OnPush strategy applied.', fakeAsync(() => {
        const fix = TestBed.createComponent(TestWithOnPushComponent);
        fix.detectChanges();

        const toggle = fix.componentInstance.toggle;
        const toggleElm = fix.debugElement.query(By.directive(IgxToggleDirective)).nativeElement;
        const button: DebugElement = fix.debugElement.query(By.css('button'));

        spyOn(toggle.onOpened, 'emit');
        spyOn(toggle.onClosed, 'emit');
        button.triggerEventHandler('click', null);

        tick();
        fix.detectChanges();

        expect(toggle.onOpened.emit).toHaveBeenCalled();
        expect(toggleElm.classList.contains(TOGGLER_CLASS)).toBe(true);
        button.triggerEventHandler('click', null);

        tick();
        fix.detectChanges();

        expect(toggle.onClosed.emit).toHaveBeenCalled();
        expect(toggleElm.classList.contains(HIDDEN_TOGGLER_CLASS)).toBe(true);
    }));

    it('fix for #2798 - Allow canceling of open and close of IgxDropDown through onOpening and onClosing events', fakeAsync(() => {
        const fixture = TestBed.createComponent(IgxToggleTestComponent);
        fixture.detectChanges();

        const toggle = fixture.componentInstance.toggle;

        spyOn(toggle.onOpening, 'emit').and.callThrough();
        spyOn(toggle.onOpened, 'emit').and.callThrough();
        spyOn(toggle.onClosing, 'emit').and.callThrough();
        spyOn(toggle.onClosed, 'emit').and.callThrough();

        toggle.onClosing.subscribe((e: CancelableEventArgs) => e.cancel = true);

        toggle.open();
        fixture.detectChanges();
        tick();

        expect(toggle.onOpening.emit).toHaveBeenCalledTimes(1);
        expect(toggle.onOpened.emit).toHaveBeenCalledTimes(1);

        toggle.close();
        fixture.detectChanges();
        tick();

        expect(toggle.onClosing.emit).toHaveBeenCalledTimes(1);
        expect(toggle.onClosed.emit).toHaveBeenCalledTimes(0);

        toggle.onOpening.subscribe((e: CancelableEventArgs) => e.cancel = true);
        toggle.open();
        fixture.detectChanges();
        tick();

        expect(toggle.onOpening.emit).toHaveBeenCalledTimes(2);
        expect(toggle.onOpened.emit).toHaveBeenCalledTimes(1);
    }));

    it('fix for #3636 - ToggleAction should provide its element as target', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestWithThreeToggleActionsComponent);
        fixture.detectChanges();

        let button = fixture.componentInstance.button1.nativeElement;
        button.click();
        tick();
        fixture.detectChanges();

        let toggle = fixture.debugElement.query(By.css('#toggle1'));
        let toggleRect = toggle.nativeElement.getBoundingClientRect();
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));

        button = fixture.componentInstance.button2.nativeElement;
        button.click();
        fixture.detectChanges();

        toggle = fixture.debugElement.query(By.css('#toggle2'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));

        button = fixture.componentInstance.button3.nativeElement;
        button.click();
        tick();
        fixture.detectChanges();

        toggle = fixture.debugElement.query(By.css('#toggle3'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));
    }));

    it('fix for #3636 - All toggles should scroll correctly', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestWithThreeToggleActionsComponent);
        fixture.detectChanges();

        let button = fixture.componentInstance.button1.nativeElement;
        button.click();
        button = fixture.componentInstance.button2.nativeElement;
        button.click();
        button = fixture.componentInstance.button3.nativeElement;
        button.click();
        fixture.detectChanges();
        tick();

        let toggle = fixture.debugElement.query(By.css('#toggle1'));
        let toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button1.nativeElement;
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));

        toggle = fixture.debugElement.query(By.css('#toggle2'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button2.nativeElement;
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));

        toggle = fixture.debugElement.query(By.css('#toggle3'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button3.nativeElement;
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));

        document.documentElement.scrollTop += 100;
        document.dispatchEvent(new Event('scroll'));
        tick();

        toggle = fixture.debugElement.query(By.css('#toggle1'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button1.nativeElement;
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));

        toggle = fixture.debugElement.query(By.css('#toggle2'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button2.nativeElement;
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));

        toggle = fixture.debugElement.query(By.css('#toggle3'));
        toggleRect = toggle.nativeElement.getBoundingClientRect();
        button = fixture.componentInstance.button3.nativeElement;
        expect(Math.round(toggleRect.right)).toBe(Math.round(button.getBoundingClientRect().right));
        expect(Math.round(toggleRect.top)).toBe(Math.round(button.getBoundingClientRect().bottom));
    }));

    describe('overlay settings', () => {
        configureTestSuite();
        it('should pass correct defaults from IgxToggleActionDirective and respect outsideClickClose', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();
            spyOn(IgxToggleDirective.prototype, 'toggle');

            const defaults = /*<OverlaySettings>*/{
                positionStrategy: jasmine.any(ConnectedPositioningStrategy),
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy)
            };

            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(defaults);

            fixture.componentInstance.settings.closeOnOutsideClick = false;
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            defaults.closeOnOutsideClick = false;
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(defaults);
        }));

        it('should pass overlaySettings input from IgxToggleActionDirective and respect outsideClickClose', () => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();
            spyOn(IgxToggleDirective.prototype, 'toggle');

            const settings = /*<OverlaySettings>*/{
                positionStrategy: jasmine.any(ConnectedPositioningStrategy),
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy)
            };

            // defaults
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);

            // override modal and strategy
            fixture.componentInstance.settings.modal = true;
            fixture.componentInstance.settings.positionStrategy = new AutoPositionStrategy();
            settings.modal = true;
            settings.positionStrategy = jasmine.any(AutoPositionStrategy);
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);

            // override close on click
            fixture.componentInstance.settings.closeOnOutsideClick = false;
            settings.closeOnOutsideClick = false;
            fixture.detectChanges();
            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);
        });

        it('should pass input overlaySettings from igxToggleAction and set position target if not provided', () => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();
            const toggleSpy = spyOn(IgxToggleDirective.prototype, 'toggle');
            const button = fixture.debugElement.query(By.directive(IgxToggleActionDirective)).nativeElement;

            const settings = /*<OverlaySettings>*/{
                positionStrategy: jasmine.any(ConnectedPositioningStrategy),
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy)
            };
            fixture.componentInstance.settings.positionStrategy = new ConnectedPositioningStrategy();
            fixture.detectChanges();

            fixture.componentInstance.toggleAction.onClick();
            expect(toggleSpy).toHaveBeenCalledWith(settings);
            let positionStrategy = toggleSpy.calls.mostRecent().args[0].positionStrategy as IPositionStrategy;
            expect(positionStrategy.settings.target).toBe(button);

            fixture.componentInstance.settings.positionStrategy = new ConnectedPositioningStrategy({ target: document.body });
            fixture.detectChanges();

            fixture.componentInstance.toggleAction.onClick();
            positionStrategy = toggleSpy.calls.mostRecent().args[0].positionStrategy as IPositionStrategy;
            expect(positionStrategy.settings.target).toBe(button);
        });

        it('Should fire toggle "onClosing" event when closing through closeOnOutsideClick', fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxToggleActionTestComponent);
            fixture.detectChanges();

            const toggle = fixture.componentInstance.toggle;

            spyOn(toggle, 'toggle').and.callThrough();
            spyOn(toggle.onClosed, 'emit').and.callThrough();
            spyOn(toggle.onClosing, 'emit').and.callThrough();
            spyOn(toggle.onOpening, 'emit').and.callThrough();
            spyOn(toggle.onOpened, 'emit').and.callThrough();

            const button = fixture.debugElement.query(By.css('button')).nativeElement;
            button.click();
            tick();
            fixture.detectChanges();

            expect(toggle.onOpening.emit).toHaveBeenCalledTimes(1);
            expect(toggle.onOpened.emit).toHaveBeenCalledTimes(1);

            document.documentElement.dispatchEvent(new Event('click'));
            tick();
            fixture.detectChanges();

            expect(toggle.onClosing.emit).toHaveBeenCalledTimes(1);
            expect(toggle.onClosed.emit).toHaveBeenCalledTimes(1);
        }));

        it('should pass IgxOverlayOutletDirective input from IgxToggleActionDirective', () => {
            const fixture = TestBed.createComponent(IgxToggleOutletComponent);
            const outlet = fixture.debugElement.query(By.css('.outlet-container')).nativeElement;
            const toggleSpy = spyOn(IgxToggleDirective.prototype, 'toggle');
            fixture.detectChanges();

            const settings = /*<OverlaySettings>*/{
                positionStrategy: jasmine.any(ConnectedPositioningStrategy),
                closeOnOutsideClick: true,
                modal: false,
                scrollStrategy: jasmine.any(AbsoluteScrollStrategy),
                outlet: jasmine.any(IgxOverlayOutletDirective)
            };

            fixture.componentInstance.toggleAction.onClick();
            expect(IgxToggleDirective.prototype.toggle).toHaveBeenCalledWith(settings);
            const directive = toggleSpy.calls.mostRecent().args[0].outlet as IgxOverlayOutletDirective;
            expect(directive.nativeElement).toBe(outlet);
        });
    });
});

@Component({
    template: `
    <div igxToggle #toggleRef="toggle" (onOpen)="open()" (onClose)="close()">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    `
})
export class IgxToggleTestComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    public open() { }
    public close() { }
}
@Component({
    template: `
    <button [igxToggleAction]="toggleRef" [overlaySettings]="settings">Open/Close Toggle</button>
    <div igxToggle #toggleRef="toggle">
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
        <li>4</li>
      </ul>
    </div>
    <p>Test</p>
    `
})
export class IgxToggleActionTestComponent {
    public settings: OverlaySettings = {};
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) public toggleAction: IgxToggleActionDirective;
    constructor() {
        this.settings.closeOnOutsideClick = true;
    }
}

@Component({
    template: `
    <button [igxToggleAction]="toggleRef" [overlaySettings]="{}" [igxToggleOutlet]="outlet"></button>
    <div igxToggle #toggleRef="toggle"></div>
    <div igxOverlayOutlet #outlet="overlay-outlet" class="outlet-container"></div>
    `
})
export class IgxToggleOutletComponent extends IgxToggleActionTestComponent { }

@Component({
    template: `
        <button igxToggleAction="toggleID">Open/Close Toggle</button>
        <div igxToggle id="toggleID">
            <p>Some content</p>
        </div>
    `
})
export class IgxToggleServiceInjectComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(IgxToggleActionDirective) public toggleAction: IgxToggleActionDirective;
}

@Component({
    template: `
        <div igxToggle id="toggleID">
            <p>Some content</p>
        </div>
        <div #other> <p>Some more content</p> </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IgxOverlayServiceComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
    @ViewChild(`other`) public other: ElementRef;
    /**
     *
     */
    constructor(public overlay: IgxOverlayService) { }
}

@Component({
    template: `
        <button igxToggleAction="toggleID">Open/Close Toggle</button>
        <div igxToggle id="toggleID">
            <p>Some content</p>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestWithOnPushComponent {
    @ViewChild(IgxToggleDirective) public toggle: IgxToggleDirective;
}

@Component({
    template: `
        <button #button1 igxToggleAction="toggle1" [overlaySettings]="overlaySettings" style="position:absolute; left: 100px; top: 10%">
            BUTTON 1
        </button>
        <div id="toggle1" igxToggle style="width: 100px; height: 100px;">
            <p>
                Toggle 1
            </p>
        </div>

        <button #button2 igxToggleAction="toggle2" [overlaySettings]="overlaySettings" style="position:absolute; left: 300px; top: 50%">
            BUTTON 2
        </button>
        <div id="toggle2" igxToggle style="width: 100px; height: 100px;">
            <p>
                Toggle 2
            </p>
        </div>

        <button #button3 igxToggleAction="toggle3" [overlaySettings]="overlaySettings" style="position:absolute; left: 500px; top: 110%">
            BUTTON 3
        </button>
        <div id="toggle3" igxToggle style="width: 100px; height: 100px;">
            <p>
                Toggle 3
            </p>
        </div>
    `
})
export class TestWithThreeToggleActionsComponent implements OnInit {
    @ViewChild('button1') public button1: ElementRef;
    @ViewChild('button2') public button2: ElementRef;
    @ViewChild('button3') public button3: ElementRef;

    overlaySettings: OverlaySettings = {};

    ngOnInit(): void {
        this.overlaySettings.positionStrategy = new ConnectedPositioningStrategy({
            horizontalDirection: HorizontalAlignment.Left,
            horizontalStartPoint: HorizontalAlignment.Right
        });
        this.overlaySettings.closeOnOutsideClick = false;
    }
}
