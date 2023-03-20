import { ApplicationRef, importProvidersFrom } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { IgxColumnComponent, IgxGridComponent } from 'projects/igniteui-angular/src/lib/grids/grid/public_api';
import { resizeObserverIgnoreError } from 'projects/igniteui-angular/src/lib/test-utils/helper-utils.spec';
import { timer } from 'rxjs';
import { registerConfig } from '../analyzer/elements.config';
import { createIgxCustomElement } from './create-custom-element';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';

describe('IgxCustomNgElementStrategy', () => {
    let testContainer: HTMLDivElement;
    let appRef: ApplicationRef;

    beforeEach(async () => {
        testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
        appRef = await createApplication({ providers: [ importProvidersFrom(BrowserTestingModule, NoopAnimationsModule) ]});
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
        appRef.destroy();
    });

    // TODO: Add Selectors to `registerConfig` & use the config to exercise all component relations, prop handling, etc
    // OR test strategy handling with dummy test component + config
    it(`should populate parent's content query`, async () => {
        resizeObserverIgnoreError();
        const grid = createIgxCustomElement<IgxGridComponent>(IgxGridComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-grid", grid);
        const column = createIgxCustomElement<IgxColumnComponent>(IgxColumnComponent, { injector: appRef.injector, registerConfig });
        customElements.define("igc-column", column);

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
