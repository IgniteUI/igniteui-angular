import { useAnimation } from '@angular/animations';
import { Component, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { waitForAsync, TestBed, fakeAsync, ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    IExpansionPanelCancelableEventArgs, IgxExpansionPanelBodyComponent, IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelTitleDirective, ToggleAnimationSettings
} from '../../../expansion-panel/src/public_api';
import { IAccordionCancelableEventArgs, IAccordionEventArgs, IgxAccordionComponent } from './accordion.component';
import { growVerIn, growVerOut, slideInLeft, slideOutRight } from 'igniteui-angular/animations';
import { UIInteractions } from 'igniteui-angular/test-utils/ui-interactions.spec';

const ACCORDION_CLASS = 'igx-accordion';
const PANEL_TAG = 'IGX-EXPANSION-PANEL';
const ACCORDION_TAG = 'IGX-ACCORDION';
const PANELS_DATA = [
    { id: 'html5', title: 'HTML5', collapsed: false, disabled: false },
    { id: 'css', title: 'CSS3', collapsed: false, disabled: false },
    { id: 'scss', title: 'SASS/SCSS', collapsed: true, disabled: false },
    { id: 'js', title: 'Javascript', collapsed: false, disabled: true }
];

describe('Rendering Tests', () => {
    let fix: ComponentFixture<IgxAccordionSampleTestComponent>;
    let accordion: IgxAccordionComponent;
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxAccordionSampleTestComponent
                ]
            }).compileComponents();
        })
    );
    beforeEach(() => {
        fix = TestBed.createComponent(IgxAccordionSampleTestComponent);
        fix.detectChanges();
        accordion = fix.componentInstance.accordion;
    });

    describe('General', () => {
        it('Should render accordion with expansion panels', () => {
            const accordionElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${ACCORDION_CLASS}`))[0].nativeElement;
            const childPanels = accordionElement.children;
            expect(childPanels.length).toBe(4);
            expect(accordion.panels.length).toEqual(4);
            for (let i = 0; i < childPanels.length; i++) {
                expect(childPanels.item(i).tagName === PANEL_TAG).toBeTruthy();
            }
        });

        it('Should allow overriding animationSettings that are used for expansion panels toggle', () => {
            const animationSettingsCustom = {
                closeAnimation: useAnimation(slideOutRight, { params: { duration: '100ms', toPosition: 'translateX(25px)' } }),
                openAnimation: useAnimation(slideInLeft, { params: { duration: '500ms', fromPosition: 'translateX(-15px)' } })
            };

            const animationSettingsCustomPanel = {
                closeAnimation: useAnimation(slideOutRight, { params: { duration: '200ms', toPosition: 'translateX(25px)' } }),
                openAnimation: useAnimation(slideInLeft, { params: { duration: '500ms', fromPosition: 'translateX(-15px)' } })
            };

            accordion.panels[0].animationSettings = animationSettingsCustomPanel;

            accordion.animationSettings = animationSettingsCustom;

            for (let i = 0; i < 3; i++) {
                expect(accordion.panels[i].animationSettings.closeAnimation.options.params.duration).toEqual('100ms');
            }
        });

        it('Should be able to render nested accordions', () => {
            const panelBody = accordion.panels[0].body?.element.nativeElement;
            expect(panelBody.children[0].tagName === ACCORDION_TAG).toBeTruthy();
        });

        it(`Should be able to expand only one panel when singleBranchExpanded is set to true
        and expandAll/collapseAll should not update the current expansion state `, fakeAsync(() => {
            spyOn(accordion.panelExpanded, 'emit').and.callThrough();
            spyOn(accordion.panelCollapsed, 'emit').and.callThrough();
            accordion.singleBranchExpand = true;
            fix.detectChanges();

            accordion.expandAll();
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(panel => !panel.collapsed).length).toEqual(1);
            expect(accordion.panels[3].collapsed).toBeFalse();
            expect(accordion.panelExpanded.emit).toHaveBeenCalledTimes(0);

            accordion.panels[0].expand();
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(panel => !panel.collapsed).length).toEqual(2);
            expect(accordion.panels[0].collapsed).toBeFalse();
            expect(accordion.panels[1].collapsed).toBeTrue();
            expect(accordion.panels[2].collapsed).toBeTrue();
            expect(accordion.panels[3].collapsed).toBeFalse();

            accordion.collapseAll();
            tick();
            fix.detectChanges();

            expect(accordion.panelCollapsed.emit).toHaveBeenCalledTimes(3);

            accordion.panels[0].expand();
            accordion.panels[1].expand();
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(panel => !panel.collapsed).length).toEqual(1);
            expect(accordion.panels[0].collapsed).toBeTrue();
            expect(accordion.panels[1].collapsed).toBeFalse();
            expect(accordion.panels[2].collapsed).toBeTrue();
            expect(accordion.panels[3].collapsed).toBeTrue();

        }));

        it('Should be able to expand multiple panels when singleBranchExpanded is set to false', fakeAsync(() => {
            accordion.singleBranchExpand = false;
            fix.detectChanges();

            accordion.panels[0].expand();
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(panel => !panel.collapsed).length).toEqual(3);
            expect(accordion.panels[0].collapsed).toBeFalse();
            expect(accordion.panels[1].collapsed).toBeTrue();
            expect(accordion.panels[2].collapsed).toBeFalse();
            expect(accordion.panels[3].collapsed).toBeFalse();

            accordion.panels[1].expand();
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(panel => !panel.collapsed).length).toEqual(4);
            expect(accordion.panels[0].collapsed).toBeFalse();
            expect(accordion.panels[1].collapsed).toBeFalse();
            expect(accordion.panels[2].collapsed).toBeFalse();
            expect(accordion.panels[3].collapsed).toBeFalse();
        }));

        it(`Should update the current expansion state when expandAll/collapseAll is invoked and
        singleBranchExpaned is set to false`, fakeAsync(() => {
            spyOn(accordion.panelExpanded, 'emit').and.callThrough();
            spyOn(accordion.panelCollapsed, 'emit').and.callThrough();
            accordion.singleBranchExpand = false;
            accordion.panels[3].collapse();
            tick();
            fix.detectChanges();

            accordion.expandAll();
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(panel => panel.collapsed).length).toEqual(0);
            expect(accordion.panelExpanded.emit).toHaveBeenCalledTimes(3);

            accordion.collapseAll();
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(panel => panel.collapsed).length).toEqual(4);
            expect(accordion.panelCollapsed.emit).toHaveBeenCalledTimes(5);
        }));

        it(`Should collapse all expanded and not disabled panels except for the last one when setting singleBranchExpand to true`, () => {
            expect(accordion.panels[0].collapsed).toBeTrue();
            expect(accordion.panels[1].collapsed).toBeTrue();
            expect(accordion.panels[2].collapsed).toBeFalse();
            expect(accordion.panels[3].collapsed).toBeFalse();

            accordion.panels[1].collapsed = false;
            fix.detectChanges();

            expect(accordion.panels[0].collapsed).toBeTrue();
            expect(accordion.panels[1].collapsed).toBeFalse();
            expect(accordion.panels[2].collapsed).toBeFalse();
            expect(accordion.panels[3].collapsed).toBeFalse();

            accordion.singleBranchExpand = true;
            fix.detectChanges();

            expect(accordion.panels[0].collapsed).toBeTrue();
            expect(accordion.panels[1].collapsed).toBeTrue();
            expect(accordion.panels[2].collapsed).toBeFalse();
            expect(accordion.panels[3].collapsed).toBeFalse();
        });

        it('Should emit ing and ed events when expand panel state is toggled', fakeAsync(() => {
            spyOn(accordion.panelExpanded, 'emit').and.callThrough();
            spyOn(accordion.panelExpanding, 'emit').and.callThrough();
            spyOn(accordion.panelCollapsed, 'emit').and.callThrough();
            spyOn(accordion.panelCollapsing, 'emit').and.callThrough();

            spyOn(accordion.panels[0].contentCollapsing, 'emit').and.callThrough();
            spyOn(accordion.panels[0].contentCollapsed, 'emit').and.callThrough();
            spyOn(accordion.panels[0].contentExpanding, 'emit').and.callThrough();
            spyOn(accordion.panels[0].contentExpanded, 'emit').and.callThrough();

            accordion.singleBranchExpand = false;
            fix.detectChanges();

            let argsEd: IAccordionEventArgs;
            let argsIng: IAccordionCancelableEventArgs;
            const subsExpanded = accordion.panels[0].contentExpanded.subscribe(expArgs => {
                argsEd = { event: expArgs.event, owner: accordion, panel: expArgs.owner };
            });

            const subsExpanding = accordion.panels[0].contentExpanding.subscribe(expArgs => {
                argsIng = { event: expArgs.event, cancel: expArgs.cancel, owner: accordion, panel: expArgs.owner };
            });
            accordion.panels[0].expand();
            tick();
            fix.detectChanges();

            expect(accordion.panelExpanding.emit).toHaveBeenCalledTimes(1);
            expect(accordion.panelExpanding.emit).toHaveBeenCalledWith(argsIng);
            expect(accordion.panelExpanded.emit).toHaveBeenCalledTimes(1);
            expect(accordion.panelExpanded.emit).toHaveBeenCalledWith(argsEd);

            subsExpanded.unsubscribe();
            subsExpanding.unsubscribe();

            const subsCollapsed = accordion.panels[0].contentCollapsed.subscribe(expArgs => {
                argsEd = { event: expArgs.event, owner: accordion, panel: expArgs.owner };
            });

            const subsCollapsing = accordion.panels[0].contentCollapsing.subscribe(expArgs => {
                argsIng = { event: expArgs.event, cancel: expArgs.cancel, owner: accordion, panel: expArgs.owner };
            });
            accordion.panels[0].collapse();
            tick();
            fix.detectChanges();

            expect(accordion.panelCollapsing.emit).toHaveBeenCalledTimes(1);
            expect(accordion.panelCollapsing.emit).toHaveBeenCalledWith(argsIng);
            expect(accordion.panelCollapsed.emit).toHaveBeenCalledTimes(1);
            expect(accordion.panelCollapsed.emit).toHaveBeenCalledWith(argsEd);

            subsCollapsed.unsubscribe();
            subsCollapsing.unsubscribe();
        }));


        it('Should focus the first/last panel on Home/End key press', () => {
            accordion.panels[2].header.disabled = true;
            fix.detectChanges();
            accordion.panels[1].header.elementRef.nativeElement.dispatchEvent(new Event('pointerdown'));
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('home', accordion.panels[1].header.innerElement);
            fix.detectChanges();

            expect(accordion.panels[0].header.innerElement).toBe(document.activeElement);

            UIInteractions.triggerKeyDownEvtUponElem('end', accordion.panels[0].header.innerElement);
            fix.detectChanges();

            expect(accordion.panels[1].header.innerElement).toBe(document.activeElement);
        });

        it('Should focus the correct panel on ArrowDown/ArrowUp key pressed', () => {
            accordion.panels[1].header.disabled = true;
            fix.detectChanges();
            accordion.panels[0].header.elementRef.nativeElement.children[0].dispatchEvent(new Event('pointerdown'));
            fix.detectChanges();

            // ArrowDown
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown', accordion.panels[0].header.innerElement);
            fix.detectChanges();

            expect(accordion.panels[2].header.innerElement).toBe(document.activeElement);

            // ArrowUp
            UIInteractions.triggerKeyDownEvtUponElem('arrowup', accordion.panels[2].header.innerElement);
            fix.detectChanges();

            expect(accordion.panels[0].header.innerElement).toBe(document.activeElement);
        });

        it(`Should expand/collapse all panels on SHIFT + ALT + ArrowDown/ArrowUp key pressed
                when singleBranchExpanded is false`, fakeAsync(() => {
            accordion.singleBranchExpand = false;
            fix.detectChanges();
            accordion.panels[1].header.disabled = true;
            fix.detectChanges();

            accordion.panels[0].header.elementRef.nativeElement.dispatchEvent(new Event('pointerdown'));
            fix.detectChanges();

            //  SHIFT + ALT + ArrowDown
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown',
                accordion.panels[0].header.innerElement, true, true, true, false);
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(p => !p.collapsed && !p.header.disabled).length).toEqual(2);
            expect(accordion.panels.filter(p => !p.collapsed).length).toEqual(3);

            //  SHIFT + ALT + ArrowUp
            UIInteractions.triggerKeyDownEvtUponElem('arrowup',
                accordion.panels[0].header.innerElement, true, true, true, false);
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(p => p.collapsed && !p.header.disabled).length).toEqual(2);
            expect(accordion.panels.filter(p => p.collapsed).length).toEqual(3);
        }));

        it(`Should do nothing/collapse the only panel on SHIFT + ALT + ArrowDown/ArrowUp key pressed
                when singleBranchExpanded is true`, fakeAsync(() => {
            accordion.singleBranchExpand = true;
            fix.detectChanges();

            accordion.panels[0].header.elementRef.nativeElement.dispatchEvent(new Event('pointerdown'));
            fix.detectChanges();

            //  SHIFT + ALT + ArrowDown
            UIInteractions.triggerKeyDownEvtUponElem('arrowdown',
                accordion.panels[0].header.innerElement, true, true, true, false);
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(p => !p.collapsed).length).toEqual(2);

            //  SHIFT + ALT + ArrowUp
            UIInteractions.triggerKeyDownEvtUponElem('arrowup',
                accordion.panels[0].header.innerElement, true, true, true, false);
            tick();
            fix.detectChanges();

            expect(accordion.panels.filter(p => p.collapsed).length).toEqual(3);
        }));

        it('Should not handle keys that are not used for navigation', () => {
            const header = accordion.panels[0].header.innerElement;
            header.focus();
            fix.detectChanges();

            const keyboardEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
            header.dispatchEvent(keyboardEvent);
            fix.detectChanges();

            expect(keyboardEvent.defaultPrevented).toBeFalse();
            expect(document.activeElement).toBe(header);
        });

        it('Should keep the focus on the first/last enabled panel on ArrowUp/ArrowDown key press', () => {
            // panels[3] header is disabled, so panels[2] is the last enabled panel
            const firstHeader = accordion.panels[0].header.innerElement;
            const lastHeader = accordion.panels[2].header.innerElement;
            firstHeader.focus();
            fix.detectChanges();

            const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
            firstHeader.dispatchEvent(arrowUpEvent);
            fix.detectChanges();

            expect(arrowUpEvent.defaultPrevented).toBeTrue();
            expect(document.activeElement).toBe(firstHeader);

            lastHeader.focus();
            fix.detectChanges();

            const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
            lastHeader.dispatchEvent(arrowDownEvent);
            fix.detectChanges();

            expect(arrowDownEvent.defaultPrevented).toBeTrue();
            expect(document.activeElement).toBe(lastHeader);
        });

        it('Should focus the correct panel on legacy Up/Down key press', () => {
            accordion.panels[0].header.innerElement.focus();
            fix.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('down', accordion.panels[0].header.innerElement);
            fix.detectChanges();

            expect(document.activeElement).toBe(accordion.panels[1].header.innerElement);

            UIInteractions.triggerKeyDownEvtUponElem('up', accordion.panels[1].header.innerElement);
            fix.detectChanges();

            expect(document.activeElement).toBe(accordion.panels[0].header.innerElement);
        });

        it('Should not expand a panel when panelExpanding is canceled', fakeAsync(() => {
            const panel = accordion.panels[0];
            spyOn(accordion.panelExpanded, 'emit').and.callThrough();
            spyOn(panel.contentExpanded, 'emit').and.callThrough();
            const sub = accordion.panelExpanding.subscribe((args: IAccordionCancelableEventArgs) => {
                expect(args.owner).toBe(accordion);
                expect(args.panel).toBe(panel);
                args.cancel = true;
            });

            panel.expand();
            tick();
            fix.detectChanges();

            expect(panel.collapsed).toBeTrue();
            expect(panel.contentExpanded.emit).not.toHaveBeenCalled();
            expect(accordion.panelExpanded.emit).not.toHaveBeenCalled();

            sub.unsubscribe();

            panel.expand();
            tick();
            fix.detectChanges();

            expect(panel.collapsed).toBeFalse();
            expect(accordion.panelExpanded.emit).toHaveBeenCalledTimes(1);
        }));

        it('Should not collapse a panel when panelCollapsing is canceled', fakeAsync(() => {
            const panel = accordion.panels[2];
            expect(panel.collapsed).toBeFalse();
            spyOn(accordion.panelCollapsed, 'emit').and.callThrough();
            spyOn(panel.contentCollapsed, 'emit').and.callThrough();
            const sub = accordion.panelCollapsing.subscribe((args: IAccordionCancelableEventArgs) => {
                expect(args.owner).toBe(accordion);
                expect(args.panel).toBe(panel);
                args.cancel = true;
            });

            panel.collapse();
            tick();
            fix.detectChanges();

            expect(panel.collapsed).toBeFalse();
            expect(panel.contentCollapsed.emit).not.toHaveBeenCalled();
            expect(accordion.panelCollapsed.emit).not.toHaveBeenCalled();

            sub.unsubscribe();

            panel.collapse();
            tick();
            fix.detectChanges();

            expect(panel.collapsed).toBeTrue();
            expect(accordion.panelCollapsed.emit).toHaveBeenCalledTimes(1);
        }));

        it(`Should collapse the expanded panel when another one is expanded and singleBranchExpand is true,
        without collapsing panels with disabled headers`, fakeAsync(() => {
            accordion.singleBranchExpand = true;
            fix.detectChanges();
            // panels[2] is the last expanded enabled panel; panels[3] has a disabled header
            expect(accordion.panels[2].collapsed).toBeFalse();
            expect(accordion.panels[3].collapsed).toBeFalse();

            spyOn(accordion.panelCollapsed, 'emit').and.callThrough();

            accordion.panels[0].expand();
            tick();
            fix.detectChanges();

            expect(accordion.panels[0].collapsed).toBeFalse();
            expect(accordion.panels[1].collapsed).toBeTrue();
            expect(accordion.panels[2].collapsed).toBeTrue();
            expect(accordion.panels[3].collapsed).toBeFalse();
            expect(accordion.panelCollapsed.emit).toHaveBeenCalledTimes(1);
            expect(accordion.panelCollapsed.emit).toHaveBeenCalledWith(jasmine.objectContaining({
                owner: accordion,
                panel: accordion.panels[2]
            }));
        }));

        it('Should collapse a panel that is still expanding when another one is expanded and singleBranchExpand is true',
            fakeAsync(() => {
                accordion.singleBranchExpand = true;
                fix.detectChanges();

                accordion.panels[0].expand();
                // panels[0] open animation is still running
                expect(accordion.panels[0].openAnimationPlayer).toBeTruthy();
                accordion.panels[1].expand();
                tick();
                fix.detectChanges();

                expect(accordion.panels[0].collapsed).toBeTrue();
                expect(accordion.panels[1].collapsed).toBeFalse();
                expect(accordion.panels[2].collapsed).toBeTrue();
                expect(accordion.panels[3].collapsed).toBeFalse();
            }));

        it(`Should reset the open animation of a panel that is still expanding when another one is expanded,
        singleBranchExpand is true and there is no close animation`, fakeAsync(() => {
            accordion.singleBranchExpand = true;
            accordion.animationSettings = { openAnimation: growVerIn, closeAnimation: null };
            fix.detectChanges();

            const expandingPanel = accordion.panels[0];
            expandingPanel.expand();
            const openPlayer = expandingPanel.openAnimationPlayer;
            expect(openPlayer).toBeTruthy();
            spyOn(openPlayer, 'reset').and.callThrough();

            accordion.panels[1].expand();

            expect(openPlayer.reset).toHaveBeenCalled();
            // collapsing without animation completes synchronously
            expect(expandingPanel.collapsed).toBeTrue();

            tick();
            fix.detectChanges();

            expect(accordion.panels[0].collapsed).toBeTrue();
            expect(accordion.panels[1].collapsed).toBeFalse();
        }));

        it(`Should collapse a panel that is still expanding when another one is expanded, singleBranchExpand is true
        and the open animation is removed during expansion`, fakeAsync(() => {
            accordion.singleBranchExpand = true;
            fix.detectChanges();

            accordion.panels[0].expand();
            expect(accordion.panels[0].openAnimationPlayer).toBeTruthy();

            accordion.animationSettings = { openAnimation: null, closeAnimation: growVerOut };
            accordion.panels[1].expand();
            tick();
            fix.detectChanges();

            expect(accordion.panels[0].collapsed).toBeTrue();
            expect(accordion.panels[1].collapsed).toBeFalse();
        }));
    });
});

describe('Accordion with singleBranchExpand set initially', () => {
    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxAccordionSingleBranchTestComponent,
                    IgxAccordionSingleBranchForTestComponent
                ]
            }).compileComponents();
        })
    );

    const verifyOnlyLastEnabledPanelExpanded = (accordion: IgxAccordionComponent) => {
        expect(accordion.singleBranchExpand).toBeTrue();
        // panels[3] has a disabled header and keeps its expansion state
        const expectedCollapsed = [true, false, true, false];
        accordion.panels.forEach((panel, index) => {
            expect(panel.collapsed).toBe(expectedCollapsed[index]);
            expect(panel.nativeElement.getAttribute('aria-expanded')).toEqual(`${!expectedCollapsed[index]}`);
        });
    };

    it('Should collapse all expanded and not disabled panels except for the last one on init', () => {
        const fix = TestBed.createComponent(IgxAccordionSingleBranchTestComponent);
        fix.detectChanges();

        verifyOnlyLastEnabledPanelExpanded(fix.componentInstance.accordion);
    });

    it('Should collapse all expanded and not disabled panels except for the last one on init when panels are rendered with @for', () => {
        const fix = TestBed.createComponent(IgxAccordionSingleBranchForTestComponent);
        fix.detectChanges();

        verifyOnlyLastEnabledPanelExpanded(fix.componentInstance.accordion);
    });
});

describe('Accordion with bound inputs and dynamic panels', () => {
    let fix: ComponentFixture<IgxAccordionDynamicTestComponent>;
    let accordion: IgxAccordionComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    NoopAnimationsModule,
                    IgxAccordionDynamicTestComponent
                ]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fix = TestBed.createComponent(IgxAccordionDynamicTestComponent);
        fix.detectChanges();
        accordion = fix.componentInstance.accordion;
    });

    it('Should apply the bound id to the host element', () => {
        expect(accordion.id).toEqual('bound-accordion');
        expect(fix.debugElement.query(By.directive(IgxAccordionComponent)).nativeElement.id).toEqual('bound-accordion');
    });

    it('Should apply initially bound animationSettings to all panels', () => {
        expect(accordion.panels.length).toEqual(4);
        accordion.panels.forEach(panel => {
            expect(panel.animationSettings).toBe(fix.componentInstance.animationSettings);
        });
    });

    it('Should not emit panelExpanding when the panel expansion is already canceled', fakeAsync(() => {
        const panel = accordion.panels[2];
        spyOn(accordion.panelExpanding, 'emit').and.callThrough();
        spyOn(accordion.panelExpanded, 'emit').and.callThrough();
        fix.componentInstance.cancelContentExpanding = true;

        panel.expand();
        tick();
        fix.detectChanges();

        expect(panel.collapsed).toBeTrue();
        expect(accordion.panelExpanding.emit).not.toHaveBeenCalled();
        expect(accordion.panelExpanded.emit).not.toHaveBeenCalled();
    }));

    it('Should subscribe to events of panels added and removed at runtime', fakeAsync(() => {
        spyOn(accordion.panelExpanding, 'emit').and.callThrough();
        spyOn(accordion.panelExpanded, 'emit').and.callThrough();
        spyOn(accordion.panelCollapsed, 'emit').and.callThrough();

        fix.componentInstance.panels.update(panels => [...panels, { id: 'added', title: 'Added', collapsed: true, disabled: false }]);
        fix.detectChanges();

        expect(accordion.panels.length).toEqual(5);
        const addedPanel = accordion.panels[4];
        expect(addedPanel.id).toEqual('added');

        addedPanel.expand();
        tick();
        fix.detectChanges();

        expect(addedPanel.collapsed).toBeFalse();
        expect(accordion.panelExpanding.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({
            owner: accordion,
            panel: addedPanel
        }));
        expect(accordion.panelExpanded.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({
            owner: accordion,
            panel: addedPanel
        }));

        // keyboard navigation includes the added panel
        accordion.panels[0].header.innerElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('end', accordion.panels[0].header.innerElement);
        fix.detectChanges();

        expect(document.activeElement).toBe(addedPanel.header.innerElement);

        fix.componentInstance.panels.update(panels => panels.slice(1));
        fix.detectChanges();

        expect(accordion.panels.length).toEqual(4);
        expect(accordion.panels[0].id).toEqual('css');

        UIInteractions.triggerKeyDownEvtUponElem('home', addedPanel.header.innerElement);
        fix.detectChanges();

        expect(document.activeElement).toBe(accordion.panels[0].header.innerElement);

        // re-subscribing after the change must not duplicate the emitted events
        addedPanel.collapse();
        tick();
        fix.detectChanges();

        expect(addedPanel.collapsed).toBeTrue();
        expect(accordion.panelCollapsed.emit).toHaveBeenCalledOnceWith(jasmine.objectContaining({
            owner: accordion,
            panel: addedPanel
        }));
    }));
});

@Component({
    template: `
    <igx-accordion>
        <igx-expansion-panel id="html5" [collapsed]="true">
            <igx-expansion-panel-header [disabled]="false">
                <igx-expansion-panel-title>HTML5</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>
                <igx-accordion>
                    <igx-expansion-panel>
                        <igx-expansion-panel-header [disabled]="false">
                            <igx-expansion-panel-title>First</igx-expansion-panel-title>
                        </igx-expansion-panel-header>
                        <igx-expansion-panel-body>
                            <div>
                                Content1
                            </div>
                        </igx-expansion-panel-body>
                    </igx-expansion-panel>
                    <igx-expansion-panel>
                        <igx-expansion-panel-header [disabled]="false">
                            <igx-expansion-panel-title>Second</igx-expansion-panel-title>
                        </igx-expansion-panel-header>
                        <igx-expansion-panel-body>
                            <div>
                                Content2
                            </div>
                        </igx-expansion-panel-body>
                    </igx-expansion-panel>
                </igx-accordion>
            </igx-expansion-panel-body>
        </igx-expansion-panel>
        <igx-expansion-panel id="css" [collapsed]="true">
            <igx-expansion-panel-header [disabled]="false">
                <igx-expansion-panel-title>CSS3</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>
                <div>
                    Cascading Style Sheets (CSS) is a style sheet language used for
                    describing the presentation of a document written in a markup language
                    like HTML
                </div>
            </igx-expansion-panel-body>
        </igx-expansion-panel>
        <igx-expansion-panel id="scss" [collapsed]="false">
            <igx-expansion-panel-header [disabled]="false">
                <igx-expansion-panel-title>SASS/SCSS</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>
                <div>
                    Sass is a preprocessor scripting language that is interpreted or
                    compiled into Cascading Style Sheets (CSS).
                </div>
            </igx-expansion-panel-body>
        </igx-expansion-panel>
        <igx-expansion-panel id="js" [collapsed]="false">
            <igx-expansion-panel-header [disabled]="true">
                <igx-expansion-panel-title>Javascript</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>
                <div>
                    JavaScript is the world's most popular programming language.
                    JavaScript is the programming language of the Web.
                </div>
            </igx-expansion-panel-body>
        </igx-expansion-panel>
        @if (divChild) {
            <div></div>
        }
    </igx-accordion>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxAccordionComponent, IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxExpansionPanelBodyComponent, IgxExpansionPanelTitleDirective]
})
export class IgxAccordionSampleTestComponent {
    @ViewChild(IgxAccordionComponent) public accordion: IgxAccordionComponent;
    public divChild = true;
}

@Component({
    template: `
    <igx-accordion singleBranchExpand>
        <igx-expansion-panel [collapsed]="false">
            <igx-expansion-panel-header>
                <igx-expansion-panel-title>HTML5</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>HTML5 content</igx-expansion-panel-body>
        </igx-expansion-panel>
        <igx-expansion-panel [collapsed]="false">
            <igx-expansion-panel-header>
                <igx-expansion-panel-title>CSS3</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>CSS3 content</igx-expansion-panel-body>
        </igx-expansion-panel>
        <igx-expansion-panel [collapsed]="true">
            <igx-expansion-panel-header>
                <igx-expansion-panel-title>SASS/SCSS</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>SASS/SCSS content</igx-expansion-panel-body>
        </igx-expansion-panel>
        <igx-expansion-panel [collapsed]="false">
            <igx-expansion-panel-header [disabled]="true">
                <igx-expansion-panel-title>Javascript</igx-expansion-panel-title>
            </igx-expansion-panel-header>
            <igx-expansion-panel-body>Javascript content</igx-expansion-panel-body>
        </igx-expansion-panel>
    </igx-accordion>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxAccordionComponent, IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxExpansionPanelBodyComponent, IgxExpansionPanelTitleDirective]
})
export class IgxAccordionSingleBranchTestComponent {
    @ViewChild(IgxAccordionComponent) public accordion: IgxAccordionComponent;
}

@Component({
    template: `
    <igx-accordion [singleBranchExpand]="true">
        @for (panel of panels(); track panel.id) {
            <igx-expansion-panel [id]="panel.id" [collapsed]="panel.collapsed">
                <igx-expansion-panel-header [disabled]="panel.disabled">
                    <igx-expansion-panel-title>{{ panel.title }}</igx-expansion-panel-title>
                </igx-expansion-panel-header>
                <igx-expansion-panel-body>
                    <div>{{ panel.title }} content</div>
                </igx-expansion-panel-body>
            </igx-expansion-panel>
        }
    </igx-accordion>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxAccordionComponent, IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxExpansionPanelBodyComponent, IgxExpansionPanelTitleDirective]
})
export class IgxAccordionSingleBranchForTestComponent {
    @ViewChild(IgxAccordionComponent) public accordion: IgxAccordionComponent;
    public panels = signal(PANELS_DATA);
}

@Component({
    template: `
    <igx-accordion id="bound-accordion" [animationSettings]="animationSettings">
        @for (panel of panels(); track panel.id) {
            <igx-expansion-panel [id]="panel.id" [collapsed]="panel.collapsed"
                (contentExpanding)="onContentExpanding($event)">
                <igx-expansion-panel-header [disabled]="panel.disabled">
                    <igx-expansion-panel-title>{{ panel.title }}</igx-expansion-panel-title>
                </igx-expansion-panel-header>
                <igx-expansion-panel-body>
                    <div>{{ panel.title }} content</div>
                </igx-expansion-panel-body>
            </igx-expansion-panel>
        }
    </igx-accordion>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IgxAccordionComponent, IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent, IgxExpansionPanelBodyComponent, IgxExpansionPanelTitleDirective]
})
export class IgxAccordionDynamicTestComponent {
    @ViewChild(IgxAccordionComponent) public accordion: IgxAccordionComponent;
    public cancelContentExpanding = false;
    public animationSettings: ToggleAnimationSettings = {
        openAnimation: useAnimation(slideInLeft, { params: { duration: '100ms' } }),
        closeAnimation: useAnimation(slideOutRight, { params: { duration: '100ms' } })
    };
    public panels = signal(PANELS_DATA);

    public onContentExpanding(event: IExpansionPanelCancelableEventArgs): void {
        // registered before the accordion subscriptions, so the accordion receives an already canceled event
        if (this.cancelContentExpanding) {
            event.cancel = true;
        }
    }
}
