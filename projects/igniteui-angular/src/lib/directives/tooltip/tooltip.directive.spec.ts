import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IgxTooltipModule, IgxTooltipTargetDirective, IgxTooltipDirective,
    ITooltipShowEventArgs, ITooltipHideEventArgs
} from './tooltip.directive';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

const HIDDEN_TOOLTIP_CLASS = 'igx-tooltip--hidden';
const TOOLTIP_CLASS = 'igx-tooltip';

fdescribe('IgxTooltip', () => {
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

    afterEach(() => {
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

        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        unhoverElement(button);
        flush();

        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('verify tooltip default position', fakeAsync(() => {
        hoverElement(button);
        flush();

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
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tooltipTarget.tooltipDisabled = false;
        fix.detectChanges();

        hoverElement(button);
        flush();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip mouse interaction respects showDelay', fakeAsync(() => {
        tooltipTarget.showDelay = 900;
        fix.detectChanges();

        hoverElement(button);

        tick(500);
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(300);
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(100);
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip mouse interaction respects hideDelay', fakeAsync(() => {
        tooltipTarget.hideDelay = 700;
        fix.detectChanges();

        hoverElement(button);
        flush();

        unhoverElement(button);
        tick(400);
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tick(100);
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tick(200);
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('IgxTooltip is shown/hidden when invoking respective API methods', fakeAsync(() => {
        tooltipTarget.showTooltip();
        flush();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipTarget.hideTooltip();
        flush();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('showing tooltip through API respects showDelay', fakeAsync(() => {
        tooltipTarget.showDelay = 400;
        fix.detectChanges();

        tooltipTarget.showTooltip();

        tick(300);
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(100);
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('hiding tooltip through API respects hideDelay', fakeAsync(() => {
        tooltipTarget.hideDelay = 450;
        fix.detectChanges();

        tooltipTarget.showTooltip();
        flush();

        tooltipTarget.hideTooltip();

        tick(400);
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tick(50);
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('IgxTooltip closes and reopens if it was opened through API and then its target is hovered', fakeAsync(() => {
        tooltipTarget.showTooltip();
        flush();

        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        hoverElement(button);

        tick(250);
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(250);
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip closes and reopens if opening it through API multiple times', fakeAsync(() => {
        tooltipTarget.showTooltip();
        tick(500);

        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipTarget.showTooltip();
        tick(250);
        verifyTooltipVisibility(fix, tooltipNativeElement, false);

        tick(250);
        verifyTooltipVisibility(fix, tooltipNativeElement, true);
    }));

    it('IgxTooltip respects the passed overlaySettings', fakeAsync(() => {
        tooltipTarget.showTooltip();
        flush();

        // click button (the button is outside the tooltip, so we can use it for the test)
        UIInteractions.clickElement(button);
        flush();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        tooltipTarget.overlaySettings = /*<OverlaySettings>*/ {
            closeOnOutsideClick: true,
        };
        fix.detectChanges();

        tooltipTarget.showTooltip();
        flush();

        UIInteractions.clickElement(button);
        flush();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    it('IgxTooltip hides on pressing \'escape\' key', fakeAsync(() => {
        tooltipTarget.showTooltip();
        flush();
        verifyTooltipVisibility(fix, tooltipNativeElement, true);

        UIInteractions.simulateKeyDownEvent(document.documentElement, 'Escape');

        flush();
        verifyTooltipVisibility(fix, tooltipNativeElement, false);
    }));

    describe('Tooltip events', () => {
        it('should emit the proper events when hovering/unhovering target', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipShow, 'emit');
            spyOn(tooltipTarget.onTooltipHide, 'emit');

            hoverElement(button);
            expect(tooltipTarget.onTooltipShow.emit).toHaveBeenCalled();
            flush();

            unhoverElement(button);
            expect(tooltipTarget.onTooltipHide.emit).toHaveBeenCalled();
            flush();
        }));

        it('should emit the proper events when showing/hiding tooltip through API', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipShow, 'emit');
            spyOn(tooltipTarget.onTooltipHide, 'emit');

            tooltipTarget.showTooltip();
            expect(tooltipTarget.onTooltipShow.emit).toHaveBeenCalled();
            flush();

            tooltipTarget.hideTooltip();
            expect(tooltipTarget.onTooltipHide.emit).toHaveBeenCalled();
            flush();
        }));

        it('should emit the proper events with correct eventArgs when hover/unhover', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipShow, 'emit');
            spyOn(tooltipTarget.onTooltipHide, 'emit');

            const tooltipShowArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };
            const tooltipHideArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };

            hoverElement(button);
            expect(tooltipTarget.onTooltipShow.emit).toHaveBeenCalledWith(tooltipShowArgs);
            flush();

            unhoverElement(button);
            expect(tooltipTarget.onTooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgs);
            flush();
        }));

        it('should emit the proper events with correct eventArgs when show/hide through API', fakeAsync(() => {
            spyOn(tooltipTarget.onTooltipShow, 'emit');
            spyOn(tooltipTarget.onTooltipHide, 'emit');

            const tooltipShowArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };
            const tooltipHideArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };

            tooltipTarget.showTooltip();
            expect(tooltipTarget.onTooltipShow.emit).toHaveBeenCalledWith(tooltipShowArgs);
            flush();

            tooltipTarget.hideTooltip();
            expect(tooltipTarget.onTooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgs);
            flush();
        }));

        it('should cancel the showing event when hover', fakeAsync(() => {
            fix.componentInstance.cancelShowing = true;

            hoverElement(button);
            flush();

            verifyTooltipVisibility(fix, tooltipNativeElement, false);
        }));

        it('should cancel the hiding event when unhover', fakeAsync(() => {
            fix.componentInstance.cancelHiding = true;

            hoverElement(button);
            flush();

            unhoverElement(button);
            flush();

            verifyTooltipVisibility(fix, tooltipNativeElement, true);
        }));

        it('should cancel the showing event when show through API', fakeAsync(() => {
            fix.componentInstance.cancelShowing = true;

            tooltipTarget.showTooltip();
            flush();

            verifyTooltipVisibility(fix, tooltipNativeElement, false);
        }));

        it('should cancel the hiding event when hide through API', fakeAsync(() => {
            fix.componentInstance.cancelHiding = true;

            tooltipTarget.showTooltip();
            flush();

            tooltipTarget.hideTooltip();
            flush();

            verifyTooltipVisibility(fix, tooltipNativeElement, true);
        }));
    });

    describe('Tooltip touch', () => {
        it('IgxTooltip is shown/hidden when touching/untouching its target', fakeAsync(() => {
            touchElement(button);
            flush();

            verifyTooltipVisibility(fix, tooltipNativeElement, true);

            const dummyDiv = fix.debugElement.query(By.css('.dummyDiv'));
            touchElement(dummyDiv);
            flush();

            verifyTooltipVisibility(fix, tooltipNativeElement, false);
        }));

        it('IgxTooltip is not shown when is disabled and touching its target', fakeAsync(() => {
            tooltipTarget.tooltipDisabled = true;
            fix.detectChanges();

            touchElement(button);
            flush();
            verifyTooltipVisibility(fix, tooltipNativeElement, false);

            tooltipTarget.tooltipDisabled = false;
            fix.detectChanges();

            touchElement(button);
            flush();
            verifyTooltipVisibility(fix, tooltipNativeElement, true);
        }));

        it('IgxTooltip touch interaction respects showDelay', fakeAsync(() => {
            tooltipTarget.showDelay = 900;
            fix.detectChanges();

            touchElement(button);

            tick(500);
            verifyTooltipVisibility(fix, tooltipNativeElement, false);

            tick(300);
            verifyTooltipVisibility(fix, tooltipNativeElement, false);

            tick(100);
            verifyTooltipVisibility(fix, tooltipNativeElement, true);
        }));

        it('IgxTooltip touch interaction respects hideDelay', fakeAsync(() => {
            tooltipTarget.hideDelay = 700;
            fix.detectChanges();

            touchElement(button);
            flush();

            const dummyDiv = fix.debugElement.query(By.css('.dummyDiv'));
            touchElement(dummyDiv);
            tick(400);
            verifyTooltipVisibility(fix, tooltipNativeElement, true);

            tick(100);
            verifyTooltipVisibility(fix, tooltipNativeElement, true);

            tick(200);
            verifyTooltipVisibility(fix, tooltipNativeElement, false);
        }));
    });
});

function hoverElement(element) {
    element.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
}

function unhoverElement(element) {
    element.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));
}

function touchElement(element) {
    element.nativeElement.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
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
        <div class="dummyDiv">dummy div for touch tests</div>
        <button [igxTooltipTarget]="tooltipRef"
                (onTooltipShow)="showing($event)" (onTooltipHide)="hiding($event)">
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
    public cancelShowing = false;
    public cancelHiding = false;

    showing(args: ITooltipShowEventArgs) {
        if (this.cancelShowing) {
            args.cancel = true;
        }
    }

    hiding(args: ITooltipHideEventArgs) {
        if (this.cancelHiding) {
            args.cancel = true;
        }
    }
}
