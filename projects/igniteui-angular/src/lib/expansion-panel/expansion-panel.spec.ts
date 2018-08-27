import { Component, ViewChild, OnInit, ElementRef, DebugElement } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxExpansionPanelModule } from './expansion-panel.module';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';

const CSS_CLASS_PANEL = 'igx-expansion-panel';
const CSS_CLASS_HEADER = 'igx-expansion-panel__header';
const CSS_CLASS_HEADER_COLLAPSED = 'igx-expansion-panel__header--collapsed';
const CSS_CLASS_HEADER_EXPANDED = 'igx-expansion-panel__header--expanded';

describe('IgxExpansionPanel', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxExpansionPanelSampleComponent
            ],
            imports: [
                IgxExpansionPanelModule,
                BrowserAnimationsModule,
                NoopAnimationsModule,
            ]
        })
            .compileComponents();
    }));

    describe('Unit Tests', () => {
        it('Should properly initialize', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            expect(fixture.componentInstance.panel).toBeDefined();
        });

        it('Should properly set base classes', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.panel;
            const header = document.getElementsByClassName(CSS_CLASS_HEADER);
            const headerCollapsed = document.getElementsByClassName(CSS_CLASS_HEADER_COLLAPSED);
            const headerExpanded = document.getElementsByClassName(CSS_CLASS_HEADER_EXPANDED);
            const panelClass = document.getElementsByClassName(CSS_CLASS_PANEL);
            expect(header.length).toEqual(1);
            expect(headerCollapsed.length).toEqual(1); // Initially collapsed;
            expect(headerExpanded.length).toEqual(0);
            expect(panelClass.length).toEqual(1);
            expect(header[0]).toEqual(headerCollapsed[0]); // Both classes are applied to the header
        });

        it('Should properly initialize input properties and handle change', () => {
            const fixture = TestBed.createComponent(IgxExpansionPanelSampleComponent);
            fixture.detectChanges();
            const panel = fixture.componentInstance.panel;
            expect(panel).toBeDefined();
            expect(panel.disabled).toBeFalsy();
            expect(panel.collapsed).toBeTruthy();
            fixture.componentInstance.collapsed = false;
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();
            expect(panel.disabled).toBeTruthy();
            expect(panel.collapsed).toBeFalsy();
        })
    })
})

@Component({
    template: `
    <igx-expansion-panel
        (onExpanded)="handleExpand($event)"
        (onCollapsed)="handleCollapse($event)"
        [disabled]="disabled"
        [collapsed]="collapsed"
    >
        <igx-expansion-panel-header
            (onInterraction)="handleHeaderInterraction($event)">
            <igx-expansion-panel-title>Title</igx-expansion-panel-title>
            <igx-expansion-panel-description>Short description</igx-expansion-panel-description>
        </igx-expansion-panel-header>
        <igx-expansion-panel-body>
            This is the body of the expansion panel
        </igx-expansion-panel-body>
    </igx-expansion-panel>`
})
class IgxExpansionPanelSampleComponent {

    public collapsed = true;
    public disabled = false;
    public handleExpand(evt: {event?: Event}) {
    }
    public handeCollapsed(evt: {event?: Event}) {

    }
    @ViewChild(IgxExpansionPanelComponent, { read: IgxExpansionPanelComponent })
    public panel: IgxExpansionPanelComponent;
}