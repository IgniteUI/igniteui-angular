import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '12.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    const migrationName = 'migration-21';
    const lineBreaksAndSpaceRegex = /\s/g;

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    // IgxOverlayService
    it('should update overlay events subscriptions', async () => {
        appTree.create(
            '/testSrc/appPrefix/service/test.component.ts',
`import { IgxOverlayService } from '../../../dist/igniteui-angular';
export class SimpleComponent {
    public overlayService: IgxOverlayService);

    public myFunction() {
        this.overlayService.onOpening.subscribe();
        this.overlayService.onOpened.subscribe();
        this.overlayService.onClosing.subscribe();
        this.overlayService.onClosed.subscribe();
        this.overlayService.onAppended.subscribe();
        this.overlayService.onAnimation.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/service/test.component.ts'))
            .toEqual(
`import { IgxOverlayService } from '../../../dist/igniteui-angular';
export class SimpleComponent {
    public overlayService: IgxOverlayService);

    public myFunction() {
        this.overlayService.opening.subscribe();
        this.overlayService.opened.subscribe();
        this.overlayService.closing.subscribe();
        this.overlayService.closed.subscribe();
        this.overlayService.contentAppended.subscribe();
        this.overlayService.animationStarting.subscribe();
    }
}`);
    });

    it('should update banner event subscriptions in .ts file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts', `
import { IgxBannerComponent } from '../../../dist/igniteui-angular';
export class TestComponent {
    public banner: IgxBannerComponent;

    public myFunction() {
        this.banner.onOpening.subscribe();
        this.banner.onOpened.subscribe();
        this.banner.onClosing.subscribe();
        this.banner.onClosed.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(`
import { IgxBannerComponent } from '../../../dist/igniteui-angular';
export class TestComponent {
    public banner: IgxBannerComponent;

    public myFunction() {
        this.banner.opening.subscribe();
        this.banner.opened.subscribe();
        this.banner.closing.subscribe();
        this.banner.closed.subscribe();
    }
}`);
    });

    it('should update banner event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-banner
    (onOpening)="handleEvent($event, 'opening')"
    (onOpened)="handleEvent($event, 'opened')"
    (onClosing)="handleEvent($event, 'closing')"
    (onClosed)="handleEvent($event, 'closed')"
>
    Display something onOpening, onClosing, onOpened, onClosed
</igx-banner>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-banner
    (opening)="handleEvent($event, 'opening')"
    (opened)="handleEvent($event, 'opened')"
    (closing)="handleEvent($event, 'closing')"
    (closed)="handleEvent($event, 'closed')"
>
    Display something onOpening, onClosing, onOpened, onClosed
</igx-banner>`);
    });

    it('should update expansion panel event subscriptions in .ts file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts', `
import { IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public panel: IgxExpansionPanelComponent
    public header: IgxExpansionPanelHeaderComponent

    public myFunction() {
        this.panel.onExpanded.subscribe();
        this.panel.onCollapsed.subscribe();
        this.header.onInteraction.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(`
import { IgxExpansionPanelComponent, IgxExpansionPanelHeaderComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public panel: IgxExpansionPanelComponent
    public header: IgxExpansionPanelHeaderComponent

    public myFunction() {
        this.panel.contentExpanded.subscribe();
        this.panel.contentCollapsed.subscribe();
        this.header.interaction.subscribe();
    }
}`);
    });

    it('should update mask event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<input igxInput type="text" [igxMask]="'(####) 00-00-00 Ext. 9999'" (onValueChange)="handleEvent()" />`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<input igxInput type="text" [igxMask]="'(####) 00-00-00 Ext. 9999'" (valueChanged)="handleEvent()" />`);
    });

    it('should update mask event subscriptions .ts file', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
`import { IgxMaskDirective } from '../../../dist/igniteui-angular';

export class TestComponent {
    public mask: IgxMaskDirective;

    public myFunction() {
        this.mask.onValueChange.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(
`import { IgxMaskDirective } from '../../../dist/igniteui-angular';

export class TestComponent {
    public mask: IgxMaskDirective;

    public myFunction() {
        this.mask.valueChanged.subscribe();
    }
}`);
    });


    it('should update expansion panel event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-expansion-panel (onExpanded)="handleExpanded($event)" (onCollapsed)="handleCollapsed($event)">
    <igx-expansion-panel-header (onInteraction)="handleInteraction($event)">
        Trigger something onInteraction and onExpanded and onCollapsed
    </igx-expansion-panel-header>
</igx-expansion-panel>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-expansion-panel (contentExpanded)="handleExpanded($event)" (contentCollapsed)="handleCollapsed($event)">
    <igx-expansion-panel-header (interaction)="handleInteraction($event)">
        Trigger something onInteraction and onExpanded and onCollapsed
    </igx-expansion-panel-header>
</igx-expansion-panel>`);
    });

    it('Should remove references to deprecated `banner` property of `BannerEventArgs`', async () => {
    appTree.create(
        '/testSrc/appPrefix/component/test.component.ts',
`import { BannerEventArgs } from '../../../dist/igniteui-angular';

export class BannerTestComponent {

    public onBannerOpened(event: BannerEventArgs) {
        console.log(event.banner);
    }
}`);

    const tree = await schematicRunner
        .runSchematicAsync(migrationName, {}, appTree)
        .toPromise();
    const expectedContent =
`import { BannerEventArgs } from '../../../dist/igniteui-angular';

export class BannerTestComponent {

    public onBannerOpened(event: BannerEventArgs) {
        console.log(event.owner);
    }
}`;
    expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(expectedContent);
});
    it('should remove paging property and define a igx-paginator component instead', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-grid #grid1 [data]="data" [paging]="someVal" [perPage]="10" height="300px" width="300px">
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
        <igx-grid #grid1 [data]="data" [perPage]="10" height="300px" width="300px">
<igx-paginator *ngIf="someVal"></igx-paginator>
            <igx-column field="Name" header="Athlete"></igx-column>
            <igx-column field="TrackProgress" header="Track Progress"></igx-column>
            <igx-column field="CountryFlag" header="Country"></igx-column>
        </igx-grid>`);
    });

    it('should remove paging and paginationTemplate property and define a igx-paginator component with custom content', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-grid #grid1 [data]="data" [paging]="true" [paginationTemplate]="customPager" height="300px" width="300px">
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
<ng-template #customPager let-api>
<div class="igx-grid__footer">
    <div id="numberPager" class="igx-paginator" style="justify-content: center;">
        <button [disabled]="firstPage" (click)="previousPage()" igxButton="flat">PREV</button>
        <button [disabled]="lastPage" (click)="nextPage()" igxButton="flat">NEXT</button>
    </div>
</div>
</ng-template>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html').replace(lineBreaksAndSpaceRegex, ''))
            .toEqual(`
<igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-paginator>
<!-- Auto migrated template content. Please, check your bindings! -->

<igx-paginator-content>

<div class="igx-grid__footer">
    <div id="numberPager" class="igx-paginator" style="justify-content: center;">
        <button [disabled]="firstPage" (click)="previousPage()" igxButton="flat">PREV</button>
        <button [disabled]="lastPage" (click)="nextPage()" igxButton="flat">NEXT</button>
    </div>
</div>

        </igx-paginator-content>
</igx-paginator>
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
`.replace(lineBreaksAndSpaceRegex, ''));
    });

    it('should remove paging property and define a igx-paginator component instead in hGrid', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-hierarchical-grid [paging]="parentPaging">
    <igx-column></igx-column>
    <igx-row-island [paging]="childPaging">
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(`
<igx-hierarchical-grid>
<igx-paginator *ngIf="parentPaging"></igx-paginator>
    <igx-column></igx-column>
    <igx-row-island>
<igx-paginator *igxPaginator *ngIf="childPaging"></igx-paginator>
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>`);
    });

    it('should remove paging property and paginationTemplate in hGrid', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-hierarchical-grid [paging]="parentPaging" [paginationTemplate]="myTemplate">
    <igx-column></igx-column>
    <igx-row-island [paging]="childPaging" [paginationTemplate]="childTemplate">
        <igx-column></igx-column>
    </igx-row-island>
</igx-hierarchical-grid>
<ng-template #myTemplate>
    <div>
        Current page: {{ hierarchicalGrid.page }}
    </div>
</ng-template>
<ng-template #childTemplate>
    <div>
        <button (click)="previous()">PREV</button>
        Current page: {{ hierarchicalGrid.page }}
        <button (click)="next()">NEXT</button>
    </div>
</ng-template>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html').replace(lineBreaksAndSpaceRegex, ''))
            .toEqual(`
<igx-hierarchical-grid>
<igx-paginator *ngIf="parentPaging">
<!-- Auto migrated template content. Please, check your bindings! -->

<igx-paginator-content>

    <div>
        Current page: {{ hierarchicalGrid.page }}
    </div>

        </igx-paginator-content>
</igx-paginator>
    <igx-column></igx-column>
    <igx-row-island>
<igx-paginator *igxPaginator  *ngIf="childPaging">

<!-- Auto migrated template content. Please, check your bindings! -->

<igx-paginator-content>

    <div>
        <button (click)="previous()">PREV</button>
        Current page: {{ hierarchicalGrid.page }}
        <button (click)="next()">NEXT</button>
    </div>

        </igx-paginator-content>
</igx-paginator>

    <igx-column></igx-column>
    </igx-row-island>
    </igx-hierarchical-grid>`.replace(lineBreaksAndSpaceRegex, ''));
    });

    it('should define correctly paginator when using the component inside custom template', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
<igx-grid #grid1 [data]="data" [paging]="true" [paginationTemplate]="customPager" height="300px" width="300px">
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
<ng-template #customPager let-api>
<igx-paginator #paginator [(page)]="grid.page" [totalRecords]="grid.totalRecords" [(perPage)]="grid.perPage"
   [selectOptions]="selectOptions" [displayDensity]="grid.displayDensity">
        </igx-paginator>
</ng-template>`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html').replace(lineBreaksAndSpaceRegex, ''))
            .toEqual(`
<igx-grid #grid1 [data]="data" height="300px" width="300px">
<igx-paginator #paginator [(page)]="grid.page" [totalRecords]="grid.totalRecords" [(perPage)]="grid.perPage"
[selectOptions]="selectOptions" [displayDensity]="grid.displayDensity">
</igx-paginator>
    <igx-column field="Name" header="Athlete"></igx-column>
    <igx-column field="TrackProgress" header="Track Progress"></igx-column>
    <igx-column field="CountryFlag" header="Country"></igx-column>
</igx-grid>
`.replace(lineBreaksAndSpaceRegex, ''));
    });

    // IgxDropDown
    it('should update IgxDropDown event subscriptions', async () => {
        appTree.create(
            'testSrc/appPrefix/component/test.component.ts',
`import { IgxDropDownComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public dropdown: IgxDropDownComponent;

    public myFunction() {
        this.dropdown.onOpening.subscribe();
        this.dropdown.onOpened.subscribe();
        this.dropdown.onClosing.subscribe();
        this.dropdown.onClosed.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
                .toEqual(

`import { IgxDropDownComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public dropdown: IgxDropDownComponent;

    public myFunction() {
        this.dropdown.opening.subscribe();
        this.dropdown.opened.subscribe();
        this.dropdown.closing.subscribe();
        this.dropdown.closed.subscribe();
    }
}`);
    });

    it('should update dropdown event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-drop-down
            (onOpening)="handleEvent($event, 'opening')"
            (onOpened)="handleEvent($event, 'opened')"
            (onClosing)="handleEvent($event, 'closing')"
            (onClosed)="handleEvent($event, 'closed')"
            (onSelection)="handleEvent($event, 'selection')"
        >
            Display something onOpening, onClosing, onOpened, onClosed
        </igx-drop-down>`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
                .toPromise();
            expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                .toEqual(`
        <igx-drop-down
            (opening)="handleEvent($event, 'opening')"
            (opened)="handleEvent($event, 'opened')"
            (closing)="handleEvent($event, 'closing')"
            (closed)="handleEvent($event, 'closed')"
            (selectionChanging)="handleEvent($event, 'selection')"
        >
            Display something onOpening, onClosing, onOpened, onClosed
        </igx-drop-down>`);
    });

    // IgxToggleDirective
    it('should update IgxToggleDirective event subscriptions', async () => {
        appTree.create(
            'testSrc/appPrefix/component/test.component.ts',
`import { IgxToggleDirective } from '../../../dist/igniteui-angular';

export class TestComponent {
    public toggle: IgxToggleDirective;

    public myFunction() {
        this.toggle.onOpening.subscribe();
        this.toggle.onOpen.subscribe();
        this.toggle.onClosing.subscribe();
        this.toggle.onClosed.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
                .toEqual(

`import { IgxToggleDirective } from '../../../dist/igniteui-angular';

export class TestComponent {
    public toggle: IgxToggleDirective;

    public myFunction() {
        this.toggle.opening.subscribe();
        this.toggle.open.subscribe();
        this.toggle.closing.subscribe();
        this.toggle.closed.subscribe();
    }
}`);

    });

    it('should update dropdown event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
            <div igxToggle
                (onOpening)="eventHandler($event)"
                (onAppended)="eventHandler($event)"
                (onOpened)="eventHandler($event)"
                (onClosing)="eventHandler($event)"
                (onClosed)="eventHandler($event)"
            >
                <p>Some content that user would like to make it togglable.</p>
            </div>`);
                const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
                    .toPromise();

                expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                    .toEqual(`
            <div igxToggle
                (opening)="eventHandler($event)"
                (appended)="eventHandler($event)"
                (opened)="eventHandler($event)"
                (closing)="eventHandler($event)"
                (closed)="eventHandler($event)"
            >
                <p>Some content that user would like to make it togglable.</p>
            </div>`);
    });

    // IgxCombo
    it('should update IgxCombo event subscriptions', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
`import { IgxComboComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public combo: IgxComboComponent;

    public myFunction() {
        this.combo.onSelectionChange.subscribe();
        this.combo.onSearchInput.subscribe();
        this.combo.onAddition.subscribe();
        this.combo.onDataPreLoad.subscribe();
        this.combo.onOpening.subscribe();
        this.combo.onOpened.subscribe();
        this.combo.onClosing.subscribe();
        this.combo.onClosed.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(
`import { IgxComboComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public combo: IgxComboComponent;

    public myFunction() {
        this.combo.selectionChanging.subscribe();
        this.combo.searchInputUpdate.subscribe();
        this.combo.addition.subscribe();
        this.combo.dataPreLoad.subscribe();
        this.combo.opening.subscribe();
        this.combo.opened.subscribe();
        this.combo.closing.subscribe();
        this.combo.closed.subscribe();
    }
}`);
    });

    it('should update combo event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
                <igx-combo
                    (onSelectionChange)="eventHandler($event)"
                    (onSearchInput)="eventHandler($event)"
                    (onAddition)="eventHandler($event)"
                    (onDataPreLoad)="eventHandler($event)"
                    (onOpening)="eventHandler($event)"
                    (onOpened)="eventHandler($event)"
                    (onClosing)="eventHandler($event)"
                    (onClosed)="eventHandler($event)"
                >
                </igx-combo>`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                .toEqual(`
                <igx-combo
                    (selectionChanging)="eventHandler($event)"
                    (searchInputUpdate)="eventHandler($event)"
                    (addition)="eventHandler($event)"
                    (dataPreLoad)="eventHandler($event)"
                    (opening)="eventHandler($event)"
                    (opened)="eventHandler($event)"
                    (closing)="eventHandler($event)"
                    (closed)="eventHandler($event)"
                >
                </igx-combo>`);
    });

    // IgxSelect
    it('should update IgxSelect event subscriptions', async () => {
        appTree.create(
            'testSrc/appPrefix/component/test.component.ts',
`import { IgxSelectComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public select: IgxSelectComponent;

    public myFunction() {
        this.select.onOpening.subscribe();
        this.select.onOpened.subscribe();
        this.select.onClosing.subscribe();
        this.select.onClosed.subscribe();
        this.select.onSelection.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
                .toEqual(

`import { IgxSelectComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public select: IgxSelectComponent;

    public myFunction() {
        this.select.opening.subscribe();
        this.select.opened.subscribe();
        this.select.closing.subscribe();
        this.select.closed.subscribe();
        this.select.selectionChanging.subscribe();
    }
}`);

    });

    it('should update select event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
                <igx-select
                    (onOpening)="eventHandler($event)"
                    (onOpened)="eventHandler($event)"
                    (onClosing)="eventHandler($event)"
                    (onClosed)="eventHandler($event)"
                    (onSelection)="eventHandler($event)"
                >
                </igx-select>`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                .toEqual(`
                <igx-select
                    (opening)="eventHandler($event)"
                    (opened)="eventHandler($event)"
                    (closing)="eventHandler($event)"
                    (closed)="eventHandler($event)"
                    (selectionChanging)="eventHandler($event)"
                >
                </igx-select>`);
    });

    // IgxAutocomplete
    it('should update IgxAutocomplete event subscriptions', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
`import { IgxAutocompleteDirective } from '../../../dist/igniteui-angular';

export class TestComponent {
    public autocomplete: IgxAutocompleteDirective

    public myFunction() {
        this.autocomplete.onItemSelected.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(
`import { IgxAutocompleteDirective } from '../../../dist/igniteui-angular';

export class TestComponent {
    public autocomplete: IgxAutocompleteDirective

    public myFunction() {
        this.autocomplete.selectionChanging.subscribe();
    }
}`);
    });

    it('should update autocomplete event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
            <input
                igxInput
                [igxAutocomplete]="townsPanel"
                (onItemSelected)='selectionChanging($event)'
            />`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                .toEqual(`
            <input
                igxInput
                [igxAutocomplete]="townsPanel"
                (selectionChanging)='selectionChanging($event)'
            />`);
    });

    // IgxDialog
    it('should update IgxDialog event subscriptions', async () => {
        appTree.create(
            'testSrc/appPrefix/component/test.component.ts',
`import { IgxDialogComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public dialog: IgxDialogComponent;

    public myFunction() {
        this.dialog.onOpen.subscribe();
        this.dialog.onOpened.subscribe();
        this.dialog.onClose.subscribe();
        this.dialog.onClosed.subscribe();
        this.dialog.onLeftButtonSelect.subscribe();
        this.dialog.onRightButtonSelect.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
                .toEqual(

`import { IgxDialogComponent } from '../../../dist/igniteui-angular';

export class TestComponent {
    public dialog: IgxDialogComponent;

    public myFunction() {
        this.dialog.opening.subscribe();
        this.dialog.opened.subscribe();
        this.dialog.closing.subscribe();
        this.dialog.closed.subscribe();
        this.dialog.leftButtonSelect.subscribe();
        this.dialog.rightButtonSelect.subscribe();
    }
}`);
    });

    it('should update dialog event subscriptions in .html file', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html', `
        <igx-dialog
            (onOpen)="eventHandler($event)"
            (onOpened)="eventHandler($event)"
            (onClose)="eventHandler($event)"
            (onClosed)="eventHandler($event)"
            (onLeftButtonSelect)="eventHandler($event)"
            (onRightButtonSelect)="eventHandler($event)"
        >
        </igx-dialog>`);
            const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
                .toEqual(`
        <igx-dialog
            (opening)="eventHandler($event)"
            (opened)="eventHandler($event)"
            (closing)="eventHandler($event)"
            (closed)="eventHandler($event)"
            (leftButtonSelect)="eventHandler($event)"
            (rightButtonSelect)="eventHandler($event)"
        >
        </igx-dialog>`);
    });

    // CellType
    it('Should update cell component types with CellType', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/cells.component.ts', `
        import { IgxGridComponent, IgxGridCellComponent, IgxHierarchicalGridCellComponent,
            IgxTreeGridCellComponent, IgxGridExpandableCellComponent } from 'igniteui-angular';
        export class HGridMultiRowDragComponent {
            public onDropAllowed(args: IDropDroppedEventArgs)
                const hierRow: RowType = args.dragData;
                const row: RowType = args.dragData;
                const treeRow: RowType = args.dragData;
                const cells: IgxGridCellComponent[] = row.cells;
                const tells: IgxTreeGridCellComponent[] = treeRow.cells;
                const hcells: IgxHierarchicalGridCellComponent[] = hierRow.cells;
            }
            public ngOnInit() {
                const cell: this.grid1.getCellByColumn(0, "ContactName") as IgxGridCellComponent;
                const cell2: this.grid1.getCellByColumnVisibleIndex(0, 2) as IgxTreeGridCellComponent;
                const cell3: this.grid1.getCellByKey(0, "Age") as IgxHierarchicalGridCellComponent;

                const cells = grid.selectedCells as IgxGridCellComponent[];
            }
        }`);
    const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

            expect(tree.readContent('/testSrc/appPrefix/component/cells.component.ts'))
                .toEqual(`
        import { IgxGridComponent, CellType } from 'igniteui-angular';
        export class HGridMultiRowDragComponent {
            public onDropAllowed(args: IDropDroppedEventArgs)
                const hierRow: RowType = args.dragData;
                const row: RowType = args.dragData;
                const treeRow: RowType = args.dragData;
                const cells: CellType[] = row.cells;
                const tells: CellType[] = treeRow.cells;
                const hcells: CellType[] = hierRow.cells;
            }
            public ngOnInit() {
                const cell: this.grid1.getCellByColumn(0, "ContactName") as CellType;
                const cell2: this.grid1.getCellByColumnVisibleIndex(0, 2) as CellType;
                const cell3: this.grid1.getCellByKey(0, "Age") as CellType;

                const cells = grid.selectedCells as CellType[];
            }
        }`);
    });

    // Transaction providers
    it('Should add a comment for the deprecated IgxGridTransactionToken', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/transaction.component.ts', `
        import { IgxGridComponent, IgxGridTransaction, IgxTransactionService } from 'igniteui-angular';
        @Component({
            template: '',
            providers: [{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
        })
        export class TransactionComponent {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public IgxGridTransaction!: IgxGridComponent;
        }`);
    const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/transaction.component.ts'))
            .toEqual(`
        import { IgxGridComponent, IgxGridTransaction, IgxTransactionService } from 'igniteui-angular';
        @Component({
            template: '',
            providers: [/* Injection token 'IgxGridTransaction' has been deprecated. Please refer to the update guide for more details. */
{ provide: IgxGridTransaction, useClass: IgxTransactionService }]
        })
        export class TransactionComponent {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public IgxGridTransaction!: IgxGridComponent;
        }`);
    });

    it('Should add a comment for the deprecated IgxGridTransactionToken, multiple providers', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/transaction.component.ts', `
        import { IgxGridComponent, IgxGridTransaction, IgxTransactionService } from 'igniteui-angular';
        @Component({
            template: '',
            providers: [
                { provider: A, useClass: AService },
                { provide: IgxGridTransaction, useClass: IgxTransactionService },
                { provider: B, useClass: BService}
            ]
        })
        export class TransactionComponent {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public IgxGridTransaction!: IgxGridComponent;
        }`);
    const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/transaction.component.ts'))
            .toEqual(`
        import { IgxGridComponent, IgxGridTransaction, IgxTransactionService } from 'igniteui-angular';
        @Component({
            template: '',
            providers: [
                { provider: A, useClass: AService },
                /* Injection token 'IgxGridTransaction' has been deprecated. Please refer to the update guide for more details. */
{ provide: IgxGridTransaction, useClass: IgxTransactionService },
                { provider: B, useClass: BService}
            ]
        })
        export class TransactionComponent {
            @ViewChild(IgxGridComponent, { read: IgxGridComponent })
            public IgxGridTransaction!: IgxGridComponent;
        }`);
    });

    it('Should properly rename IComboSelectionChangeEventArgs to IComboSelectionChangingEventArgs',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IComboSelectionChangeEventArgs } from 'igniteui-angular';
        export class MyClass {
            public eventArgs: IComboSelectionChangeEventArgs;
        }
        `);

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { IComboSelectionChangingEventArgs } from 'igniteui-angular';
        export class MyClass {
            public eventArgs: IComboSelectionChangingEventArgs;
        }
        `
        );
    });

    it('Should properly rename AutocompleteItemSelectionEventArgs to AutocompleteSelectionChangingEventArgs',  async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { AutocompleteItemSelectionEventArgs } from 'igniteui-angular';
        export class MyClass {
            public eventArgs: AutocompleteItemSelectionEventArgs;
        }
        `);

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { AutocompleteSelectionChangingEventArgs } from 'igniteui-angular';
        export class MyClass {
            public eventArgs: AutocompleteSelectionChangingEventArgs;
        }
        `
        );
    });
});

