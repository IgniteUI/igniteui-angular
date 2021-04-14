import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '12.0.0';

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

    const migrationName = 'migration-20';
    // eslint-disable-next-line max-len
    const noteText = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->`;

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update avatar theme args', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `
$theme: igx-avatar-theme(
    $initials-background: white,
    $icon-background: green,
    $image-background: red,
    $initials-color: black,
    $icon-color: gold,
    $border-radius-round: 14px,
    $border-radius-square: 12px
);
`
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
            `
$theme: igx-avatar-theme(
    $background: white,
    $color: black,
    $border-radius: 14px
);
`
        );
    });

    it('should update onColumnChange', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
<igx-grid>
  <igx-column (onColumnChange)="columnChanged()"></igx-column>
</igx-grid>
`
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
<igx-grid>
  <igx-column (columnChange)="columnChanged()"></igx-column>
</igx-grid>
`
        );
    });

    it('should replace onValueChange and onValueChanged with valueChange and valueChanged in igx-slider', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/slider.component.html`,
            `<igx-slider
            (onValueChange)="someHandler($event)"
            (onValueChanged)="someHandler($event)"
            ></igx-slider>`
        );

        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/slider.component.html')).toEqual(
            `<igx-slider
            (valueChange)="someHandler($event)"
            (valueChanged)="someHandler($event)"
            ></igx-slider>`
        );
    });

    it('should replace onProgressChanged with progressChanged in igx-linear-bar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/linear.component.html`,
            `<igx-linear-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-linear-bar>`
        );

        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/linear.component.html')).toEqual(
            `<igx-linear-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-linear-bar>`
        );
    });

    it('should replace onProgressChanged with progressChanged in igx-circular-bar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/circular.component.html`,
            `<igx-circular-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-circular-bar>`
        );

        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/circular.component.html')).toEqual(
            `<igx-circular-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-circular-bar>`
        );
    });

    // IgxTabs
    it('Should update igx-tab-group to igx-tab-item', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="contentFit" [selectedIndex]="0">
<igx-tabs-group label="Tab1" icon="home" class="tabgroup">
    <div>Some Content</div>
</igx-tabs-group>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs [selectedIndex]="0" tabAlignment="start">
<igx-tab-item>
<igx-tab-header>
<igx-icon igxTabHeaderIcon>home</igx-icon>
<span igxTabHeaderLabel>Tab1</span>
</igx-tab-header>
<igx-tab-content class="tabgroup">
    <div>Some Content</div>
</igx-tab-content>
</igx-tab-item>
</igx-tabs>`);
    });

    it('Should insert routerLink to igx-tab-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="fixed">
<igx-tab-item label="Tab1" icon="folder" routerLink="view1" [isSelected]="true" class="tabitem">
</igx-tab-item>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs tabAlignment="justify">
<igx-tab-item [selected]="true">
<igx-tab-header routerLink="view1" class="tabitem">
<igx-icon igxTabHeaderIcon>folder</igx-icon>
<span igxTabHeaderLabel>Tab1</span>
</igx-tab-header>
</igx-tab-item>
</igx-tabs>`);
    });

    it('Should not create igx-[tab|botton-nav]-content if it\'s already present', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs #tabs1>
<igx-tab-item>
<igx-tab-header>
<span igxTabHeaderLabel>Home</span>
</igx-tab-header>
<igx-tab-content>Home content.</igx-tab-content>
</igx-tab-item>
</igx-tabs>
<!--BottomNav-->
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header>
<igx-icon igxBottomNavHeaderIcon>library_music</igx-icon>
<span igxBottomNavHeaderLabel>Songs</span>
</igx-bottom-nav-header>
<igx-bottom-nav-content>
<div class="item" *ngFor="let song of songsList">
<span class="item-line1">{{song.title}}</span><br/>
<span class="item-line2">{{song.artist}}</span>
</div>
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
<igx-tabs #tabs1>
<igx-tab-item>
<igx-tab-header>
<span igxTabHeaderLabel>Home</span>
</igx-tab-header>
<igx-tab-content>Home content.</igx-tab-content>
</igx-tab-item>
</igx-tabs>
<!--BottomNav-->
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header>
<igx-icon igxBottomNavHeaderIcon>library_music</igx-icon>
<span igxBottomNavHeaderLabel>Songs</span>
</igx-bottom-nav-header>
<igx-bottom-nav-content>
<div class="item" *ngFor="let song of songsList">
<span class="item-line1">{{song.title}}</span><br/>
<span class="item-line2">{{song.artist}}</span>
</div>
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should insert ng-template content into igx-tab-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-tabs type="fixed">
<igx-tabs-group>
<ng-template igxTab>
    <span>Tab1</span>
</ng-template>
<div>Tab Content</div>
</igx-tabs-group>
</igx-tabs>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-tabs tabAlignment="justify">
<igx-tab-item>
<igx-tab-header>
    <span>Tab1</span>
</igx-tab-header>
<igx-tab-content>
<div>Tab Content</div>
</igx-tab-content>
</igx-tab-item>
</igx-tabs>`);
    });

    // IgxBottomNav
    it('Should update igx-tab-panel to igx-bottom-nav-item', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-bottom-nav>
<igx-tab-panel label="Tab1" icon="folder" [isSelected]="true" class="tabpanel">
Some Content
</igx-tab-panel>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item [selected]="true">
<igx-bottom-nav-header>
<igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
<span igxBottomNavHeaderLabel>Tab1</span>
</igx-bottom-nav-header>
<igx-bottom-nav-content class="tabpanel">
Some Content
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should insert routerLink to igx-bottom-nav-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-bottom-nav>
<igx-tab label="Tab1" icon="folder" routerLink="view1" class="igxtab">
</igx-tab>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header routerLink="view1" class="igxtab">
<igx-icon igxBottomNavHeaderIcon>folder</igx-icon>
<span igxBottomNavHeaderLabel>Tab1</span>
</igx-bottom-nav-header>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should insert ng-template content into igx-bottom-nav-header', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html', `
<igx-bottom-nav>
<igx-tab-panel>
<ng-template igxTab>
<div>Tab1</div>
</ng-template>
<div>Tab Content</div>
</igx-tab-panel>
</igx-bottom-nav>`);
        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(`
${noteText}
<igx-bottom-nav>
<igx-bottom-nav-item>
<igx-bottom-nav-header>
<div>Tab1</div>
</igx-bottom-nav-header>
<igx-bottom-nav-content>
<div>Tab Content</div>
</igx-bottom-nav-content>
</igx-bottom-nav-item>
</igx-bottom-nav>`);
    });

    it('Should update the css selectors', async () => {
        appTree.create('/testSrc/appPrefix/component/custom.component.scss', `
igx-tabs-group {
    padding: 8px;
}
igx-tab-item {
    padding: 8px;
}
igx-tab-panel {
    padding: 8px;
}
igx-tab {
    padding: 8px;
}`);

        const tree = await schematicRunner.runSchematicAsync('migration-20', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.scss'))
            .toEqual(`
igx-tab-content {
    padding: 8px;
}
igx-tab-header {
    padding: 8px;
}
igx-bottom-nav-content {
    padding: 8px;
}
igx-bottom-nav-header {
    padding: 8px;
}`);
    });
});
