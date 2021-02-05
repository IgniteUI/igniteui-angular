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
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    const migrationName = 'migration-19';

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update fontSet to family', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/icon.component.html`,
            '<igx-icon fontSet="material">settings</igx-icon>'
        );

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/icon.component.html')
        ).toEqual('<igx-icon family="material">settings</igx-icon>');
    });

    it('should update isActive to active', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/icon.component.html`,
            '<igx-icon [isActive]="false">settings</igx-icon>'
        );

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/icon.component.html')
        ).toEqual('<igx-icon [active]="false">settings</igx-icon>');
    });

    it('should migrate updated getter names', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/icon-test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
import { IgxIconModule, IgxIconComponent } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    @ViewChild(IgxIconComponent, { static: true })
    private icon: IgxIconComponent;

    constructor() {
        const name = this.icon.getIconName;
        const family = this.icon.getFontSet;
        const color = this.icon.getIconColor;
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
import { IgxIconModule, IgxIconComponent } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    @ViewChild(IgxIconComponent, { static: true })
    private icon: IgxIconComponent;

    constructor() {
        const name = this.icon.getName;
        const family = this.icon.getFamily;
        const color = this.icon.getColor;
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`;
        console.log(tree.readContent(
            '/testSrc/appPrefix/component/icon-test.component.ts'
        ));

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/icon-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should migrate updated members names', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/icon-test.component.ts',
            `import { Component } from '@angular/core';
            import { IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    constructor(private _iconService: IgxIconService) {
        const font = this._iconService.defaultFontSet;
        const className = this._iconService.fontSetClassName('material');
        const alias = this._iconService.registerFontSetAlias('material', 'material-icons');
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent = `import { Component } from '@angular/core';
        import { IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-icon-test',
    templateUrl: './icon-test.component.html',
    styleUrls: ['./icon-test.component.scss']
})
export class IconTestComponent {
    constructor(private _iconService: IgxIconService) {
        const font = this._iconService.defaultFamily;
        const className = this._iconService.familyClassName('material');
        const alias = this._iconService.registerFamilyAlias('material', 'material-icons');
    }
}
@NgModule({
    declarations: [IconTestComponent],
    exports: [IconTestComponent],
    imports: [IgxIconModule]
});
`;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/icon-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should replace onToggle with collapsedChange ', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/splitter.component.html`,
            `<igx-splitter style='height: 30vh;' [type]='0'>
                <igx-splitter-pane (onToggle)="toggled()">
                </igx-splitter-pane>
            </igx-splitter>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/splitter.component.html'))
            .toEqual(`<igx-splitter style='height: 30vh;' [type]='0'>
                <igx-splitter-pane (collapsedChange)="toggled()">
                </igx-splitter-pane>
            </igx-splitter>`);
    });

    it('should replace onSelect and onUnselect with selected and deselected in igx-buttongroup', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/buttongroup.component.html`,
            `<igx-buttongroup
                (onSelect)="someHandler($event)"
                (onUnselect)="someHandler($event)"
            >
            </igx-buttongroup>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/buttongroup.component.html')).toEqual(
            `<igx-buttongroup
                (selected)="someHandler($event)"
                (deselected)="someHandler($event)"
            >
            </igx-buttongroup>`
        );
    });

    it('should replace onAction with clicked in igx-snackbar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/snackbar.component.html`,
            `<igx-snackbar (onAction)="someHandler($event)"></igx-snackbar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/snackbar.component.html')).toEqual(
            `<igx-snackbar (clicked)="someHandler($event)"></igx-snackbar>`
        );
    });

    it('should replace onShowing, onShown, onHiding, onHidden with showing, shown, hiding, hidden in igx-toast', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/toast.component.html`,
            `<igx-toast
                (onShowing)="someHandler($event)"
                (onShown)="someHandler($event)"
                (onHiding)="someHandler($event)"
                (onHidden)="someHandler($event)"
            >
            </igx-toast>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/toast.component.html')).toEqual(
            `<igx-toast
                (showing)="someHandler($event)"
                (shown)="someHandler($event)"
                (hiding)="someHandler($event)"
                (hidden)="someHandler($event)"
            >
            </igx-toast>`
        );
    });

    it('should replace paging with enablePaging ', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/grid-paging.component.html`,
            `<igx-grid [paging]='true'></igx-grid>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/grid-paging.component.html'))
            .toEqual(`<igx-grid [enablePaging]='true'></igx-grid>`);
    });

    it('should migrate paging to enablePaging names', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create(
            '/testSrc/appPrefix/component/grid-test.component.ts',
            `import { Component } from '@angular/core';
            import { IgxGridComponent } from 'igniteui-angular';

            @Component({
                selector: 'app-grid',
                templateUrl: './grid.component.html',
                styleUrls: ['./grid.component.scss']
            })
            export class GridTestComponent {
                @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;
                public ngOnInit(): void {
                    this.grid.paging = true;
                    this.paging = 'justTest'
                }}`);

        const tree = await runner
            .runSchematicAsync('migration-19', {}, appTree)
            .toPromise();

        const expectedContent = `
            import { Component } from '@angular/core';
            import { IgxGridComponent } from 'igniteui-angular';

            @Component({
                selector: 'app-grid',
                templateUrl: './grid.component.html',
                styleUrls: ['./grid.component.scss']
            })
            export class GridTestComponent {
                @ViewChild('grid1', { static: true }) public grid: IgxGridComponent;
                public ngOnInit(): void {
                    this.grid.enablePaging = true;
                    this.paging = 'justTest'
                }
            }`;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/grid-test.component.ts'
            )
        ).toEqual(expectedContent);
    });
});
