import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '15.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    const configJson = {
        defaultProject: 'testProj',
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

    const migrationName = 'migration-29';

    it('should replace on-prefixed outputs in carousel', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/carousel.component.html`,
            `<igx-carousel #myCarousel class="custom-carousel"
                (onSlideChanged)="onSlideChanged($event)"
                (onSlideAdded)="onSlideAdded($event)"
                (onSlideRemoved)="onSlideRemoved($event)"
                (onCarouselPaused)="onCarouselPaused($event)"
                (onCarouselPlaying)="onCarouselPlaying($event)">
                <igx-slide *ngFor="let slide of slideList">
                    <h2 i18n>Title</h2>
                    <p i18n>Longer description....</p>
                    <button igxButton="raised" *ngIf="!authUser else loggedIn" (click)="openLogin()" i18n>Sign-up Now</button>
                    <ng-template #loggedIn>
                        <button igxButton="raised" routerLink="/logged-in" i18n>Go To Account</button>
                    </ng-template>
                </igx-slide>
            </igx-carousel>`
        );
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/carousel.component.html'))
            .toEqual(`<igx-carousel #myCarousel class="custom-carousel"
                (slideChanged)="onSlideChanged($event)"
                (slideAdded)="onSlideAdded($event)"
                (slideRemoved)="onSlideRemoved($event)"
                (carouselPaused)="onCarouselPaused($event)"
                (carouselPlaying)="onCarouselPlaying($event)">
                <igx-slide *ngFor="let slide of slideList">
                    <h2 i18n>Title</h2>
                    <p i18n>Longer description....</p>
                    <button igxButton="raised" *ngIf="!authUser else loggedIn" (click)="openLogin()" i18n>Sign-up Now</button>
                    <ng-template #loggedIn>
                        <button igxButton="raised" routerLink="/logged-in" i18n>Go To Account</button>
                    </ng-template>
                </igx-slide>
            </igx-carousel>`);
    });
});
