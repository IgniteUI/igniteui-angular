import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '19.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-41';

    fit('should rename `CarouselIndicatorsOrientation` enum members from `top/bottom` to `start/end` in ts file', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
            `import { Component } from '@angular/core';
            import { CarouselIndicatorsOrientation } from "igniteui-angular";

            @Component({
                selector: "app-test",
                styleUrls: ["./test.component.scss"],
                templateUrl: "./test.component.html"
            })
            export class TestComponent {
                public orientationTop: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.top;
                public orientationBottom: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.bottom;
                constructor(){}
            }
        `);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        const expectedContent =
            `import { Component } from '@angular/core';
            import { CarouselIndicatorsOrientation } from "igniteui-angular";

            @Component({
                selector: "app-test",
                styleUrls: ["./test.component.scss"],
                templateUrl: "./test.component.html"
            })
            export class TestComponent {
                public orientationTop: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.start;
                public orientationBottom: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.end;
                constructor(){}
            }
        `;
        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should rename `CarouselIndicatorsOrientation` enum members from `top/bottom` to `start/end` in html file', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-carousel [indicatorsOrientation]="'top'"></igx-carousel>
        <igx-carousel [indicatorsOrientation]="'bottom'"></igx-carousel>
        <igx-carousel indicatorsOrientation="top"></igx-carousel>
        <igx-carousel indicatorsOrientation="bottom"></igx-carousel>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-carousel [indicatorsOrientation]="'start'"></igx-carousel>
        <igx-carousel [indicatorsOrientation]="'end'"></igx-carousel>
        <igx-carousel indicatorsOrientation="start"></igx-carousel>
        <igx-carousel indicatorsOrientation="end"></igx-carousel>
        `
        );
    });
});
