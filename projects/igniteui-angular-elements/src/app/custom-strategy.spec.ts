import { ApplicationRef, importProvidersFrom } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { createApplication } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { IgxColumnComponent, IgxGridComponent, IgxHierarchicalGridComponent } from 'igniteui-angular';
import { timer } from 'rxjs';
import { registerConfig } from '../analyzer/elements.config';
import { createIgxCustomElement } from './create-custom-element';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';
import hgridData from '../assets/data/projects-hgrid.js';

describe('Elements: ', () => {
    let testContainer: HTMLDivElement;
    let appRef: ApplicationRef;

    beforeAll(async () =>{
        appRef = await createApplication({ providers: [ importProvidersFrom(BrowserTestingModule, NoopAnimationsModule) ]});

        const column = createIgxCustomElement<IgxColumnComponent>(IgxColumnComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-column", column);
        const grid = createIgxCustomElement<IgxGridComponent>(IgxGridComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-grid", grid);
        const hgrid = createIgxCustomElement<IgxHierarchicalGridComponent>(IgxHierarchicalGridComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-hierarchical-grid", hgrid);
    });

    beforeEach(async () => {
        testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
    });

    afterAll(() => {
        appRef.destroy();
    })

    describe('IgxCustomNgElementStrategy', () => {
        // TODO: Add Selectors to `registerConfig` & use the config to exercise all component relations, prop handling, etc
        // OR test strategy handling with dummy test component + config
        it(`should populate parent's content query`, async () => {
            const gridEl = document.createElement("igc-grid") as any as IgcNgElement;
            testContainer.appendChild(gridEl);
            const columnEl = document.createElement("igc-column") as IgcNgElement;
            gridEl.appendChild(columnEl);

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await timer(10 /* SCHEDULE_DELAY */ * 2).toPromise();

            const gridComponent = (await gridEl.ngElementStrategy[ComponentRefKey]).instance as IgxGridComponent;
            const columnComponent = (await columnEl.ngElementStrategy[ComponentRefKey]).instance as IgxColumnComponent;
            expect(gridComponent.columnList.toArray()).toContain(columnComponent);
        });
    });

    describe('Grid integration scenarios.', () => {
        it(`should populate hgrid's view initially when there are no layouts`, async () => {
            const hgridEl = document.createElement("igc-hierarchical-grid") as any as IgcNgElement;
            testContainer.appendChild(hgridEl);

            const columnProjectId = document.createElement("igc-column") as IgcNgElement;
            columnProjectId.setAttribute("field", "ProjectId");
            hgridEl.appendChild(columnProjectId);
            const columnName = document.createElement("igc-column") as IgcNgElement;
            columnName.setAttribute("field", "Name");
            hgridEl.appendChild(columnName);
            const columnStartDate = document.createElement("igc-column") as IgcNgElement;
            columnStartDate.setAttribute("field", "StartDate");
            hgridEl.appendChild(columnStartDate);

            const hgridComponent = (await hgridEl.ngElementStrategy[ComponentRefKey]).instance as IgxHierarchicalGridComponent;
            hgridComponent.data = hgridData;

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await timer(10 /* SCHEDULE_DELAY */ * 2).toPromise();

            expect(hgridComponent.dataView.length).toBeGreaterThan(0);
        });
    });
});
