import { useAnimation } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { waitForAsync, TestBed, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { slideInLeft, slideOutRight } from '../animations/slide';
import { IgxExpansionPanelModule } from '../expansion-panel/expansion-panel.module';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxAccordionComponent } from './accordion.component';
import { IgxAccordionModule } from './accordion.module';

const ACCORDION_CLASS = 'igx-accordion__root';
const PANEL_TAG = 'IGX-EXPANSION-PANEL';
const CSS_CLASS_EXPANSION_PANEL = 'igx-expansion-panel';
const ACCORDION_TAG = 'IGX-ACCORDION';

describe('Rendering Tests', () => {
    configureTestSuite();
    let fix: ComponentFixture<IgxAccordionSampleTestComponent>;
    let accordion: IgxAccordionComponent;
    beforeAll(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxAccordionSampleTestComponent,],
                imports: [
                    NoopAnimationsModule,
                    IgxAccordionModule,
                    IgxExpansionPanelModule
                ]
            }).compileComponents();
        })
    );
    beforeEach(() => {
        fix = TestBed.createComponent<IgxAccordionSampleTestComponent>(IgxAccordionSampleTestComponent);
        fix.detectChanges();
        accordion = fix.componentInstance.accordion;
    });

    describe('General', () => {
        fit('Should render accordion with expansion panels', () => {
            const accordionElement: HTMLElement = fix.debugElement.queryAll(By.css(`.${ACCORDION_CLASS}`))[0].nativeElement;
            const childPanels = accordionElement.children;
            expect(childPanels.length).toBe(3);
            for (let i = 0; i < childPanels.length; i++) {
                expect(childPanels.item(i).tagName === PANEL_TAG);
            }
        });

        it('Should calculate accordion`s panels correctly', () => {
            expect(accordion.panels.length).toEqual(3);
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
            fix.detectChanges();

            accordion.animationSettings = animationSettingsCustom;
            fix.detectChanges();

            for (let i = 0; i < 3; i++) {
                expect(accordion.panels[i].animationSettings.closeAnimation.options.params.duration).toEqual('100ms');
            }
        });

        it('Should be able to render nested accordions', () => {
            const panelBody = accordion.panels[0].nativeElement.querySelector('.' + CSS_CLASS_EXPANSION_PANEL).children[1];
            expect(panelBody.children[0].tagName == ACCORDION_TAG);
        });
    });
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
    <div *ngIf="divChild"></div>
</igx-accordion>

`
})
export class IgxAccordionSampleTestComponent {
    @ViewChild(IgxAccordionComponent) public accordion: IgxAccordionComponent;
    public divChild = true;
}
