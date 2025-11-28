import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { IgxBreadcrumbComponent } from './breadcrumb.component';
import { IgxBreadcrumbItemComponent } from './breadcrumb-item.component';
import { IgxBreadcrumbSeparatorDirective } from './breadcrumb.directives';

@Component({
    template: `
    <igx-breadcrumb>
        <igx-breadcrumb-item [routerLink]="['/home']" icon="home">Home</igx-breadcrumb-item>
        <igx-breadcrumb-item [routerLink]="['/products']">Products</igx-breadcrumb-item>
        <igx-breadcrumb-item [disabled]="true">Laptops</igx-breadcrumb-item>
    </igx-breadcrumb>
    `,
    imports: [IgxBreadcrumbComponent, IgxBreadcrumbItemComponent]
})
class BasicBreadcrumbComponent {
    @ViewChild(IgxBreadcrumbComponent, { static: true }) public breadcrumb: IgxBreadcrumbComponent;
    @ViewChildren(IgxBreadcrumbItemComponent) public items: QueryList<IgxBreadcrumbItemComponent>;
}

@Component({
    template: `
    <igx-breadcrumb separator="/">
        <igx-breadcrumb-item>Home</igx-breadcrumb-item>
        <igx-breadcrumb-item>Products</igx-breadcrumb-item>
        <igx-breadcrumb-item>Laptops</igx-breadcrumb-item>
    </igx-breadcrumb>
    `,
    imports: [IgxBreadcrumbComponent, IgxBreadcrumbItemComponent]
})
class CustomSeparatorBreadcrumbComponent {
    @ViewChild(IgxBreadcrumbComponent, { static: true }) public breadcrumb: IgxBreadcrumbComponent;
}

@Component({
    template: `
    <igx-breadcrumb>
        <ng-template igxBreadcrumbSeparator>
            <span class="custom-separator">→</span>
        </ng-template>
        <igx-breadcrumb-item>Home</igx-breadcrumb-item>
        <igx-breadcrumb-item>Products</igx-breadcrumb-item>
    </igx-breadcrumb>
    `,
    imports: [IgxBreadcrumbComponent, IgxBreadcrumbItemComponent, IgxBreadcrumbSeparatorDirective]
})
class TemplateSeparatorBreadcrumbComponent {
    @ViewChild(IgxBreadcrumbComponent, { static: true }) public breadcrumb: IgxBreadcrumbComponent;
}

@Component({
    template: `
    <igx-breadcrumb [maxItems]="4" [itemsBeforeCollapse]="1" [itemsAfterCollapse]="2">
        <igx-breadcrumb-item>Home</igx-breadcrumb-item>
        <igx-breadcrumb-item>Level 1</igx-breadcrumb-item>
        <igx-breadcrumb-item>Level 2</igx-breadcrumb-item>
        <igx-breadcrumb-item>Level 3</igx-breadcrumb-item>
        <igx-breadcrumb-item>Level 4</igx-breadcrumb-item>
        <igx-breadcrumb-item>Current</igx-breadcrumb-item>
    </igx-breadcrumb>
    `,
    imports: [IgxBreadcrumbComponent, IgxBreadcrumbItemComponent]
})
class OverflowBreadcrumbComponent {
    @ViewChild(IgxBreadcrumbComponent, { static: true }) public breadcrumb: IgxBreadcrumbComponent;
}

@Component({
    template: `
    <igx-breadcrumb>
        <igx-breadcrumb-item link="/home">Home</igx-breadcrumb-item>
        <igx-breadcrumb-item [routerLink]="['/products']">Products</igx-breadcrumb-item>
    </igx-breadcrumb>
    `,
    imports: [IgxBreadcrumbComponent, IgxBreadcrumbItemComponent]
})
class LinkBreadcrumbComponent {
    @ViewChild(IgxBreadcrumbComponent, { static: true }) public breadcrumb: IgxBreadcrumbComponent;
}

describe('IgxBreadcrumb', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                RouterTestingModule,
                BasicBreadcrumbComponent,
                CustomSeparatorBreadcrumbComponent,
                TemplateSeparatorBreadcrumbComponent,
                OverflowBreadcrumbComponent,
                LinkBreadcrumbComponent
            ]
        }).compileComponents();
    }));

    describe('Basic functionality', () => {
        let fixture;
        let breadcrumb: IgxBreadcrumbComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            breadcrumb = fixture.componentInstance.breadcrumb;
        }));

        it('should initialize igx-breadcrumb', () => {
            expect(breadcrumb).toBeDefined();
            expect(breadcrumb instanceof IgxBreadcrumbComponent).toBeTruthy();
        });

        it('should have correct number of items', () => {
            expect(breadcrumb.items.length).toBe(3);
        });

        it('should have navigation role', () => {
            const element = fixture.nativeElement.querySelector('igx-breadcrumb');
            expect(element.getAttribute('role')).toBe('navigation');
        });

        it('should have aria-label', () => {
            const element = fixture.nativeElement.querySelector('igx-breadcrumb');
            expect(element.getAttribute('aria-label')).toBe('breadcrumb');
        });

        it('should mark last item as current', () => {
            const items = breadcrumb.items.toArray();
            expect(items[0].isCurrent).toBeFalsy();
            expect(items[1].isCurrent).toBeFalsy();
            expect(items[2].isCurrent).toBeTruthy();
        });

        it('should have default separator', () => {
            expect(breadcrumb.separator).toBe('›');
        });
    });

    describe('Custom separator', () => {
        it('should use custom separator string', fakeAsync(() => {
            const fixture = TestBed.createComponent(CustomSeparatorBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            
            const breadcrumb = fixture.componentInstance.breadcrumb;
            expect(breadcrumb.separator).toBe('/');
        }));

        it('should use custom separator template', fakeAsync(() => {
            const fixture = TestBed.createComponent(TemplateSeparatorBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            
            const breadcrumb = fixture.componentInstance.breadcrumb;
            expect(breadcrumb.separatorTemplate).toBeDefined();
        }));
    });

    describe('Overflow behavior', () => {
        let fixture;
        let breadcrumb: IgxBreadcrumbComponent;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(OverflowBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            breadcrumb = fixture.componentInstance.breadcrumb;
        }));

        it('should have maxItems set', () => {
            expect(breadcrumb.maxItems).toBe(4);
        });

        it('should have itemsBeforeCollapse set', () => {
            expect(breadcrumb.itemsBeforeCollapse).toBe(1);
        });

        it('should have itemsAfterCollapse set', () => {
            expect(breadcrumb.itemsAfterCollapse).toBe(2);
        });

        it('should calculate visible items correctly', () => {
            // With 6 items, maxItems=4, before=1, after=2
            // Should show: first item, last 2 items = 3 visible
            expect(breadcrumb.visibleItems.length).toBe(3);
        });

        it('should have collapsed items', () => {
            expect(breadcrumb.hasCollapsedItems).toBeTruthy();
            // Hidden items should be: Level 1, Level 2, Level 3 = 3 items
            expect(breadcrumb.hiddenItems.length).toBe(3);
        });

        it('should generate tooltip for collapsed items', () => {
            const tooltip = breadcrumb.getCollapsedItemsTooltip();
            expect(tooltip).toContain('Level 1');
            expect(tooltip).toContain('Level 2');
            expect(tooltip).toContain('Level 3');
        });

        it('should mark hidden items', () => {
            const items = breadcrumb.items.toArray();
            expect(items[0].isHidden).toBeFalsy(); // Home - visible
            expect(items[1].isHidden).toBeTruthy(); // Level 1 - hidden
            expect(items[2].isHidden).toBeTruthy(); // Level 2 - hidden
            expect(items[3].isHidden).toBeTruthy(); // Level 3 - hidden
            expect(items[4].isHidden).toBeFalsy(); // Level 4 - visible
            expect(items[5].isHidden).toBeFalsy(); // Current - visible
        });
    });

    describe('Item properties', () => {
        it('should handle disabled items', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            
            const items = fixture.componentInstance.items.toArray();
            expect(items[2].disabled).toBeTruthy();
        }));

        it('should handle icon property', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            
            const items = fixture.componentInstance.items.toArray();
            expect(items[0].icon).toBe('home');
        }));

        it('should handle link property', fakeAsync(() => {
            const fixture = TestBed.createComponent(LinkBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            
            const breadcrumb = fixture.componentInstance.breadcrumb;
            const items = breadcrumb.items.toArray();
            expect(items[0].link).toBe('/home');
        }));

        it('should handle routerLink property', fakeAsync(() => {
            const fixture = TestBed.createComponent(LinkBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            
            const breadcrumb = fixture.componentInstance.breadcrumb;
            const items = breadcrumb.items.toArray();
            expect(items[1].routerLink).toEqual(['/products']);
        }));
    });

    describe('Accessibility', () => {
        let fixture;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicBreadcrumbComponent);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
        }));

        it('should have ordered list structure', () => {
            const list = fixture.nativeElement.querySelector('ol.igx-breadcrumb__list');
            expect(list).toBeTruthy();
        });

        it('should have breadcrumb items', () => {
            const breadcrumbItems = fixture.nativeElement.querySelectorAll('igx-breadcrumb-item');
            expect(breadcrumbItems.length).toBe(3);
        });
    });
});
