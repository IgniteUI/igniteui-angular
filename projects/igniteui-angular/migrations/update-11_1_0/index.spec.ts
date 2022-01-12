import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update to 11.1.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                root: '',
                sourceRoot: '/src',
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    const TSConfig = {
        compilerOptions: {
            baseUrl: "./",
            importHelpers: true,
            module: "es2020",
            outDir: "./dist/out-tsc",
            sourceMap: true,
            moduleResolution: "node",
            target: "es2015",
            rootDir: "."
        },
        angularCompilerOptions: {
            generateDeepReexports: true,
            strictTemplates: true,
            fullTemplateTypeCheck: true,
            strictInjectionParameters: true
        }
    };

    const migrationName = 'migration-19';

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
        appTree.create('/tsconfig.json', JSON.stringify(TSConfig));
        appTree.create('/src/main.ts', "");
    });

    it('should update fontSet to family', async () => {
        appTree.create(
            `/src/appPrefix/component/icon.component.html`,
            '<igx-icon fontSet="material">settings</igx-icon>'
        );

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/src/appPrefix/component/icon.component.html')
        ).toEqual('<igx-icon family="material">settings</igx-icon>');
    });

    it('should update isActive to active', async () => {
        appTree.create(
            `/src/appPrefix/component/icon.component.html`,
            '<igx-icon [isActive]="false">settings</igx-icon>'
        );

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/src/appPrefix/component/icon.component.html')
        ).toEqual('<igx-icon [active]="false">settings</igx-icon>');
    });

    it('should migrate updated getter names in IgxIconName', async () => {
        appTree.create(
            '/src/appPrefix/component/icon-test.component.ts',
`import { IgxIconComponent } from '../../../dist/igniteui-angular';

export class IconTestComponent {
    private icon: IgxIconComponent;

    public myFunction() {
        const name = this.icon.getIconName;
        const family = this.icon.getFontSet;
        const color = this.icon.getIconColor;
    }
}
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { IgxIconComponent } from '../../../dist/igniteui-angular';

export class IconTestComponent {
    private icon: IgxIconComponent;

    public myFunction() {
        const name = this.icon.getName;
        const family = this.icon.getFamily;
        const color = this.icon.getColor;
    }
}
`;
        console.log(tree.readContent(
            '/src/appPrefix/component/icon-test.component.ts'
        ));

        expect(
            tree.readContent(
                '/src/appPrefix/component/icon-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should migrate updated members names for IgxIconService', async () => {
        appTree.create(
            '/src/appPrefix/component/icon-test.component.ts',
`import { IgxIconService } from '../../../dist/igniteui-angular';

export class IconTestComponent {
    public iconService: IgxIconService;

    public myFunction() {
        const font = this.iconService.defaultFontSet;
        const className = this.iconService.fontSetClassName('material');
        const alias = this.iconService.registerFontSetAlias('material', 'material-icons');
    }
}
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { IgxIconService } from '../../../dist/igniteui-angular';

export class IconTestComponent {
    public iconService: IgxIconService;

    public myFunction() {
        const font = this.iconService.defaultFamily;
        const className = this.iconService.familyClassName('material');
        const alias = this.iconService.registerFamilyAlias('material', 'material-icons');
    }
}
`;

        expect(
            tree.readContent(
                '/src/appPrefix/component/icon-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should replace on-prefixed outputs in chip and chips-area', async () => {
        appTree.create(
            `/src/appPrefix/component/chips.component.html`,
            `<igx-chips-area #chipsAreaTo class="chipAreaTo"
                (onReorder)="chipsOrderChangedTo($event)"
                (onSelection)="chipsSelectionChanged($event)"
                (onMoveStart)="chipsMoveStart($event)"
                (onMoveEnd)="chipsMoveEnd($event)">
                <igx-chip *ngFor="let chip of chipListTo"
                    [id]="chip.id"
                    [draggable]="true"
                    (onClick)="chipClicked()"
                    (onRemove)="chipRemoved()"
                    (onKeyDown)="chipKeyDown()"
                    (onDragEnter)="dragEnter()"
                    (onSelection)="chipSelection()"
                    (onSelectionDone)="chipSelectionDone()"
                    (onMoveStart)="onMoveStartTo()"
                    (onMoveEnd)="moveEndedTo()">
                    <igx-avatar igxPrefix class="chip-area-avatar"></igx-avatar>
                    <span>{{chip.text}}</span>
                </igx-chip>
            </igx-chips-area>`
        );
        const tree = await runner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/src/appPrefix/component/chips.component.html'))
            .toEqual(`<igx-chips-area #chipsAreaTo class="chipAreaTo"
                (reorder)="chipsOrderChangedTo($event)"
                (selectionChange)="chipsSelectionChanged($event)"
                (moveStart)="chipsMoveStart($event)"
                (moveEnd)="chipsMoveEnd($event)">
                <igx-chip *ngFor="let chip of chipListTo"
                    [id]="chip.id"
                    [draggable]="true"
                    (chipClick)="chipClicked()"
                    (remove)="chipRemoved()"
                    (keyDown)="chipKeyDown()"
                    (dragEnter)="dragEnter()"
                    (selectedChanging)="chipSelection()"
                    (selectedChanged)="chipSelectionDone()"
                    (moveStart)="onMoveStartTo()"
                    (moveEnd)="moveEndedTo()">
                    <igx-avatar igxPrefix class="chip-area-avatar"></igx-avatar>
                    <span>{{chip.text}}</span>
                </igx-chip>
            </igx-chips-area>`);
    });

    it('should replace IgxTabsComponent event name onTabItemSelected with tabItemSelected', async () => {
        appTree.create(
            `/src/appPrefix/component/tabs.component.html`,
            `<igx-tabs (onTabItemSelected)="tabSelected()"></igx-tabs>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/tabs.component.html')
        ).toEqual(`<igx-tabs (tabItemSelected)="tabSelected()"></igx-tabs>`);
    });

    it('should replace IgxTabsComponent event name onTabItemDeselected with tabItemDeselected', async () => {
        appTree.create(
            `/src/appPrefix/component/tabs.component.html`,
            `<igx-tabs (onTabItemDeselected)="tabDeselected()"></igx-tabs>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/tabs.component.html')
        ).toEqual(`<igx-tabs (tabItemDeselected)="tabDeselected()"></igx-tabs>`);
    });

    it('should replace IgxListComponent event name onLeftPan with leftPan', async () => {
        appTree.create(
            `/src/appPrefix/component/list.component.html`,
            `<igx-list [allowLeftPanning]="true" (onLeftPan)="leftPanPerformed($event)">`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list [allowLeftPanning]="true" (leftPan)="leftPanPerformed($event)">`);
    });

    it('should replace IgxListComponent event name onRightPan with rightPan', async () => {
        appTree.create(
            `/src/appPrefix/component/list.component.html`,
            `<igx-list [allowRightPanning]="true" (onRightPan)="rightPanPerformed($event)">`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list [allowRightPanning]="true" (rightPan)="rightPanPerformed($event)">`);
    });

    it('should replace IgxListComponent event name onPanStateChange with panStateChange', async () => {
        appTree.create(
            `/src/appPrefix/component/list.component.html`,
            `<igx-list (onPanStateChange)="panStateChange($event)"></igx-list>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list (panStateChange)="panStateChange($event)"></igx-list>`);
    });

    it('should replace IgxListComponent event name OnItemClicked with itemClicked', async () => {
        appTree.create(
            `/src/appPrefix/component/list.component.html`,
            `<igx-list (onItemClicked)="onItemClicked($event)"></igx-list>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/list.component.html')
        ).toEqual(`<igx-list (itemClicked)="onItemClicked($event)"></igx-list>`);
    });

    it('should replace IgxNavbarComponent event name onAction with action', async () => {
        appTree.create(
            `/src/appPrefix/component/navbar.component.html`,
            `<igx-navbar (onAction)="actionExc($event)" title="Sample App" actionButtonIcon="menu"></igx-navbar>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/navbar.component.html')
        ).toEqual(`<igx-navbar (action)="actionExc($event)" title="Sample App" actionButtonIcon="menu"></igx-navbar>`);
    });

    it('should update Excel exporter onExportEnded event name to exportEnded', async () => {
        appTree.create(
            '/src/appPrefix/component/excel-export.component.ts',
`import { IgxExcelExporterService } from "../../../dist/igniteui-angular";

export class ExcelExportComponent {
    public excelService: IgxExcelExporterService;
    public myFunction() {
        this.excelService.onExportEnded.subscribe();
    }
}
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { IgxExcelExporterService } from "../../../dist/igniteui-angular";

export class ExcelExportComponent {
    public excelService: IgxExcelExporterService;
    public myFunction() {
        this.excelService.exportEnded.subscribe();
    }
}
`;

        expect(
            tree.readContent(
                '/src/appPrefix/component/excel-export.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should update CSV exporter onExportEnded event name to exportEnded', async () => {
        appTree.create(
            '/src/appPrefix/component/csv-export.component.ts',
`import { IgxCsvExporterService } from "../../../dist/igniteui-angular";

export class CsvExportComponent {
    public csvES: IgxCsvExporterService;

    public myFunction() {
        this.csvES.onExportEnded.subscribe();
    }
}
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { IgxCsvExporterService } from "../../../dist/igniteui-angular";

export class CsvExportComponent {
    public csvES: IgxCsvExporterService;

    public myFunction() {
        this.csvES.exportEnded.subscribe();
    }
}
`;
        expect(
            tree.readContent(
                '/src/appPrefix/component/csv-export.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should replace onSelect and onUnselect with selected and deselected in igx-buttongroup', async () => {
        appTree.create(
            `/src/appPrefix/component/buttongroup.component.html`,
            `<igx-buttongroup
                (onSelect)="someHandler($event)"
                (onUnselect)="someHandler($event)"
            >
            </igx-buttongroup>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/buttongroup.component.html')).toEqual(
            `<igx-buttongroup
                (selected)="someHandler($event)"
                (deselected)="someHandler($event)"
            >
            </igx-buttongroup>`
        );
    });

    it('should replace onAction with clicked in igx-snackbar', async () => {
        appTree.create(
            `/src/appPrefix/component/snackbar.component.html`,
            `<igx-snackbar (onAction)="someHandler($event)"></igx-snackbar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/snackbar.component.html')).toEqual(
            `<igx-snackbar (clicked)="someHandler($event)"></igx-snackbar>`
        );
    });

    it('should replace onShowing, onShown, onHiding, onHidden with showing, shown, hiding, hidden in igx-toast', async () => {
        appTree.create(
            `/src/appPrefix/component/toast.component.html`,
            `<igx-toast
                (onShowing)="someHandler($event)"
                (onShown)="someHandler($event)"
                (onHiding)="someHandler($event)"
                (onHidden)="someHandler($event)"
            >
            </igx-toast>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/toast.component.html')).toEqual(
            `<igx-toast
                (showing)="someHandler($event)"
                (shown)="someHandler($event)"
                (hiding)="someHandler($event)"
                (hidden)="someHandler($event)"
            >
            </igx-toast>`
        );
    });

    it('should replace IgxTooltipTargetDirective event names onTooltipShow and onTooltipHide with tooltipShow and tooltipHide',
        async () => {
            appTree.create(
            `/src/appPrefix/component/tooltip.component.html`,
    `<button [igxTooltipTarget]="tooltipRef" (onTooltipShow)="showing($event)" (onTooltipHide)="hiding($event)">
        Hover me
    </button>
    <div igxTooltip #tooltipRef="tooltip">
        Hello, I am a tooltip!
    </div>`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/tooltip.component.html')
        ).toEqual(
    `<button [igxTooltipTarget]="tooltipRef" (tooltipShow)="showing($event)" (tooltipHide)="hiding($event)">
        Hover me
    </button>
    <div igxTooltip #tooltipRef="tooltip">
        Hello, I am a tooltip!
    </div>`);
    });

    it('should replace outputs with selected in igx-calendar', async () => {
        appTree.create(
            `/src/appPrefix/component/calendar.component.html`,
`<igx-calendar
    (onSelection)="someHandler($event)"
    (onViewChanging)="someHandler($event)"
    (onDateSelection)="someHandler($event)"
    (onYearSelection)="someHandler($event)"
    (onMonthSelection)="someHandler($event)"
></igx-calendar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/calendar.component.html')).toEqual(
`<igx-calendar
    (selected)="someHandler($event)"
    (viewChanging)="someHandler($event)"
    (dateSelection)="someHandler($event)"
    (yearSelection)="someHandler($event)"
    (monthSelection)="someHandler($event)"
></igx-calendar>`
        );
    });

    it('should replace onSelection and onYearSelection with selected in igx-years-view', async () => {
        appTree.create(
            `/src/appPrefix/component/yearsview.component.html`,
`<igx-years-view
    (onSelection)="changeYear($event)"
    (onYearSelection)="changeYear($event)"
></igx-years-view>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/yearsview.component.html')).toEqual(
`<igx-years-view
    (selected)="changeYear($event)"
    (yearSelection)="changeYear($event)"
></igx-years-view>`
        );
    });

    it('should replace onDateSelection and onViewChanging with selected in igx-days-view', async () => {
        appTree.create(
            `/src/appPrefix/component/daysview.component.html`,
`<igx-days-view
    (onDateSelection)="someHandler($event)"
    (onViewChanging)="someHandler($event)"
></igx-days-view>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/daysview.component.html')).toEqual(
`<igx-days-view
    (dateSelection)="someHandler($event)"
    (viewChanging)="someHandler($event)"
></igx-days-view>`
        );
    });

    it('should replace onSelection and onMonthSelection with selected in igx-months-view', async () => {
        appTree.create(
            `/src/appPrefix/component/monthsview.component.html`,
`<igx-months-view
    (onSelection)="someHandler($event)"
    (onMonthSelection)="someHandler($event)"
></igx-months-view>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/monthsview.component.html')).toEqual(
`<igx-months-view
    (selected)="someHandler($event)"
    (monthSelection)="someHandler($event)"
></igx-months-view>`
        );
    });

    it('should replace onSelection and onMonthSelection with selected in igx-month-picker', async () => {
        appTree.create(
            `/src/appPrefix/component/monthpicker.component.html`,
`<igx-month-picker
    (onSelection)="someHandler($event)"
></igx-month-picker>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/src/appPrefix/component/monthpicker.component.html')).toEqual(
`<igx-month-picker
    (selected)="someHandler($event)"
></igx-month-picker>`
        );
    });

    it('should update Excel exporter onColumnExport and onRowExport event names to columnmExporting and rowExporting', async () => {
        appTree.create(
            '/src/appPrefix/component/excel-export.component.ts',
`import { IgxExcelExporterService } from "../../../dist/igniteui-angular";

export class ExcelExportComponent {
    public excelES: IgxExcelExporterService;

    public myFunction() {
        this.excelES.onColumnExport.subscribe();
        this.excelES.onRowExport.subscribe();
    }
}
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { IgxExcelExporterService } from "../../../dist/igniteui-angular";

export class ExcelExportComponent {
    public excelES: IgxExcelExporterService;

    public myFunction() {
        this.excelES.columnExporting.subscribe();
        this.excelES.rowExporting.subscribe();
    }
}
`;

        expect(
            tree.readContent(
                '/src/appPrefix/component/excel-export.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should update CSV exporter onColumnExport and onRowExport event names to columnmExporting and rowExporting', async () => {
        appTree.create(
            '/src/appPrefix/component/csv-export.component.ts',
`import { IgxCsvExporterService } from "../../../dist/igniteui-angular";

export class CsvExportComponent {
    public csvES: IgxCsvExporterService;

    public myFunction() {
        this.csvES.onColumnExport.subscribe();
        this.csvES.onRowExport.subscribe();
    }
}
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { IgxCsvExporterService } from "../../../dist/igniteui-angular";

export class CsvExportComponent {
    public csvES: IgxCsvExporterService;

    public myFunction() {
        this.csvES.columnExporting.subscribe();
        this.csvES.rowExporting.subscribe();
    }
}
`;
        expect(
            tree.readContent(
                '/src/appPrefix/component/csv-export.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should update GridPagingMode enum from lowerCase to TitleCase', async () => {
        appTree.create(
            '/src/appPrefix/component/paging-test.component.ts',
`import { GridPagingMode } from "../../../dist/igniteui-angular";

export class PagingComponent {
    public gridPM: GridPagingMode;

    public myFunction() {
        public pagingLocal = this.gridPM.local;
        public pagingRemote = this.gridPM.remote;
    }
}
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent =
`import { GridPagingMode } from "../../../dist/igniteui-angular";

export class PagingComponent {
    public gridPM: GridPagingMode;

    public myFunction() {
        public pagingLocal = this.gridPM.Local;
        public pagingRemote = this.gridPM.Remote;
    }
}
`;
        expect(
            tree.readContent(
                '/src/appPrefix/component/paging-test.component.ts'
            )
        ).toEqual(expectedContent);
    });
});
