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
    // eslint-disable-next-line max-len
    const noteText = `<!--NOTE: This component has been updated by Infragistics migration: v${version}\nPlease check your template whether all bindings/event handlers are correct.-->`;

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    // IgxOverlayService
    it('should update overlay events subscriptions', async () => {
        appTree.create(
            '/testSrc/appPrefix/service/test.component.ts', `
import { Component, OnInit } from '@angular/core';
import { IgxOverlayService } from 'igniteui-angular';
export class SimpleComponent implements OnInit {
    constructor(@Inject(IgxOverlayService) protected overlayService: IgxOverlayService){}

    public ngOnInit() {
        this.overlayService.onOpening.subscribe();
        this.overlayService.opened.subscribe();
        this.overlayService.onClosing.subscribe();
        this.overlayService.onClosed.subscribe();
        this.overlayService.onAppended.subscribe();
        this.overlayService.onAnimation.subscribe();
    }
}`);
        const tree = await schematicRunner.runSchematicAsync('migration-21', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/service/test.component.ts'))
            .toEqual(`
import { Component, OnInit } from '@angular/core';
import { IgxOverlayService } from 'igniteui-angular';
export class SimpleComponent implements OnInit {
    constructor(@Inject(IgxOverlayService) protected overlayService: IgxOverlayService){}

    public ngOnInit() {
        this.overlayService.opening.subscribe();
        this.overlayService.opened.subscribe();
        this.overlayService.closing.subscribe();
        this.overlayService.closed.subscribe();
        this.overlayService.contentAppended.subscribe();
        this.overlayService.animationStarting.subscribe();
    }
}`);
    });
});
