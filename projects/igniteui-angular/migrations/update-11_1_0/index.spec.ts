import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update to 11.1.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc',
            },
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix',
            },
        },
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

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/splitter.component.html'))
            .toEqual(`<igx-splitter style='height: 30vh;' [type]='0'>
                <igx-splitter-pane (collapsedChange)="toggled()">
                </igx-splitter-pane>
            </igx-splitter>`);
    });
});
