import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTooltipModule, IgxTooltipTargetDirective, IgxTooltipDirective,
         ITooltipOpeningEventArgs, ITooltipClosingEventArgs } from './tooltip.directive';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

const HIDDEN_TOOLTIP_CLASS = 'igx-tooltip--hidden';
const TOOLTIP_CLASS = 'igx-tooltip';

describe('IgxTooltip', () => {
    let fix;
    let tooltipNativeElement;
    let tooltipTarget: IgxTooltipTargetDirective;
    let button;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTooltipTestComponent
            ],
            imports: [NoopAnimationsModule, IgxTooltipModule]
        }).compileComponents();
        UIInteractions.clearOverlay();
    }));

    beforeEach(async(() => {
        fix = TestBed.createComponent(IgxTooltipTestComponent);
        fix.detectChanges();
        tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
        tooltipTarget = fix.componentInstance.tooltipTarget as IgxTooltipTargetDirective;
        button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
    }));

    afterAll(() => {
        UIInteractions.clearOverlay();
    });

    it('IgxTooltipTargetDirective default values', () => {
        expect(tooltipTarget.showDelay).toBe(500);
        expect(tooltipTarget.hideDelay).toBe(500);
        expect(tooltipTarget.tooltipDisabled).toBe(false);
        expect(tooltipTarget.overlaySettings).toBeUndefined();
    });

    it('IgxTooltipTargetDirective updated values', () => {
        tooltipTarget.showDelay = 740;
        fix.detectChanges();
        expect(tooltipTarget.showDelay).toBe(740);

        tooltipTarget.hideDelay = 725;
        fix.detectChanges();
        expect(tooltipTarget.hideDelay).toBe(725);

        tooltipTarget.tooltipDisabled = true;
        fix.detectChanges();
        expect(tooltipTarget.tooltipDisabled).toBe(true);
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
        tooltipTarget.tooltipDisabled = true;
        fix.detectChanges();

        hoverElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tooltipTarget.tooltipDisabled = false;
        fix.detectChanges();

        hoverElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip mouse interaction respects showDelay', fakeAsync(() => {
        tooltipTarget.showDelay = 900;
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
        tooltipTarget.hideDelay = 700;
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
        tooltipTarget.openTooltip();
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipTarget.closeTooltip();
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('opening tooltip through API respects showDelay', fakeAsync(() => {
        tooltipTarget.showDelay = 400;
        fix.detectChanges();

        tooltipTarget.openTooltip();

        tick(300);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(100);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('closing tooltip through API respects hideDelay', fakeAsync(() => {
        tooltipTarget.hideDelay = 450;
        fix.detectChanges();

        tooltipTarget.openTooltip();
        flush();
        fix.detectChanges();

        tooltipTarget.closeTooltip();

        tick(400);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tick(50);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('IgxTooltip closes and reopens if it was opened through API and then its target is hovered', fakeAsync(() => {
        tooltipTarget.openTooltip();
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
        tooltipTarget.openTooltip();
        tick(500);
        fix.detectChanges();

        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipTarget.openTooltip();
        tick(250);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(250);
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip respects the passed overlaySettings', fakeAsync(() => {
        tooltipTarget.openTooltip();
        flush();
        fix.detectChanges();

        // click button (the button is outside the tooltip, so we can use it for the test)
        UIInteractions.clickElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipTarget.overlaySettings = /*<OverlaySettings>*/ {
            closeOnOutsideClick: true,
        };
        fix.detectChanges();

        tooltipTarget.openTooltip();
        flush();
        fix.detectChanges();

        UIInteractions.clickElement(button);
        flush();
        fix.detectChanges();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    describe('Tooltip events', () => {
        it('should emit the proper events when hovering/unhovering target', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipOpening, 'emit');
            spyOn(tooltipTarget.onTooltipOpened, 'emit');
            spyOn(tooltipTarget.onTooltipClosing, 'emit');
            spyOn(tooltipTarget.onTooltipClosed, 'emit');

            hoverElement(button);
            expect(tooltipTarget.onTooltipOpening.emit).toHaveBeenCalled();
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipOpened.emit).toHaveBeenCalled();

            unhoverElement(button);
            expect(tooltipTarget.onTooltipClosing.emit).toHaveBeenCalled();
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipClosed.emit).toHaveBeenCalled();
        }));

        it('should emit the proper events when opening/closing tooltip through API', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipOpening, 'emit');
            spyOn(tooltipTarget.onTooltipOpened, 'emit');
            spyOn(tooltipTarget.onTooltipClosing, 'emit');
            spyOn(tooltipTarget.onTooltipClosed, 'emit');

            tooltipTarget.openTooltip();
            expect(tooltipTarget.onTooltipOpening.emit).toHaveBeenCalled();
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipOpened.emit).toHaveBeenCalled();

            tooltipTarget.closeTooltip();
            expect(tooltipTarget.onTooltipClosing.emit).toHaveBeenCalled();
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipClosed.emit).toHaveBeenCalled();
        }));

        it('should emit the proper events with correct eventArgs when hover/unhover', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipOpening, 'emit');
            spyOn(tooltipTarget.onTooltipOpened, 'emit');
            spyOn(tooltipTarget.onTooltipClosing, 'emit');
            spyOn(tooltipTarget.onTooltipClosed, 'emit');

            const tooltipOpeningArgs = /* ITooltipOpeningEventArgs */ { tooltip: fix.componentInstance.tooltip, cancel: false };
            const tooltipOpenedArgs = /* ITooltipOpenedEventArgs */ { tooltip: fix.componentInstance.tooltip };
            const tooltipClosingArgs = /* ITooltipClosingEventArgs */ { tooltip: fix.componentInstance.tooltip, cancel: false };
            const tooltipClosedArgs = /* ITooltipClosedEventArgs */ { tooltip: fix.componentInstance.tooltip };

            hoverElement(button);
            expect(tooltipTarget.onTooltipOpening.emit).toHaveBeenCalledWith(tooltipOpeningArgs);
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipOpened.emit).toHaveBeenCalledWith(tooltipOpenedArgs);

            unhoverElement(button);
            expect(tooltipTarget.onTooltipClosing.emit).toHaveBeenCalledWith(tooltipClosingArgs);
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipClosed.emit).toHaveBeenCalledWith(tooltipClosedArgs);
        }));

        it('should emit the proper events with correct eventArgs when open/close through API', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipOpening, 'emit');
            spyOn(tooltipTarget.onTooltipOpened, 'emit');
            spyOn(tooltipTarget.onTooltipClosing, 'emit');
            spyOn(tooltipTarget.onTooltipClosed, 'emit');

            const tooltipOpeningArgs = /* ITooltipOpeningEventArgs */ { tooltip: fix.componentInstance.tooltip, cancel: false };
            const tooltipOpenedArgs = /* ITooltipOpenedEventArgs */ { tooltip: fix.componentInstance.tooltip };
            const tooltipClosingArgs = /* ITooltipClosingEventArgs */ { tooltip: fix.componentInstance.tooltip, cancel: false };
            const tooltipClosedArgs = /* ITooltipClosedEventArgs */ { tooltip: fix.componentInstance.tooltip };

            tooltipTarget.openTooltip();
            expect(tooltipTarget.onTooltipOpening.emit).toHaveBeenCalledWith(tooltipOpeningArgs);
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipOpened.emit).toHaveBeenCalledWith(tooltipOpenedArgs);

            tooltipTarget.closeTooltip();
            expect(tooltipTarget.onTooltipClosing.emit).toHaveBeenCalledWith(tooltipClosingArgs);
            flush();
            fix.detectChanges();
            expect(tooltipTarget.onTooltipClosed.emit).toHaveBeenCalledWith(tooltipClosedArgs);
        }));

        it('should cancel the opening event when hover', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipOpened, 'emit');
            fix.componentInstance.cancelOpening = true;

            hoverElement(button);
            flush();
            fix.detectChanges();

            verifyTooltipVisibility(fix, tooltipNativeElement, false);
            expect(tooltipTarget.onTooltipOpened.emit).not.toHaveBeenCalled();
        }));

        it('should cancel the closing event when unhover', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipClosed, 'emit');
            fix.componentInstance.cancelClosing = true;

            hoverElement(button);
            flush();
            fix.detectChanges();

            unhoverElement(button);
            flush();
            fix.detectChanges();

            verifyTooltipVisibility(fix, tooltipNativeElement, true);
            expect(tooltipTarget.onTooltipClosed.emit).not.toHaveBeenCalled();
        }));

        it('should cancel the opening event when open through API', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipOpened, 'emit');
            fix.componentInstance.cancelOpening = true;

            tooltipTarget.openTooltip();
            flush();
            fix.detectChanges();

            verifyTooltipVisibility(fix, tooltipNativeElement, false);
            expect(tooltipTarget.onTooltipOpened.emit).not.toHaveBeenCalled();
        }));

        it('should cancel the closing event when close through API', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipClosed, 'emit');
            fix.componentInstance.cancelClosing = true;

            tooltipTarget.openTooltip();
            flush();
            fix.detectChanges();

            tooltipTarget.closeTooltip();
            flush();
            fix.detectChanges();

            verifyTooltipVisibility(fix, tooltipNativeElement, true);
            expect(tooltipTarget.onTooltipClosed.emit).not.toHaveBeenCalled();
        }));
    });
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
        expect(fix.componentInstance.tooltipTarget.tooltipHidden).toBe(false);
    } else {
        expect(tooltipNativeElement.classList.contains(TOOLTIP_CLASS)).toBe(false);
        expect(tooltipNativeElement.classList.contains(HIDDEN_TOOLTIP_CLASS)).toBe(true);
        expect(fix.componentInstance.tooltipTarget.tooltipHidden).toBe(true);
    }
}

@Component({
    template: `
        <button [igxTooltipTarget]="tooltipRef"
                (onTooltipOpening)="opening($event)" (onTooltipClosing)="closing($event)">
            Hover me
        </button>
        <div igxTooltip #tooltipRef="tooltip">
            Hello, I am a tooltip!
        </div>
        `
})
export class IgxTooltipTestComponent {
    @ViewChild(IgxTooltipDirective) public tooltip: IgxTooltipDirective;
    @ViewChild(IgxTooltipTargetDirective) public tooltipTarget: IgxTooltipTargetDirective;
    public cancelOpening = false;
    public cancelClosing = false;

    opening(args: ITooltipOpeningEventArgs) {
        if (this.cancelOpening) {
            args.cancel = true;
        }
    }

    closing(args: ITooltipClosingEventArgs) {
        if (this.cancelClosing) {
            args.cancel = true;
        }
    }
}
