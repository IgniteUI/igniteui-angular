import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '15.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
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

    it('should replace on-prefixed typescript outputs in carousel', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { IgxCarouselComponent } from 'igniteui-angular';

        @Component({
            selector: 'appPrefix-component',
            template: '<ng-content></ng-content>'
        })
        export class TestComponent {
            @ViewChild(IgxCarouselComponent)
            public carousel: IgxCarouselComponent;

            contructor() {
                this.carousel.onSlideChanged.subscribe((e) => {});
                this.carousel.onSlideAdded.subscribe((e) => {});
                this.carousel.onSlideRemoved.subscribe((e) => {});
                this.carousel.onCarouselPaused.subscribe((e) => {});
                this.carousel.onCarouselPlaying.subscribe((e) => {});
            }
        }
        `);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: true }, appTree);

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { IgxCarouselComponent } from 'igniteui-angular';

        @Component({
            selector: 'appPrefix-component',
            template: '<ng-content></ng-content>'
        })
        export class TestComponent {
            @ViewChild(IgxCarouselComponent)
            public carousel: IgxCarouselComponent;

            contructor() {
                this.carousel.slideChanged.subscribe((e) => {});
                this.carousel.slideAdded.subscribe((e) => {});
                this.carousel.slideRemoved.subscribe((e) => {});
                this.carousel.carouselPaused.subscribe((e) => {});
                this.carousel.carouselPlaying.subscribe((e) => {});
            }
        }
        `;
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(expectedContent);
    });

    it('should replace on-prefixed outputs for displayDensity and onGroupingDone to groupingDone', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/carousel.component.html`,
            `<igx-action-strip #as (onDensityChanged)="onDensityChanged($event)"></igx-action-strip>
            <igx-buttongroup (onDensityChanged)="onDensityChanged($event)">
                <button igxButton igxRipple (onDensityChanged)="onDensityChanged($event)" i18n>Players</button>
                <button igxButton igxRipple (onDensityChanged)="onDensityChanged($event)" i18n>Teams</button>
            </igx-buttongroup>
            <igx-chip (onDensityChanged)="onDensityChanged($event)"></igx-chip>
            <igx-combo (onDensityChanged)="onDensityChanged($event)"></igx-combo>
            <igx-date-picker (onDensityChanged)="onDensityChanged($event)"></igx-date-picker>
            <igx-date-range-picker (onDensityChanged)="onDensityChanged($event)"></igx-date-range-picker>
            <igx-time-picker (onDensityChanged)="onDensityChanged($event)"></igx-time-picker>
            <igx-drop-down (onDensityChanged)="onDensityChanged($event)"></igx-drop-down>
            <igx-grid #grid1 (onDensityChanged)="onDensityChanged($event)" (onGroupingDone)="onGroupingDone($event)">
                <igx-grid-toolbar (onDensityChanged)="onDensityChanged($event)"></igx-grid-toolbar>
                <igx-paginator (onDensityChanged)="onDensityChanged($event)"></igx-paginator>
            </igx-grid>
            <igx-tree-grid #grid2 (onDensityChanged)="onDensityChanged($event)"></igx-tree-grid>
            <igx-hierarchical-grid #grid3 (onDensityChanged)="onDensityChanged($event)"></igx-hierarchical-grid>
            <igx-pivot-grid #grid4 (onDensityChanged)="onDensityChanged($event)"></igx-pivot-grid>
            <igx-list (onDensityChanged)="onDensityChanged($event)"></igx-list>
            <igx-input-group (onDensityChanged)="onDensityChanged($event)"></igx-input-group>
            <igx-query-builder (onDensityChanged)="onDensityChanged($event)"></igx-query-builder>
            <igx-tree (onDensityChanged)="onDensityChanged($event)"></igx-tree>`
        );
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/carousel.component.html'))
            .toEqual(`<igx-action-strip #as (densityChanged)="onDensityChanged($event)"></igx-action-strip>
            <igx-buttongroup (densityChanged)="onDensityChanged($event)">
                <button igxButton igxRipple (densityChanged)="onDensityChanged($event)" i18n>Players</button>
                <button igxButton igxRipple (densityChanged)="onDensityChanged($event)" i18n>Teams</button>
            </igx-buttongroup>
            <igx-chip (densityChanged)="onDensityChanged($event)"></igx-chip>
            <igx-combo (densityChanged)="onDensityChanged($event)"></igx-combo>
            <igx-date-picker (densityChanged)="onDensityChanged($event)"></igx-date-picker>
            <igx-date-range-picker (densityChanged)="onDensityChanged($event)"></igx-date-range-picker>
            <igx-time-picker (densityChanged)="onDensityChanged($event)"></igx-time-picker>
            <igx-drop-down (densityChanged)="onDensityChanged($event)"></igx-drop-down>
            <igx-grid #grid1 (densityChanged)="onDensityChanged($event)" (groupingDone)="onGroupingDone($event)">
                <igx-grid-toolbar (densityChanged)="onDensityChanged($event)"></igx-grid-toolbar>
                <igx-paginator (densityChanged)="onDensityChanged($event)"></igx-paginator>
            </igx-grid>
            <igx-tree-grid #grid2 (densityChanged)="onDensityChanged($event)"></igx-tree-grid>
            <igx-hierarchical-grid #grid3 (densityChanged)="onDensityChanged($event)"></igx-hierarchical-grid>
            <igx-pivot-grid #grid4 (densityChanged)="onDensityChanged($event)"></igx-pivot-grid>
            <igx-list (densityChanged)="onDensityChanged($event)"></igx-list>
            <igx-input-group (densityChanged)="onDensityChanged($event)"></igx-input-group>
            <igx-query-builder (densityChanged)="onDensityChanged($event)"></igx-query-builder>
            <igx-tree (densityChanged)="onDensityChanged($event)"></igx-tree>`);
    });

    it('should replace avatar roundShape property with shape', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-avatar initials="MS" [roundShape]="true" size="large"></igx-avatar>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-avatar initials="MS" shape="circle" size="large"></igx-avatar>
        `
        );
    });

    it('should append igxStart and igxEnd directives to the child elements of the igx-card-actions', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-card-actions>
            <span igxButton>Span</span>
            <button igxButton>Button</button>
            <button igxButton="icon">
                <igx-icon>favorite</igx-icon>
            </button>
            <igx-icon>drag_indicator</igx-icon>
        </igx-card-actions>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-card-actions>
            <span igxButton igxStart>Span</span>
            <button igxButton igxStart>Button</button>
            <button igxButton="icon" igxEnd>
                <igx-icon>favorite</igx-icon>
            </button>
            <igx-icon igxEnd>drag_indicator</igx-icon>
        </igx-card-actions>
        `
        );
    });

    it('shouldn\'t append igxStart and igxEnd directives to the child elements of the igx-card-actions if already applied', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-card-actions>
            <span igxButton igxStart>Span</span>
            <button igxButton igxStart>Button</button>
            <button igxButton="icon" igxEnd>
                <igx-icon>favorite</igx-icon>
            </button>
            <igx-icon igxEnd>drag_indicator</igx-icon>
        </igx-card-actions>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-card-actions>
            <span igxButton igxStart>Span</span>
            <button igxButton igxStart>Button</button>
            <button igxButton="icon" igxEnd>
                <igx-icon>favorite</igx-icon>
            </button>
            <igx-icon igxEnd>drag_indicator</igx-icon>
        </igx-card-actions>
        `
        );
    });

    it('should rename the $size property to the $scrollbar-size', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-scrollbar: scrollbar-theme($size: 10px);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-scrollbar: scrollbar-theme($scrollbar-size: 10px);`
        );
    });

    it('should remove the $label-floated-background amd $label-floated-disabled-background properties from the input-group-theme', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-input: input-group-theme($label-floated-background: transparent, $label-floated-disabled-background: transparent);`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-input: input-group-theme();`
        );
    });
});
