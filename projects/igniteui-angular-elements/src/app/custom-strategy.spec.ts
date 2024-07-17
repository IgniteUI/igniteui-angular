/// <reference path="app.module.ts" />
import { ApplicationRef, importProvidersFrom } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { IgxColumnComponent, IgxGridComponent, IgxHierarchicalGridComponent, IgxPaginatorComponent } from 'igniteui-angular';
import { firstValueFrom, fromEvent, skip, timer } from 'rxjs';
import { registerConfig } from '../analyzer/elements.config';
import { createIgxCustomElement } from './create-custom-element';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';
import hgridData from '../assets/data/projects-hgrid.js';
import { SampleTestData } from 'igniteui-angular/src/lib/test-utils/sample-test-data.spec';
import { ELEMENTS_TOKEN } from 'igniteui-angular/src/lib/core/utils';

describe('Elements: ', () => {
    let testContainer: HTMLDivElement;
    let appRef: ApplicationRef;

    beforeAll(async () =>{
        appRef = await createApplication({ providers: [
            importProvidersFrom(BrowserTestingModule, NoopAnimationsModule),
            { provide: ELEMENTS_TOKEN, useValue: true }
        ]});

        const column = createIgxCustomElement<IgxColumnComponent>(IgxColumnComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-column", column);
        const grid = createIgxCustomElement<IgxGridComponent>(IgxGridComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-grid", grid);
        const hgrid = createIgxCustomElement<IgxHierarchicalGridComponent>(IgxHierarchicalGridComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-hierarchical-grid", hgrid);
        const paginator = createIgxCustomElement<IgxPaginatorComponent>(IgxPaginatorComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-paginator", paginator);
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
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

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
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            expect(hgridComponent.dataView.length).toBeGreaterThan(0);
        });

        it(`should populate grid's view initially with paginator added`, async () => {
            const gridEl = document.createElement("igc-grid");

            const columnID = document.createElement("igc-column");
            columnID.setAttribute("field", "ProductID");
            gridEl.appendChild(columnID);
            const columnName = document.createElement("igc-column");
            columnName.setAttribute("field", "ProductName");
            gridEl.appendChild(columnName);

            const paginator = document.createElement("igc-paginator");
            paginator.setAttribute("per-page", "3");
            gridEl.appendChild(paginator);

            gridEl.data = SampleTestData.foodProductData();
            testContainer.appendChild(gridEl);

            // First grid template eval (includes pipes, not a fixed time) projects child nodes and attach them back to the DOM.
            // That sets up the paginator and runs another template w/ pipes, rendered won't do, so wait for second data changed
            await firstValueFrom(fromEvent(gridEl, 'dataChanged').pipe(skip(1)));

            expect(gridEl.dataView.length).toEqual(3);
            expect(paginator.totalRecords).toEqual(gridEl.data.length);
        });
    });
});
