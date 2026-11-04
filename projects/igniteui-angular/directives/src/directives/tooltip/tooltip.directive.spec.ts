import { DebugElement, ErrorHandler, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxTooltipSingleTargetComponent, IgxTooltipMultipleTargetsComponent, IgxTooltipPlainStringComponent, IgxTooltipWithToggleActionComponent, IgxTooltipWithCloseButtonComponent, IgxTooltipWithNestedContentComponent, IgxTooltipNestedTooltipsComponent } from '../../../../test-utils/tooltip-components.spec';
import { UIInteractions } from '../../../../test-utils/ui-interactions.spec';
import { HorizontalAlignment, VerticalAlignment, AutoPositionStrategy } from '../../../../core/src/services/public_api';
import { IgxTooltipDirective } from './tooltip.directive';
import { IgxTooltipTargetDirective } from './tooltip-target.directive';
import { Placement, PositionsMap } from './tooltip.common';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const HIDDEN_TOOLTIP_CLASS = 'igx-tooltip--hidden';
const TOOLTIP_CLASS = 'igx-tooltip';
const SHOW_DELAY = 200;
const HIDE_DELAY = 300;
const AUTO_HIDE_DELAY = 180;
const TOOLTIP_ARROW_SELECTOR = '[data-arrow="true"]';
const hoveredElements = new WeakSet<Element>();

describe('IgxTooltip', () => {
    let fix: ComponentFixture<any>;
    let tooltipNativeElement: HTMLElement;
    let tooltipTarget: IgxTooltipTargetDirective;
    let button: DebugElement;

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        UIInteractions.clearOverlay();
        vi.useRealTimers();
    });

    beforeEach(async () => {
        const matches = Element.prototype.matches;
        vi.spyOn(Element.prototype, 'matches').mockImplementation(function(this: Element, selectors: string): boolean {
            return selectors === ':hover' ? hoveredElements.has(this) : matches.call(this, selectors);
        } as typeof Element.prototype.matches);

        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxTooltipSingleTargetComponent,
                IgxTooltipMultipleTargetsComponent,
                IgxTooltipPlainStringComponent,
                IgxTooltipWithToggleActionComponent,
                IgxTooltipWithCloseButtonComponent,
                IgxTooltipWithNestedContentComponent,
                IgxTooltipNestedTooltipsComponent
            ]
        }).compileComponents();
        UIInteractions.clearOverlay();
    });

    describe('Single target with single tooltip', () => {
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTooltipSingleTargetComponent);
            fix.detectChanges();
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
            tooltipTarget = fix.componentInstance.tooltipTarget as IgxTooltipTargetDirective;
            button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
        });

        it('IgxTooltipTargetDirective default values', () => {
            expect(tooltipTarget.showDelay).toBe(200);
            expect(tooltipTarget.hideDelay).toBe(300);
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

        it('IgxTooltip is shown/hidden when hovering/unhovering its target', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            unhoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('should not render a default arrow', async () => {
            expect(tooltipTarget.hasArrow).toBe(false);

            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            const arrow = tooltipNativeElement.querySelector(TOOLTIP_ARROW_SELECTOR) as HTMLElement;
            expect(arrow).not.toBeNull();
            expect(arrow.style.display).toEqual("none");
        });

        it('should show/hide the arrow via the `hasArrow` property', async () => {
            expect(tooltipTarget.hasArrow).toBe(false);

            tooltipTarget.hasArrow = true;
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            expect(tooltipTarget.hasArrow).toBe(true);
            const arrow = tooltipNativeElement.querySelector(TOOLTIP_ARROW_SELECTOR) as HTMLElement;
            expect(arrow.style.display).toEqual("");

            tooltipTarget.hasArrow = false;
            fix.detectChanges();
            expect(arrow.style.display).toEqual("none");
        });

        it('show target tooltip when hovering its target and ignore [tooltip] input', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            expect(tooltipNativeElement.textContent.trim()).toEqual('Hello, I am a tooltip!');
        });

        it('verify tooltip default position', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipPosition(tooltipNativeElement, button);
        });

        it('IgxTooltip is not shown when is disabled and hovering its target', async () => {
            tooltipTarget.tooltipDisabled = true;
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            tooltipTarget.tooltipDisabled = false;
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        });

        it('IgxTooltip mouse interaction respects showDelay', async () => {
            tooltipTarget.showDelay = 900;
            fix.detectChanges();

            hoverElement(button);

            await vi.advanceTimersByTimeAsync(500);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            await vi.advanceTimersByTimeAsync(300);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            await vi.advanceTimersByTimeAsync(100);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        });

        it('IgxTooltip mouse interaction respects hideDelay', async () => {
            tooltipTarget.hideDelay = 700;
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();

            unhoverElement(button);
            await vi.advanceTimersByTimeAsync(AUTO_HIDE_DELAY);
            await vi.advanceTimersByTimeAsync(400);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            await vi.advanceTimersByTimeAsync(100);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            await vi.advanceTimersByTimeAsync(200);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('IgxTooltip is shown/hidden when invoking respective API methods', async () => {
            tooltipTarget.showTooltip();
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            tooltipTarget.hideTooltip();
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('showing tooltip through API does NOT respect showDelay', async () => {
            tooltipTarget.showDelay = 400;
            fix.detectChanges();

            tooltipTarget.showTooltip();

            await vi.advanceTimersByTimeAsync(300);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
        });

        it('hiding tooltip through API does NOT respect hideDelay', async () => {
            tooltipTarget.hideDelay = 450;
            fix.detectChanges();

            tooltipTarget.showTooltip();
            await vi.runAllTimersAsync();

            tooltipTarget.hideTooltip();

            await vi.advanceTimersByTimeAsync(400);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('IgxTooltip respects the passed overlaySettings', async () => {
            // Hover the button.
            hoverElement(button);
            await vi.runAllTimersAsync();
            // Verify default position of the tooltip.
            verifyTooltipPosition(tooltipNativeElement, button);
            unhoverElement(button);
            await vi.runAllTimersAsync();

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
            await vi.runAllTimersAsync();
            // Verify that the position of the tooltip is changed.
            verifyTooltipPosition(tooltipNativeElement, button, false);
            const targetRect = tooltipTarget.nativeElement.getBoundingClientRect();
            const tooltipRect = tooltipNativeElement.getBoundingClientRect();
            expect(Math.abs(tooltipRect.top - targetRect.bottom) <= 0.5).toBe(true);
            expect(Math.abs(tooltipRect.left - targetRect.right) <= 0.5).toBe(true);
            unhoverElement(button);
            await vi.runAllTimersAsync();
        });

        it('IgxTooltip closes when the target is clicked', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            UIInteractions.simulateClickAndSelectEvent(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('IgxTooltip should not be shown if the target is clicked - #16145', async () => {
            tooltipTarget.showDelay = 500;
            fix.detectChanges();

            hoverElement(button);
            await vi.advanceTimersByTimeAsync(300);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

            UIInteractions.simulateClickAndSelectEvent(button);
            fix.detectChanges();

            await vi.advanceTimersByTimeAsync(300);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('IgxTooltip hides on pressing \'escape\' key', async () => {
            tooltipTarget.showTooltip();
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            UIInteractions.triggerKeyDownEvtUponElem('Escape', document.documentElement);

            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('IgxTooltip is hidden when its target is destroyed', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            fix.componentInstance.showButton = false;
            fix.detectChanges();
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        describe('Tooltip events', () => {
            it('should emit the proper events when hovering/unhovering target', async () => {
                vi.spyOn(tooltipTarget.tooltipShow, 'emit');
                vi.spyOn(tooltipTarget.tooltipHide, 'emit');

                hoverElement(button);
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalled();
                await vi.runAllTimersAsync();

                unhoverElement(button);
                await vi.advanceTimersByTimeAsync(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalled();
                await vi.runAllTimersAsync();
            });

            it('should emit the proper events when showing/hiding tooltip through API', async () => {
                vi.spyOn(tooltipTarget.tooltipShow, 'emit');
                vi.spyOn(tooltipTarget.tooltipHide, 'emit');

                tooltipTarget.showTooltip();
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalled();
                await vi.runAllTimersAsync();

                tooltipTarget.hideTooltip();
                await vi.advanceTimersByTimeAsync(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalled();
                await vi.runAllTimersAsync();
            });

            it('should emit the proper events with correct eventArgs when hover/unhover', async () => {
                vi.spyOn(tooltipTarget.tooltipShow, 'emit');
                vi.spyOn(tooltipTarget.tooltipHide, 'emit');

                const tooltipShowArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };
                const tooltipHideArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };

                hoverElement(button);
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalledWith(tooltipShowArgs);
                await vi.runAllTimersAsync();

                unhoverElement(button);
                await vi.advanceTimersByTimeAsync(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgs);
                await vi.runAllTimersAsync();
            });

            it('should emit the proper events with correct eventArgs when show/hide through API', async () => {
                vi.spyOn(tooltipTarget.tooltipShow, 'emit');
                vi.spyOn(tooltipTarget.tooltipHide, 'emit');

                const tooltipShowArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };
                const tooltipHideArgs = { target: tooltipTarget, tooltip: fix.componentInstance.tooltip, cancel: false };

                tooltipTarget.showTooltip();
                expect(tooltipTarget.tooltipShow.emit).toHaveBeenCalledWith(tooltipShowArgs);
                await vi.runAllTimersAsync();

                tooltipTarget.hideTooltip();
                await vi.advanceTimersByTimeAsync(500);
                expect(tooltipTarget.tooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgs);
                await vi.runAllTimersAsync();
            });

            it('should cancel the showing event when hover', async () => {
                fix.componentInstance.cancelShowing = true;

                hoverElement(button);
                await vi.runAllTimersAsync();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            });

            it('should cancel the hiding event when unhover', async () => {
                fix.componentInstance.cancelHiding = true;

                hoverElement(button);
                await vi.runAllTimersAsync();

                unhoverElement(button);
                await vi.runAllTimersAsync();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            });

            it('should cancel the showing event when show through API', async () => {
                fix.componentInstance.cancelShowing = true;

                tooltipTarget.showTooltip();
                await vi.runAllTimersAsync();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            });

            it('should cancel the hiding event when hide through API', async () => {
                fix.componentInstance.cancelHiding = true;

                tooltipTarget.showTooltip();
                await vi.runAllTimersAsync();

                tooltipTarget.hideTooltip();
                await vi.runAllTimersAsync();

                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            });
        });

        describe('Tooltip show/hide triggers', () => {
            it('should override default triggers', async () => {
                tooltipTarget.showTriggers = 'focus';
                tooltipTarget.hideTriggers = 'keypress';
                fix.detectChanges();

                hoverElement(button);
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                simulateTriggerEvent(button, 'focus');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                unhoverElement(button);
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                simulateTriggerEvent(button, 'keypress');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            });

            it('should add multiple show triggers', async () => {
                tooltipTarget.showTriggers = 'focus, keypress';
                fix.detectChanges();

                simulateTriggerEvent(button, 'focus');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                unhoverElement(button);
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                simulateTriggerEvent(button, 'keypress');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            });

            it('should add multiple hide triggers', async () => {
                tooltipTarget.showTriggers = 'focus';
                tooltipTarget.hideTriggers = 'blur, keypress';
                fix.detectChanges();

                simulateTriggerEvent(button, 'focus');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
                simulateTriggerEvent(button, 'blur');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                simulateTriggerEvent(button, 'focus');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
                simulateTriggerEvent(button, 'keypress');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            });

            it('should respect showDelay and hideDelay', async () => {
                tooltipTarget.showTriggers = tooltipTarget.hideTriggers = 'click';
                fix.detectChanges();

                simulateTriggerEvent(button, 'click');
                await vi.advanceTimersByTimeAsync(SHOW_DELAY - 1);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
                await vi.advanceTimersByTimeAsync(1);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                simulateTriggerEvent(button, 'click');
                const totalHideDelay = HIDE_DELAY + AUTO_HIDE_DELAY - 1;
                await vi.advanceTimersByTimeAsync(totalHideDelay);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
                await vi.advanceTimersByTimeAsync(1);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            });

            it('should not be shown if the tooltip is disabled', async () => {
                tooltipTarget.showTriggers = 'focus';
                tooltipTarget.hideTriggers = 'blur';
                tooltipTarget.tooltipDisabled = true;
                fix.detectChanges();

                simulateTriggerEvent(button, 'focus');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                tooltipTarget.tooltipDisabled = false;
                fix.detectChanges();

                simulateTriggerEvent(button, 'focus');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                tooltipTarget.tooltipDisabled = true;
                fix.detectChanges();

                simulateTriggerEvent(button, 'blur');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

                tooltipTarget.tooltipDisabled = false;
                fix.detectChanges();

                simulateTriggerEvent(button, 'blur');
                await vi.runAllTimersAsync();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            });

            it('should not open when pointer leaves before the show delay elapses', async () => {
                tooltipTarget.showDelay = 500;
                fix.detectChanges();

                hoverElement(button);
                await vi.advanceTimersByTimeAsync(300);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);

                unhoverElement(button);
                await vi.advanceTimersByTimeAsync(300);
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            });

            for (const trigger of ['mouseenter', 'mouseover', 'pointerenter', 'pointerover']) {
                it(`should not open after the delay when the target is no longer hovered using ${trigger}`, async () => {
                    tooltipTarget.showDelay = 500;
                    tooltipTarget.showTriggers = trigger;
                    tooltipTarget.hideTriggers = 'click';
                    fix.detectChanges();

                    hoverElement(button, trigger);
                    await vi.advanceTimersByTimeAsync(300);
                    unhoverElement(button);
                    await vi.advanceTimersByTimeAsync(200);

                    verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
                });
            }
        });
    });

    describe('Plain string tooltip input', () => {
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTooltipPlainStringComponent);
            fix.detectChanges();
            button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
            tooltipTarget = fix.componentInstance.tooltipTarget;
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
        });

        it('IgxTooltip is initially hidden', async () => {
            unhoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('IgxTooltip is shown/hidden when hovering/unhovering its target', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            unhoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('Should respect default max-width constraint for plain string tooltip', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            const maxWidth = getComputedStyle(tooltipNativeElement).maxWidth;
            expect(maxWidth).toBe('200px');
        });
    });

    describe('Custom content tooltip', () => {
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTooltipWithNestedContentComponent);
            fix.detectChanges();
            button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
            tooltipTarget = fix.componentInstance.tooltipTarget;
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
        });

        it('Should not have max-width constraint for custom content tooltip', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            const maxWidth = getComputedStyle(tooltipNativeElement).maxWidth;
            expect(maxWidth).toBe('none');
        });
    });

    describe('Nested tooltips', () => {
        let tooltipTarget1: IgxTooltipTargetDirective;
        let tooltipTarget2: IgxTooltipTargetDirective;
        let tooltipTarget3: IgxTooltipTargetDirective;

        let tooltip1: IgxTooltipDirective;
        let tooltip2: IgxTooltipDirective;
        let tooltip3: IgxTooltipDirective;

        // With the Bottom placement, the arrow is at the center of the tooltip.
        const verifyTooltipArrowAlignment = (tooltip: IgxTooltipDirective) => {
            const arrowClassName = 'igx-tooltip--bottom';
            const arrowTopOffset = '-4px';

            expect(tooltip.arrow.classList.contains(arrowClassName)).toBe(true);
            expect(tooltip.arrow.style.top).toBe(arrowTopOffset);
            expect(Math.abs(getCenterX(tooltip.arrow) - getCenterX(tooltip.element))).toBeLessThanOrEqual(alignmentTolerance);
        };

        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTooltipNestedTooltipsComponent);
            fix.detectChanges();

            tooltipTarget1 = fix.componentInstance.targetLevel1;
            tooltipTarget2 = fix.componentInstance.targetLevel2;
            tooltipTarget3 = fix.componentInstance.targetLevel3;

            tooltip1 = fix.componentInstance.tooltipLevel1;
            tooltip2 = fix.componentInstance.tooltipLevel2;
            tooltip3 = fix.componentInstance.tooltipLevel3;
        });

        it('should show arrow for each tooltip', async () => {
            hoverElement(tooltipTarget1);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltip1.element, tooltipTarget1, true);
            expect(tooltipTarget1.hasArrow).toBe(true);
            // The first target is at the viewport edge, so its tooltip is pushed into the viewport.
            // The arrow then points at the target instead of being at the center of the tooltip.
            expect(tooltip1.arrow.classList.contains('igx-tooltip--bottom')).toBe(true);
            expect(tooltip1.element.parentElement.style.transform).toContain('translateX');
            expect(Math.abs(getCenterX(tooltip1.arrow) - getCenterX(tooltipTarget1.nativeElement))).toBeLessThanOrEqual(alignmentTolerance);

            hoverElement(tooltipTarget2);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltip2.element, tooltipTarget2, true);
            expect(tooltipTarget2.hasArrow).toBe(true);
            verifyTooltipArrowAlignment(tooltip2);

            hoverElement(tooltipTarget3);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltip3.element, tooltipTarget3, true);
            expect(tooltipTarget3.hasArrow).toBe(true);
            verifyTooltipArrowAlignment(tooltip3);

        });
    });

    describe('Multiple targets with single tooltip', () => {
        let targetOne: IgxTooltipTargetDirective;
        let targetTwo: IgxTooltipTargetDirective;
        let buttonOne;
        let buttonTwo;

        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTooltipMultipleTargetsComponent);
            fix.detectChanges();
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
            targetOne = fix.componentInstance.targetOne;
            targetTwo = fix.componentInstance.targetTwo;
            buttonOne = fix.debugElement.query(By.css('.buttonOne'));
            buttonTwo = fix.debugElement.query(By.css('.buttonTwo'));
        });

        it('Same tooltip shows on different targets depending on which target is hovered', async () => {
            hoverElement(buttonOne);
            await vi.runAllTimersAsync();

            // Tooltip is positioned relative to buttonOne and NOT relative to buttonTwo
            verifyTooltipVisibility(tooltipNativeElement, targetOne, true);
            verifyTooltipPosition(tooltipNativeElement, buttonOne);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo, false);

            unhoverElement(buttonOne);
            await vi.runAllTimersAsync();
            hoverElement(buttonTwo);
            await vi.runAllTimersAsync();

            // Tooltip is positioned relative to buttonTwo and NOT relative to buttonOne
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);
        });

        it('Same tooltip shows on a second target when hovering it without closing from first target\'s logic', async () => {
            targetOne.hideDelay = 700;
            fix.detectChanges();

            hoverElement(buttonOne);
            await vi.runAllTimersAsync();

            unhoverElement(buttonOne);
            await vi.advanceTimersByTimeAsync(300);
            hoverElement(buttonTwo);
            await vi.advanceTimersByTimeAsync(500);

            // Tooltip is visible and positioned relative to buttonTwo
            // and it was not closed due to buttonOne mouseLeave logic.
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);
            await vi.runAllTimersAsync();
        });

        it('Should position relative to its target when having no close animation - #16288', async () => {
            targetOne.positionSettings = targetTwo.positionSettings = {
                openAnimation: undefined,
                closeAnimation: undefined
            };
            fix.detectChanges();

            hoverElement(buttonOne);
            await vi.advanceTimersByTimeAsync(targetOne.showDelay);

            verifyTooltipVisibility(tooltipNativeElement, targetOne, true);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, true);

            unhoverElement(buttonOne);

            hoverElement(buttonTwo);
            await vi.advanceTimersByTimeAsync(targetTwo.showDelay);

            // Tooltip is visible and positioned relative to buttonTwo
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo);
            // Tooltip is NOT visible and positioned relative to buttonOne
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);
        });

        it('Hovering first target briefly and then hovering second target leads to tooltip showing for second target', async () => {
            targetOne.showDelay = 600;
            fix.detectChanges();

            hoverElement(buttonOne);
            await vi.advanceTimersByTimeAsync(400);

            verifyTooltipVisibility(tooltipNativeElement, targetOne, false);
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);

            unhoverElement(buttonOne);
            await vi.advanceTimersByTimeAsync(100);

            hoverElement(buttonTwo);
            await vi.runAllTimersAsync();

            // Tooltip is visible and positioned relative to buttonTwo
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            verifyTooltipPosition(tooltipNativeElement, buttonTwo);
            // Tooltip is NOT visible and positioned relative to buttonOne
            verifyTooltipPosition(tooltipNativeElement, buttonOne, false);
        });

        it('should not emit tooltipHide event multiple times', async () => {
            vi.spyOn(targetOne.tooltipHide, 'emit');
            vi.spyOn(targetTwo.tooltipHide, 'emit');

            hoverElement(buttonOne);
            await vi.runAllTimersAsync();

            const tooltipHideArgsTargetOne = { target: targetOne, tooltip: fix.componentInstance.tooltip, cancel: false };
            const tooltipHideArgsTargetTwo = { target: targetTwo, tooltip: fix.componentInstance.tooltip, cancel: false };

            unhoverElement(buttonOne);
            await vi.advanceTimersByTimeAsync(500);
            expect(targetOne.tooltipHide.emit).toHaveBeenCalledTimes(1);
            expect(targetOne.tooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgsTargetOne);
            expect(targetTwo.tooltipHide.emit).not.toHaveBeenCalled();
            await vi.runAllTimersAsync();

            hoverElement(buttonTwo);
            await vi.runAllTimersAsync();

            unhoverElement(buttonTwo);
            await vi.advanceTimersByTimeAsync(500);
            expect(targetOne.tooltipHide.emit).toHaveBeenCalledTimes(1);
            expect(targetOne.tooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgsTargetOne);
            expect(targetTwo.tooltipHide.emit).toHaveBeenCalledTimes(1);
            expect(targetTwo.tooltipHide.emit).toHaveBeenCalledWith(tooltipHideArgsTargetTwo);
            await vi.runAllTimersAsync();
        });

        it('should show and remove close button depending on active sticky target', async () => {
            targetOne.sticky = true;
            fix.detectChanges();
            hoverElement(buttonOne);
            await vi.runAllTimersAsync();

            let closeBtn = tooltipNativeElement.querySelector('igx-tooltip-close-button');
            expect(closeBtn).not.toBeNull();
            expect(fix.componentInstance.tooltip.role).toBe('status');

            targetTwo.sticky = false;
            fix.detectChanges();
            hoverElement(buttonTwo);
            await vi.runAllTimersAsync();

            // It should still show tooltip for targetOne
            expect(fix.componentInstance.tooltip.role).toBe('status');
            expect(tooltipNativeElement.querySelector('igx-tooltip-close-button')).not.toBeNull();

            closeBtn = tooltipNativeElement.querySelector('igx-tooltip-close-button') as HTMLElement;
            closeBtn.dispatchEvent(new Event('click'));
            fix.detectChanges();
            await vi.runAllTimersAsync();

            hoverElement(buttonTwo);
            await vi.runAllTimersAsync();

            expect(tooltipNativeElement.querySelector('igx-tooltip-close-button')).toBeNull();
            expect(fix.componentInstance.tooltip.role).toBe('tooltip');
        });

        it('should assign close template programmatically and render it only for the sticky target', async () => {
            const instance = fix.componentInstance;

            targetOne.sticky = true;
            targetTwo.sticky = true;
            targetOne.closeTemplate = instance.customCloseTemplate;
            fix.detectChanges();

            hoverElement(buttonOne);
            await vi.runAllTimersAsync();

            const customClose = tooltipNativeElement.querySelector('.my-close-btn');
            expect(customClose).not.toBeNull();
            expect(customClose.textContent).toContain('Custom Close Button');

            const closeBtn = tooltipNativeElement.querySelector('igx-tooltip-close-button') as HTMLElement;
            closeBtn.dispatchEvent(new Event('click'));
            fix.detectChanges();
            await vi.runAllTimersAsync();

            hoverElement(buttonTwo);
            await vi.runAllTimersAsync();

            expect(tooltipNativeElement.querySelector('.my-close-btn')).toBeNull();
        });

        it('should not update tooltip state when non-active target changes sticky or closeTemplate', async () => {
            const instance = fix.componentInstance as IgxTooltipMultipleTargetsComponent;

            targetOne.sticky = true;
            targetTwo.sticky = false;
            targetOne.closeTemplate = instance.customCloseTemplate;
            fix.detectChanges();

            hoverElement(buttonOne);
            await vi.runAllTimersAsync();

            // Tooltip should be shown for targetOne with custom close button and correct role
            const tooltip = tooltipNativeElement;
            const customClose = tooltip.querySelector('.my-close-btn');
            const roleAttr = tooltip.getAttribute('role');

            expect(customClose).not.toBeNull();
            expect(customClose.textContent).toContain('Custom Close Button');
            expect(roleAttr).toBe('status');

            const closeButton = tooltip.querySelector('igx-tooltip-close-button');

            // Change sticky and template on targetTwo while tooltip is still shown for targetOne
            targetTwo.sticky = true;
            targetTwo.closeTemplate = instance.secondCustomCloseTemplate;

            fix.detectChanges();
            await vi.runAllTimersAsync();

            expect(tooltip.querySelector('igx-tooltip-close-button')).toBe(closeButton); // same reference
            expect(tooltip.querySelector('.my-close-btn')).not.toBeNull(); // still the custom one
            expect(tooltip.getAttribute('role')).toBe('status');
            expect(instance.tooltip.tooltipTarget).toBe(targetOne);
        });

        it('should update tooltip state when active target changes closeTemplate or sticky', async () => {
            const instance = fix.componentInstance as IgxTooltipMultipleTargetsComponent;

            targetOne.sticky = true;
            targetOne.closeTemplate = instance.customCloseTemplate;
            fix.detectChanges();

            hoverElement(buttonOne);
            await vi.runAllTimersAsync();
            fix.detectChanges();

            const tooltip = tooltipNativeElement;
            const customClose = tooltip.querySelector('.my-close-btn');
            const roleAttr = tooltip.getAttribute('role');

            expect(customClose).not.toBeNull();
            expect(customClose.textContent).toContain('Custom Close Button');
            expect(roleAttr).toBe('status');

            // Change closeTemplate of active targetOne
            targetOne.closeTemplate = instance.secondCustomCloseTemplate;
            fix.detectChanges();
            await vi.runAllTimersAsync();

            const updatedCustomClose = tooltip.querySelector('.my-second-close-btn');
            expect(updatedCustomClose).not.toBeNull();
            expect(updatedCustomClose.textContent).toContain('Second Custom Close Button');

            targetOne.sticky = false;
            fix.detectChanges();
            await vi.runAllTimersAsync();

            expect(tooltip.getAttribute('role')).toBe('tooltip');
            expect(tooltip.querySelector('igx-tooltip-close-button')).toBeNull();
        });

        it('should correctly update tooltip when showing programmatically for sticky and non-sticky targets', async () => {
            const tooltip = tooltipNativeElement;

            targetOne.sticky = true;
            fix.detectChanges();
            targetOne.showTooltip();
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltip, targetOne, true);
            expect(tooltip.role).toBe('status');

            // Programmatically show tooltip for targetTwo (non-sticky) without closing sticky tooltip
            targetTwo.sticky = false;
            targetTwo.showTooltip();
            await vi.runAllTimersAsync();
            verifyTooltipPosition(tooltip, targetTwo, false);
            expect(tooltip.role).toBe('status');

            targetOne.hideTooltip();
            await vi.runAllTimersAsync();

            targetTwo.showTooltip();
            await vi.runAllTimersAsync();
            verifyTooltipPosition(tooltip, targetTwo, true);
            expect(tooltip.role).toBe('tooltip');
        });

        it('should correctly manage arrow state between different targets', async () => {
            targetOne.hasArrow = true;
            fix.detectChanges();

            hoverElement(buttonOne);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, targetOne, true);
            let arrow = tooltipNativeElement.querySelector(TOOLTIP_ARROW_SELECTOR) as HTMLElement;
            expect(arrow.style.display).toEqual('');

            unhoverElement(buttonOne);
            await vi.runAllTimersAsync();

            hoverElement(buttonTwo);
            await vi.runAllTimersAsync();

            arrow = tooltipNativeElement.querySelector(TOOLTIP_ARROW_SELECTOR) as HTMLElement;
            verifyTooltipVisibility(tooltipNativeElement, targetTwo, true);
            expect(arrow.style.display).toEqual('none');
        });
    });

    describe('Tooltip integration', () => {
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTooltipWithToggleActionComponent);
            fix.detectChanges();
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
            tooltipTarget = fix.componentInstance.tooltipTarget as IgxTooltipTargetDirective;
            button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
        });

        it('Correctly sets tooltip target when defined before igxToggleAction directive on same host - issue #14196', async () => {
            expect(tooltipTarget.target.element).toBe(tooltipNativeElement);
            expect(fix.componentInstance.toggleDir.collapsed).toBe(true);

            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            // Clicking the shared host hides the tooltip and opens the toggle (not the tooltip)
            UIInteractions.simulateClickEvent(button.nativeElement);
            await vi.advanceTimersByTimeAsync(AUTO_HIDE_DELAY);
            await vi.advanceTimersByTimeAsync(300);
            fix.detectChanges();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
            expect(fix.componentInstance.toggleDir.collapsed).toBe(false);

            // Clicking again toggles the toggle directive closed
            UIInteractions.simulateClickEvent(button.nativeElement);
            await vi.runAllTimersAsync();
            fix.detectChanges();

            expect(fix.componentInstance.toggleDir.collapsed).toBe(true);
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });
    });

    describe('Tooltip Sticky with Close Button', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IgxTooltipWithCloseButtonComponent);
            fix.detectChanges();
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
            tooltipTarget = fix.componentInstance.tooltipTarget as IgxTooltipTargetDirective;
            button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
        });

        it('should render custom close button when sticky is true', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, button, true);
            const closeBtn = document.querySelector('.my-close-btn');
            expect(closeBtn).toBeTruthy();
        });

        it('should remove close button when sticky is set to false', async () => {
            tooltipTarget.sticky = false;
            fix.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            const closeBtn = document.querySelector('.my-close-btn');
            expect(closeBtn).toBeFalsy();

        });

        it('should hide the tooltip custom close button is clicked', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            const closeBtn = tooltipNativeElement.querySelector('.my-close-btn') as HTMLElement;
            UIInteractions.simulateClickAndSelectEvent(closeBtn);

            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('should use default close icon when no custom template is passed', async () => {
            // Clear custom template
            tooltipTarget.closeTemplate = null;
            fix.detectChanges();
            await vi.advanceTimersByTimeAsync(0);

            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            const icon = document.querySelector('igx-icon');
            expect(icon).toBeTruthy();
            expect(icon?.textContent?.trim().toLowerCase()).toBe('close');
        });

        it('should update the DOM role attribute correctly when sticky changes', async () => {
            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            expect(tooltipNativeElement.getAttribute('role')).toBe('status');

            tooltipTarget.sticky = false;
            fix.detectChanges();
            await vi.advanceTimersByTimeAsync(0);
            expect(tooltipNativeElement.getAttribute('role')).toBe('tooltip');
        });

        it('should hide sticky tooltip when Escape is pressed', async () => {
            tooltipTarget.sticky = true;
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();
            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);

            // Dispatch Escape key
            const escapeEvent = new KeyboardEvent('keydown', {
                key: 'Escape',
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(escapeEvent);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, false);
        });

        it('should correctly display a sticky tooltip on custom show trigger', async () => {
            tooltipTarget.sticky = true;
            tooltipTarget.showTriggers = 'focus';
            fix.detectChanges();

            simulateTriggerEvent(button, 'focus');
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            const closeBtn = document.querySelector('.my-close-btn');
            expect(closeBtn).toBeTruthy();
            expect(tooltipNativeElement.getAttribute('role')).toBe('status');
        });

        describe('Zoneless', () => {
            beforeEach(async () => {
                TestBed.resetTestingModule();
                await TestBed.configureTestingModule({
                    imports: [
                        NoopAnimationsModule,
                        IgxTooltipWithCloseButtonComponent
                    ],
                    providers: [provideZonelessChangeDetection()]
                }).compileComponents();
            });

            beforeEach(() => {
                fix = TestBed.createComponent(IgxTooltipWithCloseButtonComponent);
                fix.detectChanges();
                tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
                tooltipTarget = fix.componentInstance.tooltipTarget as IgxTooltipTargetDirective;
                button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
            });

            it('should not throw ExpressionChangedAfterItHasBeenChecked when showing sticky tooltip with close button', async () => {
                const errorHandler = TestBed.inject(ErrorHandler);
                const handleErrorSpy = vi.spyOn(errorHandler, 'handleError');

                hoverElement(button);
                await vi.advanceTimersByTimeAsync(SHOW_DELAY + 50);
                fix.detectChanges();

                expect(handleErrorSpy).not.toHaveBeenCalled();
                verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
                expect(tooltipNativeElement.getAttribute('role')).toBe('status');
            });

            it('should correctly remove the close button and update the role when sticky is set to false', async () => {
                tooltipTarget.sticky = true;
                fix.detectChanges();
                hoverElement(button);
                await vi.advanceTimersByTimeAsync(SHOW_DELAY + 50);
                fix.detectChanges();

                const closeBtn = tooltipNativeElement.querySelector('igx-tooltip-close-button');
                expect(closeBtn).not.toBeNull();
                expect(fix.componentInstance.tooltip.role).toBe('status');

                tooltipTarget.sticky = false;
                fix.detectChanges();
                hoverElement(button);
                await vi.advanceTimersByTimeAsync(SHOW_DELAY + 50);
                fix.detectChanges();

                expect(fix.componentInstance.tooltip.role).toBe('tooltip');
                expect(tooltipNativeElement.querySelector('igx-tooltip-close-button')).toBeNull();
            });
        });
    });

    describe('IgxTooltip placement and offset', () => {
        beforeEach(async () => {
            fix = TestBed.createComponent(IgxTooltipSingleTargetComponent);
            fix.detectChanges();
            tooltipNativeElement = fix.debugElement.query(By.directive(IgxTooltipDirective)).nativeElement;
            tooltipTarget = fix.componentInstance.tooltipTarget as IgxTooltipTargetDirective;
            button = fix.debugElement.query(By.directive(IgxTooltipTargetDirective));
        });

        afterEach(() => {
            UIInteractions.clearOverlay();
        });

        it('should respect custom positive offset', async () => {
            const customOffset = 20;
            tooltipTarget.positionSettings = {
                ...PositionsMap.get(Placement.Bottom),
                offset: customOffset
            };
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            verifyTooltipPosition(tooltipNativeElement, button, true, Placement.Bottom, customOffset);
        });

        it('should respect custom negative offset', async () => {
            const customOffset = -10;
            tooltipTarget.positionSettings = {
                ...PositionsMap.get(Placement.Right),
                offset: customOffset
            };
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            verifyTooltipPosition(tooltipNativeElement, button, true, Placement.Right, customOffset);
        });

        it('should correctly position arrow based on tooltip placement', async () => {
            tooltipTarget.positionSettings = {
                ...PositionsMap.get(Placement.BottomStart),
            };
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            verifyTooltipPosition(tooltipNativeElement, button, true, Placement.BottomStart);

            const arrow = tooltipNativeElement.querySelector(TOOLTIP_ARROW_SELECTOR) as HTMLElement;
            expect(arrow).not.toBeNull();
            expect(arrow.style.left).toBe("");
        });

        it('should keep the arrow on the target when the tooltip is pushed into the viewport', async () => {
            tooltipTarget.hasArrow = true;
            // At the left viewport edge the centered tooltip cannot fit, so it is pushed to the right.
            button.nativeElement.style.cssText = 'position: fixed; left: 0; top: 200px; margin: 0';
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();

            verifyTooltipVisibility(tooltipNativeElement, tooltipTarget, true);
            expect(tooltipNativeElement.parentElement.style.transform).toContain('translateX');

            const arrow = tooltipNativeElement.querySelector(TOOLTIP_ARROW_SELECTOR) as HTMLElement;
            expect(Math.abs(getCenterX(arrow) - getCenterX(button.nativeElement))).toBeLessThanOrEqual(alignmentTolerance);
        });

        it('should position the arrow by the layout size while the tooltip is scaled', async () => {
            tooltipTarget.hasArrow = true;
            fix.detectChanges();

            hoverElement(button);
            await vi.runAllTimersAsync();

            // A resize or a scroll can reposition the tooltip while the open animation scales it.
            tooltipNativeElement.style.transform = 'scale(0.5)';
            fix.componentInstance.tooltip.reposition();
            tooltipNativeElement.style.transform = '';

            const arrow = tooltipNativeElement.querySelector(TOOLTIP_ARROW_SELECTOR) as HTMLElement;
            expect(Math.abs(getCenterX(arrow) - getCenterX(button.nativeElement))).toBeLessThanOrEqual(alignmentTolerance);
        });

        it('should follow its target when the target moves while the tooltip is open', async () => {
            // The layout observers and the animation frame they wait for are not timers.
            vi.useRealTimers();
            tooltipTarget.showTooltip();
            await waitForLayout();
            verifyTooltipPosition(tooltipNativeElement, button, true, Placement.Bottom);

            // A layout change, such as another theme, moves the target without a scroll or a resize.
            button.nativeElement.style.marginTop = '300px';
            await waitForLayout();

            verifyTooltipPosition(tooltipNativeElement, button, true, Placement.Bottom);
        });

        it('should take its new size when its content changes while it is open', async () => {
            vi.useRealTimers();
            tooltipTarget.showTooltip();
            await waitForLayout();

            const content = tooltipNativeElement.parentElement;
            const initialWidth = parseFloat(content.style.width);

            // A bigger font, as with another theme, needs more width than the overlay fixed at open.
            tooltipNativeElement.style.fontSize = '2em';
            await waitForLayout();

            expect(parseFloat(content.style.width)).toBeGreaterThan(initialWidth);
            expect(parseFloat(content.style.width)).toBeCloseTo(tooltipNativeElement.getBoundingClientRect().width, 1);
            verifyTooltipPosition(tooltipNativeElement, button, true, Placement.Bottom);
        });
    });
});

const waitForLayout = () => new Promise(resolve => setTimeout(resolve, 100));

const getCenterX = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return rect.left + rect.width / 2;
};

interface ElementRefLike {
    nativeElement: HTMLElement;
}

const hoverElement = (element: ElementRefLike, event = 'pointerenter') => {
    hoveredElements.add(element.nativeElement);
    element.nativeElement.dispatchEvent(new MouseEvent(event));
};

const unhoverElement = (element: ElementRefLike) => {
    hoveredElements.delete(element.nativeElement);
    element.nativeElement.dispatchEvent(new MouseEvent('pointerleave'));
};

const simulateTriggerEvent = (element: ElementRefLike, event: string) => element.nativeElement.dispatchEvent(new Event(event, { bubbles: true }));

const verifyTooltipVisibility = (tooltipNativeElement, tooltipTarget, shouldBeVisible: boolean) => {
    expect(tooltipNativeElement.classList.contains(TOOLTIP_CLASS)).toBe(shouldBeVisible);
    expect(tooltipNativeElement.classList.contains(HIDDEN_TOOLTIP_CLASS)).not.toBe(shouldBeVisible);
    expect(tooltipTarget?.tooltipHidden).not.toBe(shouldBeVisible);
};

const directionTolerance = 2;
const alignmentTolerance = 2;


export const verifyTooltipPosition = (
    tooltipNativeElement: HTMLElement,
    actualTarget: { nativeElement: HTMLElement },
    shouldAlign: boolean = true,
    placement: Placement = Placement.Bottom,
    offset: number = 6
) => {
    const tooltip = tooltipNativeElement.getBoundingClientRect();
    const target = actualTarget.nativeElement.getBoundingClientRect();

    let directionCheckPassed = false;
    let alignmentCheckPassed = false;

    let actualOffset;

    // --- placement check ---
    if (placement.startsWith('top')) {
        actualOffset = target.top - tooltip.bottom;
        directionCheckPassed = Math.abs(actualOffset - offset) <= directionTolerance;
    } else if (placement.startsWith('bottom')) {
        actualOffset = tooltip.top - target.bottom;
        directionCheckPassed = Math.abs(actualOffset - offset) <= directionTolerance;
    } else if (placement.startsWith('left')) {
        actualOffset = target.left - tooltip.right;
        directionCheckPassed = Math.abs(actualOffset - offset) <= directionTolerance;
    } else if (placement.startsWith('right')) {
        actualOffset = tooltip.left - target.right;
        directionCheckPassed = Math.abs(actualOffset - offset) <= directionTolerance;
    }


    // --- alignment check ---
    if (placement.startsWith('top') || placement.startsWith('bottom')) {
        alignmentCheckPassed = horizontalAlignmentMatches(tooltip, target, placement);
    } else {
        alignmentCheckPassed = verticalAlignmentMatches(tooltip, target, placement);
    }

    const result = directionCheckPassed && alignmentCheckPassed;

    if (shouldAlign) {
        expect(result, `Tooltip misaligned for "${placement}": actual offset=${actualOffset}, wanted offset=${offset}, accurate placement=${directionCheckPassed}, accurate alignment=${alignmentCheckPassed}`).toBeTruthy();
    } else {
        expect(result, `Tooltip was unexpectedly aligned`).toBeFalsy();
    }
};

function horizontalAlignmentMatches(tooltip: DOMRect, target: DOMRect, placement: Placement): boolean {
    if (placement.endsWith('start')) {
        return Math.abs(tooltip.left - target.left) <= alignmentTolerance;
    } else if (placement.endsWith('end')) {
        return Math.abs(tooltip.right - target.right) <= alignmentTolerance;
    } else {
        const tooltipMid = tooltip.left + tooltip.width / 2;
        const targetMid = target.left + target.width / 2;
        return Math.abs(tooltipMid - targetMid) <= alignmentTolerance;
    }
}

function verticalAlignmentMatches(tooltip: DOMRect, target: DOMRect, placement: Placement): boolean {
    if (placement.endsWith('start')) {
        return Math.abs(tooltip.top - target.top) <= alignmentTolerance;
    } else if (placement.endsWith('end')) {
        return Math.abs(tooltip.bottom - target.bottom) <= alignmentTolerance;
    } else {
        const tooltipMid = tooltip.top + tooltip.height / 2;
        const targetMid = target.top + target.height / 2;
        return Math.abs(tooltipMid - targetMid) <= alignmentTolerance;
    }
}
