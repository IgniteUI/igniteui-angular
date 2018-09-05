import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTooltipModule, IgxTooltipActionDirective, IgxTooltipDirective } from './tooltip.directive';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

const HIDDEN_TOOLTIP_CLASS = 'igx-tooltip--hidden';
const TOOLTIP_CLASS = 'igx-tooltip';

describe('IgxTooltip', () => {
    let fix;
    let tooltipNativeElement;
    let tooltipAction: IgxTooltipActionDirective;
    let button;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTooltipActionTestComponent
            ],
            imports: [NoopAnimationsModule, IgxTooltipModule]
        }).compileComponents();
        UIInteractions.clearOverlay();
    }));

    beforeEach(async(() => {
        fix = TestBed.createComponent(IgxTooltipActionTestComponent);
        fix.detectChanges();
        tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
        tooltipAction = fix.componentInstance.tooltipAction as IgxTooltipActionDirective;
        button = fix.debugElement.query(By.directive(IgxTooltipActionDirective));
    }));

    afterAll(() => {
        UIInteractions.clearOverlay();
    });

    it('IgxTooltipActionDirective default values', () => {
        expect(tooltipAction.showDelay).toBe(500);
        expect(tooltipAction.hideDelay).toBe(500);
        expect(tooltipAction.tooltipDisabled).toBe(false);
        expect(tooltipAction.overlaySettings).toBeUndefined();
    });

    it('IgxTooltipActionDirective updated values', () => {
        tooltipAction.showDelay = 740;
        fix.detectChanges();
        expect(tooltipAction.showDelay).toBe(740);

        tooltipAction.hideDelay = 725;
        fix.detectChanges();
        expect(tooltipAction.hideDelay).toBe(725);

        tooltipAction.tooltipDisabled = true;
        fix.detectChanges();
        expect(tooltipAction.tooltipDisabled).toBe(true);
    });

    it('IgxTooltip is initially hidden', () => {
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    });

    it('IgxTooltip is shown/hidden when hovering/unhovering its target', fakeAsync(() => {
        hoverElement(button);
        flush();
        fix.detectChanges();

        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        unhoverElement(button);
        flush();
        fix.detectChanges();

        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('verify tooltip default position', fakeAsync(() => {
        hoverElement(button);
        flush();
        fix.detectChanges();

        const buttonRect = (<HTMLElement>button.nativeElement).getBoundingClientRect();
        const tooltipRect = (<HTMLElement>tooltipNativeElement).getBoundingClientRect();

        // Horizontally aligned with same center
        const buttonRectMidX = buttonRect.left + buttonRect.width / 2;
        const tooltipRectMidX = tooltipRect.left + tooltipRect.width / 2;
        expect(buttonRectMidX).toBe(tooltipRectMidX, 'tooltip and target are not horizontally aligned with identical center');

        // Tooltip is beneath its target
        expect(buttonRect.bottom).toBe(tooltipRect.top, 'tooltip is not beneath its target');
    }));

    it('IgxTooltip is not shown when is disabled and hovering its target', fakeAsync(() => {
        tooltipAction.tooltipDisabled = true;
        fix.detectChanges();

        hoverElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tooltipAction.tooltipDisabled = false;
        fix.detectChanges();

        hoverElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip mouse interaction respects showDelay', fakeAsync(() => {
        tooltipAction.showDelay = 900;
        fix.detectChanges();

        hoverElement(button);

        tick(500);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(300);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(100);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip mouse interaction respects hideDelay', fakeAsync(() => {
        tooltipAction.hideDelay = 700;
        fix.detectChanges();

        hoverElement(button);
        flush();
        fix.detectChanges();

        unhoverElement(button);
        tick(400);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tick(100);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tick(200);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('IgxTooltip is shown/hidden when invoking openTooltip/closeTooltip methods', fakeAsync(() => {
        tooltipAction.openTooltip();
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipAction.closeTooltip();
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('opening tooltip through API respects showDelay', fakeAsync(() => {
        tooltipAction.showDelay = 400;
        fix.detectChanges();

        tooltipAction.openTooltip();

        tick(300);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(100);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('closing tooltip through API respects hideDelay', fakeAsync(() => {
        tooltipAction.hideDelay = 450;
        fix.detectChanges();

        tooltipAction.openTooltip();
        flush();
        fix.detectChanges();

        tooltipAction.closeTooltip();

        tick(400);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tick(50);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('IgxTooltip closes and reopens if it was opened through API and then its target is hovered', fakeAsync(() => {
        tooltipAction.openTooltip();
        flush();
        fix.detectChanges();

        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        hoverElement(button);

        tick(250);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(250);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip closes and reopens if opening it through API multiple times', fakeAsync(() => {
        tooltipAction.openTooltip();
        tick(500);
        fix.detectChanges();

        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipAction.openTooltip();
        tick(250);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(250);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip respects the passed overlaySettings', fakeAsync(() => {
        tooltipAction.openTooltip();
        flush();
        fix.detectChanges();

        // click button (the button is outside the tooltip, so we can use it for the test)
        UIInteractions.clickElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tooltipAction.overlaySettings = /*<OverlaySettings>*/ {
            closeOnOutsideClick: false,
        };
        fix.detectChanges();

        tooltipAction.openTooltip();
        flush();
        fix.detectChanges();

        UIInteractions.clickElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('should emit the proper events when hovering/unhovering target', fakeAsync(() => {
        spyOn(tooltipAction.onTooltipOpening, 'emit');
        spyOn(tooltipAction.onTooltipOpened, 'emit');
        spyOn(tooltipAction.onTooltipClosing, 'emit');
        spyOn(tooltipAction.onTooltipClosed, 'emit');

        hoverElement(button);
        expect(tooltipAction.onTooltipOpening.emit).toHaveBeenCalled();
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipOpened.emit).toHaveBeenCalled();

        unhoverElement(button);
        expect(tooltipAction.onTooltipClosing.emit).toHaveBeenCalled();
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipClosed.emit).toHaveBeenCalled();
    }));

    it('should emit the proper events when opening/closing tooltip through API', fakeAsync(() => {
        spyOn(tooltipAction.onTooltipOpening, 'emit');
        spyOn(tooltipAction.onTooltipOpened, 'emit');
        spyOn(tooltipAction.onTooltipClosing, 'emit');
        spyOn(tooltipAction.onTooltipClosed, 'emit');

        tooltipAction.openTooltip();
        expect(tooltipAction.onTooltipOpening.emit).toHaveBeenCalled();
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipOpened.emit).toHaveBeenCalled();

        tooltipAction.closeTooltip();
        expect(tooltipAction.onTooltipClosing.emit).toHaveBeenCalled();
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipClosed.emit).toHaveBeenCalled();
    }));

    it('should emit the proper events with correct eventArgs when hover/unhover', fakeAsync(() => {
        spyOn(tooltipAction.onTooltipOpening, 'emit');
        spyOn(tooltipAction.onTooltipOpened, 'emit');
        spyOn(tooltipAction.onTooltipClosing, 'emit');
        spyOn(tooltipAction.onTooltipClosed, 'emit');

        const tooltipArgs = /* ITooltipEventArgs */ { tooltip: fix.componentInstance.tooltip };

        hoverElement(button);
        expect(tooltipAction.onTooltipOpening.emit).toHaveBeenCalledWith(tooltipArgs);
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipOpened.emit).toHaveBeenCalledWith(tooltipArgs);

        unhoverElement(button);
        expect(tooltipAction.onTooltipClosing.emit).toHaveBeenCalledWith(tooltipArgs);
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipClosed.emit).toHaveBeenCalledWith(tooltipArgs);
    }));

    it('should emit the proper events with correct eventArgs when open/close through API', fakeAsync(() => {
        spyOn(tooltipAction.onTooltipOpening, 'emit');
        spyOn(tooltipAction.onTooltipOpened, 'emit');
        spyOn(tooltipAction.onTooltipClosing, 'emit');
        spyOn(tooltipAction.onTooltipClosed, 'emit');

        const tooltipArgs = /* ITooltipEventArgs */ { tooltip: fix.componentInstance.tooltip };

        tooltipAction.openTooltip();
        expect(tooltipAction.onTooltipOpening.emit).toHaveBeenCalledWith(tooltipArgs);
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipOpened.emit).toHaveBeenCalledWith(tooltipArgs);

        tooltipAction.closeTooltip();
        expect(tooltipAction.onTooltipClosing.emit).toHaveBeenCalledWith(tooltipArgs);
        flush();
        fix.detectChanges();
        expect(tooltipAction.onTooltipClosed.emit).toHaveBeenCalledWith(tooltipArgs);
    }));
});

function hoverElement(element) {
    element.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
}

function unhoverElement(element) {
    element.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
}

function verifyTooltipVisibility(fix, tooltipNativeElement, shouldBeVisible: boolean) {
    if (shouldBeVisible) {
        expect(tooltipNativeElement.classList.contains(TOOLTIP_CLASS)).toBe(true);
        expect(tooltipNativeElement.classList.contains(HIDDEN_TOOLTIP_CLASS)).toBe(false);
        expect(fix.componentInstance.tooltipAction.tooltipHidden).toBe(false);
    } else {
        expect(tooltipNativeElement.classList.contains(TOOLTIP_CLASS)).toBe(false);
        expect(tooltipNativeElement.classList.contains(HIDDEN_TOOLTIP_CLASS)).toBe(true);
        expect(fix.componentInstance.tooltipAction.tooltipHidden).toBe(true);
    }
}

@Component({
    template: `
        <button [igxTooltipAction]="tooltipRef">Hover me</button>
        <div igxTooltip #tooltipRef="tooltip">
            Hello, I am a tooltip!
        </div>
        `
})
export class IgxTooltipActionTestComponent {
    @ViewChild(IgxTooltipDirective) public tooltip: IgxTooltipDirective;
    @ViewChild(IgxTooltipActionDirective) public tooltipAction: IgxTooltipActionDirective;
}
