import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 8.2.0', () => {
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

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should update Excel Style Filtering template selectors', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<igx-grid [data]="data" height="500px" [autoGenerate]="true" [allowFiltering]="true" [filterMode]="'excelStyleFilter'">
                <ng-template igxExcelStyleSortingTemplate><div class="esf-custom-sorting">Sorting Template</div></ng-template>
                <ng-template igxExcelStyleHidingTemplate><div class="esf-custom-hiding">Hiding Template</div></ng-template>
                <ng-template igxExcelStyleMovingTemplate><div class="esf-custom-moving">Moving Template</div></ng-template>
                <ng-template igxExcelStylePinningTemplate><div class="esf-custom-pinning">Pinning Template</div></ng-template>
            </igx-grid>`);

        const tree = await schematicRunner.runSchematicAsync('migration-10', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
            `<igx-grid [data]="data" height="500px" [autoGenerate]="true" [allowFiltering]="true" [filterMode]="'excelStyleFilter'">
                <ng-template igxExcelStyleSorting><div class="esf-custom-sorting">Sorting Template</div></ng-template>
                <ng-template igxExcelStyleHiding><div class="esf-custom-hiding">Hiding Template</div></ng-template>
                <ng-template igxExcelStyleMoving><div class="esf-custom-moving">Moving Template</div></ng-template>
                <ng-template igxExcelStylePinning><div class="esf-custom-pinning">Pinning Template</div></ng-template>
            </igx-grid>`);

    });

    it('should update igxDrag input bindings', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<div igxDrag [renderGhost]="true" [ghostImageClass]="'casper'" [dragGhostHost]="host">Drag me</div>`);
        const tree = await schematicRunner.runSchematicAsync('migration-10', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
            `<div igxDrag [ghost]="true" [ghostClass]="'casper'" [ghostHost]="host">Drag me</div>`);
    });

    it('should update igxDrag and igxDrop outputs bindings', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<div igxDrag (onGhostCreate)="ghostCreateHandler($event)"
                (onGhostDestroy)="ghostDestroyHandler($event)"
                (returnMoveEnd)="moveEndHandler($event)"
                (dragClicked)="clickHandler($event)">
                Drag me
            </div>
            <div igxDrop (onEnter)="enterHandler($event)" (onLeave)="leaveHandler($event)" (onDrop)="dropHandler($event)">drop area</div>
            `);

        const tree = await schematicRunner.runSchematicAsync('migration-10', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
            `<div igxDrag (ghostCreate)="ghostCreateHandler($event)"
                (ghostDestroy)="ghostDestroyHandler($event)"
                (transitioned)="moveEndHandler($event)"
                (click)="clickHandler($event)">
                Drag me
            </div>
            <div igxDrop (enter)="enterHandler($event)" (leave)="leaveHandler($event)" (dropped)="dropHandler($event)">drop area</div>
            `);
    });

    it('should update igxDrag and igxDrop event argument interfaces', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { IgxDragDirective, IgxDropDirective, IgxDropEnterEventArgs,
                IgxDropLeaveEventArgs, IgxDropEventArgs } from 'igniteui-angular';

            export class DragDropSampleComponent {
                public onEnterHandler(event: IgxDropEnterEventArgs) {}
                public onLeaveHandler(event: IgxDropLeaveEventArgs) {}
                public onDropHandler(event: IgxDropEventArgs) {}
            }`);

        const tree = await schematicRunner.runSchematicAsync('migration-10', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts'))
            .toEqual(
            `import { IgxDragDirective, IgxDropDirective, IDropBaseEventArgs,
                IDropBaseEventArgs, IDropDroppedEventArgs } from 'igniteui-angular';

            export class DragDropSampleComponent {
                public onEnterHandler(event: IDropBaseEventArgs) {}
                public onLeaveHandler(event: IDropBaseEventArgs) {}
                public onDropHandler(event: IDropDroppedEventArgs) {}
            }`);
    });
});
