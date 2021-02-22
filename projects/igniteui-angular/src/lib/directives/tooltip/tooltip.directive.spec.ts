import { fakeAsync, TestBed, tick, flush, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTooltipModule, IgxTooltipTargetDirective, IgxTooltipDirective } from './tooltip.directive';
import { IgxTooltipSingleTargetComponent, IgxTooltipMultipleTargetsComponent } from '../../test-utils/tooltip-components.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { HorizontalAlignment, VerticalAlignment, AutoPositionStrategy } from '../../services/public_api';

const HIDDEN_TOOLTIP_CLASS = 'igx-tooltip--hidden';
const TOOLTIP_CLASS = 'igx-tooltip--desktop';

describe('IgxTooltip', () => {
    configureTestSuite();
    let fix;
    let tooltipNativeElement;
    let tooltipTarget: IgxTooltipTargetDirective;
    let button;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxTooltipSingleTargetComponent,
                IgxTooltipMultipleTargetsComponent
            ],
            imports: [NoopAnimationsModule, IgxTooltipModule]
        }).compileComponents();
        UIInteractions.clearOverlay();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('Single target with single tooltip', () => {
        // configureTestSuite();
        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTooltipSingleTargetComponent);
            fix.detectChanges();
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
            tooltipTarget = fix.componentInstance.tooltipTarget as IgxTooltipTargetDirective;
            button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
        }));

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
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('IgxTooltip is shown/hidden when hovering/unhovering its target', fakeAsync(() => {
            hoverElement(button);
            flush();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            unhoverElement(button);
            flush();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        }));

        it('verify tooltip default position', fakeAsync(() => {
            hoverElement(button);
            flush();
            verifyTooltipPosition(tooltipNativeElement, button, true);
        }));

        it('IgxTooltip is not shown when is disabled and hovering its target', fakeAsync(() => {
            tooltipTarget.tooltipDisabled = true;
            fix.detectChanges();

            hoverElement(button);
            flush();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            tooltipTarget.tooltipDisabled = false;
            fix.detectChanges();

            hoverElement(button);
            flush();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        }));

        it('IgxTooltip mouse interaction respects showDelay', fakeAsync(() => {
            tooltipTarget.showDelay = 900;
            fix.detectChanges();

            hoverElement(button);

            tick(500);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            tick(300);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            tick(100);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        }));

        it('IgxTooltip mouse interaction respects hideDelay', fakeAsync(() => {
            tooltipTarget.hideDelay = 700;
            fix.detectChanges();

            hoverElement(button);
            flush();

            unhoverElement(button);
            tick(400);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            tick(100);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            tick(200);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        }));

        it('IgxTooltip is shown/hidden when invoking respective API methods', fakeAsync(() => {
            tooltipTarget.showTooltip();
            flush();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            tooltipTarget.hideTooltip();
            flush();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        }));

        it('showing tooltip through API respects showDelay', fakeAsync(() => {
            tooltipTarget.showDelay = 400;
            fix.detectChanges();

            tooltipTarget.showTooltip();

            tick(300);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            tick(100);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        }));

        it('hiding tooltip through API respects hideDelay', fakeAsync(() => {
            tooltipTarget.hideDelay = 450;
            fix.detectChanges();

            tooltipTarget.showTooltip();
            flush();

            tooltipTarget.hideTooltip();

            tick(400);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            tick(50);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        }));

        it('IgxTooltip closes and reopens if it was opened through API and then its target is hovered', fakeAsync(() => {
            tooltipTarget.showTooltip();
            flush();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            hoverElement(button);

            tick(250);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            tick(250);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        }));

        it('IgxTooltip closes and reopens if opening it through API multiple times', fakeAsync(() => {
            tooltipTarget.showTooltip();
            tick(500);

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            tooltipTarget.showTooltip();
            tick(250);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            tick(250);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        }));

        it('IgxTooltip respects the passed overlaySettings', fakeAsync(() => {
            // Hover the button.
            hoverElement(button);
            flush();
            // Verify default position of the tooltip.
            verifyTooltipPosition(tooltipNativeElement, button, true);
            unhoverElement(button);
            flush();

            // Use custom overlaySettings.
            tooltipTarget.overlaySettings = /*<OverlaySettings>*/ {
                target: tooltipTarget.nativeElement,
                positionStrategy: new AutoPositionStrategy({
                    horizontalStartPoint: HorizontalAlignment.Right,
                    verticalStartPoint: VerticalAlignment.Bottom,
                    horizontalDirection: HorizontalAlignment.Right,
                    verticalDirection: VerticalAlignment.Bottom
                })
            };
            fix.detectChanges();

            // Hover the button again.
            hoverElement(button);
            flush();
            // Verify that the position of the tooltip is changed.
            verifyTooltipPosition(tooltipNativeElement, button, false);
            const targetRect = tooltipTarget.nativeElement.getBoundingClientRect();
            const tooltipRect = tooltipNativeElement.getBoundingClientRect();
            expect(Math.abs(tooltipRect.top - targetRect.bottom) <= 0.5).toBe(true);
            expect(Math.abs(tooltipRect.left - targetRect.right) <= 0.5).toBe(true);
            unhoverElement(button);
            flush();
        }));

        it('IgxTooltip closes when the target is clicked', fakeAsync(() => {
            hoverElement(button);
            flush();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            UIInteractions.simulateClickAndSelectEvent(button);
            flush();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        }));

        it('IgxTooltip hides on pressing \'escape\' key', fakeAsync(() => {
            tooltipTarget.showTooltip();
            flush();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document.documentElement);

            flush();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        }));

        describe('Tooltip events', () => {
        // configureTestSuite();
            it('should emit the proper events when hovering/unhovering target', fakeAsync(() => {
                spyOn(tooltipTarget.tooltipShow, 'emit');
                spyOn(tooltipTarget.tooltipHide, 'emit');

                hoverElement(button);
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalled();
                flush();

                unhoverElement(button);
                tick(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalled();
                flush();
            }));

            it('should emit the proper events when showing/hiding tooltip through API', fakeAsync(() => {
                spyOn(tooltipTarget.tooltipShow, 'emit');
                spyOn(tooltipTarget.tooltipHide, 'emit');

                tooltipTarget.showTooltip();
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalled();
                flush();

                tooltipTarget.hideTooltip();
                tick(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalled();
                flush();
            }));

            it('should emit the proper events with correct eventArgs when hover/unhover', fakeAsync(() => {
                spyOn(tooltipTarget.tooltipShow, 'emit');
                spyOn(tooltipTarget.tooltipHide, 'emit');

                const tooltipShowArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };
                const tooltipHideArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };

                hoverElement(button);
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalledWith(tooltipShowArgs);
                flush();

                unhoverElement(button);
                tick(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgs);
                flush();
            }));

            it('should emit the proper events with correct eventArgs when show/hide through API', fakeAsync(() => {
                spyOn(tooltipTarget.tooltipShow, 'emit');
                spyOn(tooltipTarget.tooltipHide, 'emit');

                const tooltipShowArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };
                const tooltipHideArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };

                tooltipTarget.showTooltip();
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalledWith(tooltipShowArgs);
                flush();

                tooltipTarget.hideTooltip();
                tick(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgs);
                flush();
            }));

            it('should cancel the showing event when hover', fakeAsync(() => {
                fix.componentInstance.cancelShowing = true;

                hoverElement(button);
                flush();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            }));

            it('should cancel the hiding event when unhover', fakeAsync(() => {
                fix.componentInstance.cancelHiding = true;

                hoverElement(button);
                flush();

                unhoverElement(button);
                flush();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            }));

            it('should cancel the showing event when show through API', fakeAsync(() => {
                fix.componentInstance.cancelShowing = true;

                tooltipTarget.showTooltip();
                flush();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            }));

            it('should cancel the hiding event when hide through API', fakeAsync(() => {
                fix.componentInstance.cancelHiding = true;

                tooltipTarget.showTooltip();
                flush();

                tooltipTarget.hideTooltip();
                flush();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            }));
        });

        describe('Tooltip touch', () => {
        // configureTestSuite();
            it('IgxTooltip is shown/hidden when touching/untouching its target', fakeAsync(() => {
                touchElement(button);
                flush();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                const dummyDiv = fix.debugElement.query(By.css('.dummyDiv'));
                touchElement(dummyDiv);
                flush();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            }));

            it('IgxTooltip is not shown when is disabled and touching its target', fakeAsync(() => {
                tooltipTarget.tooltipDisabled = true;
                fix.detectChanges();

                touchElement(button);
                flush();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                tooltipTarget.tooltipDisabled = false;
                fix.detectChanges();

                touchElement(button);
                flush();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            }));

            it('IgxTooltip touch interaction respects showDelay', fakeAsync(() => {
                tooltipTarget.showDelay = 900;
                fix.detectChanges();

                touchElement(button);

                tick(500);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                tick(300);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                tick(100);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            }));

            it('IgxTooltip touch interaction respects hideDelay', fakeAsync(() => {
                tooltipTarget.hideDelay = 700;
                fix.detectChanges();

                touchElement(button);
                flush();

                const dummyDiv = fix.debugElement.query(By.css('.dummyDiv'));
                touchElement(dummyDiv);
                tick(400);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                tick(100);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                tick(200);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            }));
        });
    });

    describe('Multiple targets with single tooltip', () => {
        // configureTestSuite();
        let targetOne: IgxTooltipTargetDirective;
        let targetTwo: IgxTooltipTargetDirective;
        let buttonOne;
        let buttonTwo;

        beforeEach(waitForAsync(() => {
            fix = TestBed.createComponent(IgxTooltipMultipleTargetsComponent);
            fix.detectChanges();
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
            targetOne = fix.componentInstance.targetOne as IgxTooltipTargetDirective;
            targetTwo = fix.componentInstance.targetTwo as IgxTooltipTargetDirective;
            buttonOne = fix.debugElement.query(By.css('.buttonOne'));
            buttonTwo = fix.debugElement.query(By.css('.buttonTwo'));
        }));

        it('Same tooltip shows on different targets depending on which target is hovered', fakeAsync(() => {
            hoverElement(buttonOne);
            flush();

            // Tooltip is positioned relative to buttonOne and NOT relative to buttonTwo
            verifyTooltipVisibility(tooltipNativeElement, targetOne, true);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo, false);

            unhoverElement(buttonOne);
            flush();
            hoverElement(buttonTwo);
            flush();

            // Tooltip is positioned relative to buttonTwo and NOT relative to buttonOne
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);
        }));

        it('Same tooltip shows on a second target when hovering it without closing from first target\'s logic', fakeAsync(() => {
            targetOne.hideDelay = 700;
            fix.detectChanges();

            hoverElement(buttonOne);
            flush();

            unhoverElement(buttonOne);
            tick(300);
            hoverElement(buttonTwo);
            tick(500);

            // Tooltip is visible and positioned relative to buttonTwo
            // and it was not closed due to buttonOne mouseLeave logic.
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);
            flush();
        }));

        it('Hovering first target briefly and then hovering second target leads to tooltip showing for second target', fakeAsync(() => {
            targetOne.showDelay = 600;
            fix.detectChanges();

            hoverElement(buttonOne);
            tick(400);

            verifyTooltipVisibility(tooltipNativeElement, targetOne, false);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);

            unhoverElement(buttonOne);
            tick(100);

            hoverElement(buttonTwo);
            flush();

            // Tooltip is visible and positioned relative to buttonTwo
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo, true);
            // Tooltip is NOT visible and positioned relative to buttonOne
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);
        }));
    });
});

const hoverElement = (element) => element.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));

const unhoverElement = (element) => element.nativeElement.dispatchEvent(new MouseEvent('mouseleave'));

const touchElement = (element) => element.nativeElement.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

const verifyTooltipVisibility = (tooltipNativeElement, tooltipTarget, shouldBeVisible: boolean) => {
    if (shouldBeVisible) {
        expect(tooltipNativeElement.classList.contains(TOOLTIP_CLASS)).toBe(true);
        expect(tooltipNativeElement.classList.contains(HIDDEN_TOOLTIP_CLASS)).toBe(false);
        expect(tooltipTarget.tooltipHidden).toBe(false);
    } else {
        expect(tooltipNativeElement.classList.contains(TOOLTIP_CLASS)).toBe(false);
        expect(tooltipNativeElement.classList.contains(HIDDEN_TOOLTIP_CLASS)).toBe(true);
        expect(tooltipTarget.tooltipHidden).toBe(true);
    }
};

const verifyTooltipPosition = (tooltipNativeElement, actualTarget, shouldBeAligned: boolean) => {
    const targetRect = actualTarget.nativeElement.getBoundingClientRect();
    const tooltipRect = tooltipNativeElement.getBoundingClientRect();

    const targetRectMidX = targetRect.left + targetRect.width / 2;
    const tooltipRectMidX = tooltipRect.left + tooltipRect.width / 2;

    const horizontalOffset = Math.abs(targetRectMidX - tooltipRectMidX);
    const verticalOffset = tooltipRect.top - targetRect.bottom;

    if (shouldBeAligned) {
        // Verify that tooltip and target are horizontally aligned with approximately same center
        expect(horizontalOffset >= 0).toBe(true, 'tooltip and target are horizontally MISaligned');
        expect(horizontalOffset <= 0.5).toBe(true, 'tooltip and target are horizontally MISaligned');
        // Verify that tooltip is vertically aligned beneath the target
        expect(verticalOffset >= 0).toBe(true, 'tooltip and target are vertically MISaligned');
        expect(verticalOffset <= 6).toBe(true, 'tooltip and target are vertically MISaligned');
    } else {
        // Verify that tooltip and target are NOT horizontally aligned with approximately same center
        expect(horizontalOffset > 0.1).toBe(true, 'tooltip and target are horizontally aligned');
    }
};
