import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '22.2.0';

describe(`Update to ${version} - animations`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-62';
    const filePath = '/testSrc/appPrefix/component/test.component.ts';

    it('should turn useAnimation with params into a preset call with millisecond timing', async () => {
        appTree.create(filePath,
`import { useAnimation } from '@angular/animations';
import { fadeIn, slideInTop } from 'igniteui-angular/animations';

const a = useAnimation(fadeIn, { params: { duration: '350ms', easing: 'ease-in' } });
const b = useAnimation(slideInTop, { params: { duration: '.5s', delay: '0s', fromPosition: 'translateY(100%)' } });
const c = useAnimation(fadeIn, { params: { duration: \`\${this.time}ms\` } });
`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(
`import { fadeIn, slideInTop } from 'igniteui-angular/animations';

const a = fadeIn({ duration: 350, easing: 'ease-in' });
const b = slideInTop({ duration: 500, delay: 0, fromPosition: 'translateY(100%)' });
const c = fadeIn({ duration: this.time });
`);
    });

    it('should unwrap useAnimation without params', async () => {
        appTree.create(filePath,
`import { useAnimation } from '@angular/animations';
import { fadeIn } from 'igniteui-angular/animations';

const settings = { openAnimation: useAnimation(fadeIn), closeAnimation: null };
`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(
`import { fadeIn } from 'igniteui-angular/animations';

const settings = { openAnimation: fadeIn, closeAnimation: null };
`);
    });

    it('should replace the AnimationReferenceMetadata type with AnimationInput', async () => {
        appTree.create(filePath,
`import { AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { Component } from '@angular/core';
import { growVerIn } from 'igniteui-angular/animations';

export class Cmp {
    public open: AnimationReferenceMetadata = useAnimation(growVerIn, { params: { duration: '200ms' } });
    public close: AnimationReferenceMetadata | null = null;
}
`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(
`import { Component } from '@angular/core';
import { growVerIn, AnimationInput } from 'igniteui-angular/animations';

export class Cmp {
    public open: AnimationInput = growVerIn({ duration: 200 });
    public close: AnimationInput | null = null;
}
`);
    });

    it('should add an animations import when the file has none', async () => {
        appTree.create(filePath,
`import { AnimationReferenceMetadata } from '@angular/animations';

export interface Settings { open: AnimationReferenceMetadata; }
`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(
`import { AnimationInput } from 'igniteui-angular/animations';

export interface Settings { open: AnimationInput; }
`);
    });

    it('should keep other @angular/animations imports and leave unrelated files alone', async () => {
        appTree.create(filePath,
`import { trigger, useAnimation } from '@angular/animations';
import { fadeIn } from 'igniteui-angular/animations';

const a = useAnimation(fadeIn);
`);
        const other = '/testSrc/appPrefix/component/other.component.ts';
        appTree.create(other, `import { trigger } from '@angular/animations';\n`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent(filePath)).toEqual(
`import { trigger } from '@angular/animations';
import { fadeIn } from 'igniteui-angular/animations';

const a = fadeIn;
`);
        expect(tree.readContent(other)).toEqual(`import { trigger } from '@angular/animations';\n`);
    });
});
