import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '17.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    const configJson = {
        projects: {
            testProj: {
                root: '/',
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

    const migrationName = 'migration-32';

    it('should append elevated attribute and remove type property to card components with type="elevated"', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-card type="elevated">
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-card elevated>
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );
    });

    it('should append elevated attribute to card components without type property', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-card>
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-card elevated>
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );
    });

    it('should remove type property and should not appent elevated attribute to card components with type="outlined"', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-card type="outlined">
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-card>
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );
    });

    it('shouldn\'t append elevated attribute to card components if already applied', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-card elevated>
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-card elevated>
            <igx-card-header>
                <h3 igxCardHeaderTitle>Title</h3>
                <h5 igxCardHeaderSubtitle>Subtitle</h5>
            </igx-card-header>
            <igx-card-content>
                Card Content
            </igx-card-content>
            <igx-card-actions>
                <button igxButton igxStart>Button</button>
                <button igxButton="icon" igxEnd>
                    <igx-icon>favorite</igx-icon>
                </button>
            </igx-card-actions>
        </igx-card>
        `
        );
    });

    for (const igPackage of ['igniteui-angular', '@infragistics/igniteui-angular']) {
        it('should move animation imports from igniteui-angular to igniteui-angular/animations', async () => {
            appTree.create(`/testSrc/appPrefix/component/test.component.ts`,
`import { IgxButtonModule, flipRight, IgxIconModule, slideInBr, scaleOutHorLeft, IgxRippleModule, EaseOut } from '${igPackage}';
import { Component, ViewChild } from '@angular/core';

import { swingOutLeftBck, growVerIn, growVerOut, shakeHor, IgxCardModule } from '${igPackage}';
`
            );

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(
`import { IgxButtonModule, IgxIconModule, IgxRippleModule } from '${igPackage}';
import { Component, ViewChild } from '@angular/core';

import { IgxCardModule } from '${igPackage}';
import { EaseOut, flipRight, growVerIn, growVerOut, scaleOutHorLeft, shakeHor, slideInBr, swingOutLeftBck } from '${igPackage}/animations';
`
            );
        });
    }
});
