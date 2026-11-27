import { Component, ViewChild, ChangeDetectionStrategy, signal } from '@angular/core';
import { IgxForOfDirective } from '../directives/src/directives/for-of/for_of.directive';
import { IgxIconComponent } from '../icon/src/icon/icon.component';
import { IgxDataLoadingTemplateDirective, IgxEmptyListTemplateDirective, IgxListActionDirective, IgxListComponent, IgxListItemComponent, IgxListItemLeftPanningTemplateDirective, IgxListItemRightPanningTemplateDirective, IgxListLineDirective, IgxListLineSubTitleDirective, IgxListLineTitleDirective, IgxListThumbnailDirective } from 'igniteui-angular/list';

@Component({
    template: `
       <div class="ig-typography">
           <igx-list>
               <igx-list-item>
                   <igx-icon igxListThumbnail>face</igx-icon>
                   <span class="text-line" igxListLine>Text-Line</span>
                   <h1 igxListLineTitle class="custom">Title</h1>
                   <p igxListLineSubTitle class="custom">Subtitle</p>
                   <igx-icon igxListAction class="action-icon">share</igx-icon>
               </igx-list-item>
           </igx-list>
       </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        IgxListComponent,
        IgxListItemComponent,
        IgxIconComponent,
        IgxListThumbnailDirective,
        IgxListLineDirective,
        IgxListLineTitleDirective,
        IgxListLineSubTitleDirective,
        IgxListActionDirective
    ]
})

export class ListDirectivesComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list>
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class BasicListComponent {
    @ViewChild(IgxListComponent, { static: true })
    public list: IgxListComponent;
    @ViewChild('wrapper', { static: true })
    public wrapper;
}

@Component({
    template: `
    <div #wrapper>
        <igx-list>
            <igx-list-item [isHeader]="true">Header</igx-list-item>
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class ListWithHeaderComponent extends BasicListComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list>
            <igx-list-item selected [isHeader]="true">Header</igx-list-item>
            <igx-list-item selected>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class ListWithSelectedItemComponent extends BasicListComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [navigation]="listbox ? 'listbox' : 'none'">
            <igx-list-item [isHeader]="true">Header</igx-list-item>
            @for (item of items; track item.id) {
                <igx-list-item [selected]="item.id === selectedId">
                    <span igxListLineTitle>{{ item.name }}</span>
                </igx-list-item>
            }
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent, IgxListLineTitleDirective]
})
export class ListboxComponent extends BasicListComponent {
    public listbox = true;
    public selectedId: number | null = 2;
    public items = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
    ];
}

@Component({
    template: `
    <div #wrapper>
        <igx-list navigation="listbox" aria-multiselectable="true">
            <igx-list-item [selected]="false">Ungrouped</igx-list-item>
            <igx-list-item [isHeader]="true">Employees</igx-list-item>
            <igx-list-item [selected]="true">Item 1</igx-list-item>
            <igx-list-item [selected]="false" aria-describedby="item-2-note">Item 2</igx-list-item>
            <igx-list-item [selected]="false" [attr.aria-describedby]="note">Item 3</igx-list-item>
            <igx-list-item [isHeader]="true">Contractors</igx-list-item>
            <igx-list-item [selected]="false">Item 4</igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class GroupedListboxComponent extends BasicListComponent {
    public note: string | null = 'item-3-note';
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [navigation]="listbox ? 'listbox' : 'none'" aria-label="Results" [isLoading]="isLoading">
            @for (item of items; track item) {
                <igx-list-item>{{ item }}</igx-list-item>
            }
            <ng-template igxDataLoading>
                <h3>Loading data...</h3>
            </ng-template>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent, IgxDataLoadingTemplateDirective]
})
export class EmptyListboxComponent extends BasicListComponent {
    public listbox = true;
    public isLoading = false;
    public items: string[] = [];
}

const GRID_ITEMS = [
    { id: 1, name: 'Write' },
    { id: 2, name: 'Review' },
    { id: 3, name: 'Release' }
];

@Component({
    template: `
    <div #wrapper>
        <button id="before">Before</button>
        <igx-list [navigation]="navigation()" aria-label="Tasks" [attr.aria-multiselectable]="multiselectable()">
            <igx-list-item [isHeader]="true">Today</igx-list-item>
            @for (item of items(); track item.id) {
                <igx-list-item [selected]="item.id === selectedId()">
                    <span igxListLineTitle>{{ item.name }}</span>
                    <button class="edit">Edit</button>
                    @if (item.id === 3 && showNote()) {
                        <input class="note" />
                    }
                    <button class="delete">Delete</button>
                </igx-list-item>
            }
            <ng-template igxEmptyList>
                <p>No tasks</p>
                <button class="restore" (click)="restore()">Restore</button>
            </ng-template>
        </igx-list>
        <button id="after">After</button>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent, IgxListLineTitleDirective, IgxEmptyListTemplateDirective]
})
export class GridListComponent extends BasicListComponent {
    public readonly navigation = signal<'none' | 'listbox' | 'grid'>('grid');
    public readonly multiselectable = signal<string | null>(null);
    public readonly selectedId = signal<number | null>(2);
    public readonly items = signal(GRID_ITEMS);
    public readonly showNote = signal(true);

    public restore() {
        this.items.set(GRID_ITEMS);
    }
}

/** A listbox in a row of a grid list, which counts as one control of the row. */
@Component({
    template: `
    <div #wrapper>
        <igx-list navigation="grid">
            <igx-list-item>
                <span igxListLineTitle>Assignees</span>
                <igx-list navigation="listbox" class="inner">
                    <igx-list-item>Kate</igx-list-item>
                    <igx-list-item>Lee</igx-list-item>
                </igx-list>
                <button class="add">Add</button>
            </igx-list-item>
        </igx-list>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent, IgxListLineTitleDirective]
})
export class GridWithNestedListboxComponent extends BasicListComponent {
}

/** An item declared in the template of another component, which the list content query does not see. */
@Component({
    selector: 'test-wrapped-list-item',
    template: `<igx-list-item><ng-content></ng-content></igx-list-item>`,
    imports: [IgxListItemComponent]
})
export class WrappedListItemComponent {
}

/** A grid list whose rows live in the template of another component. */
@Component({
    template: `
    <div #wrapper>
        <igx-list navigation="grid">
            <igx-list-item>Item 1 <button class="edit">Edit</button></igx-list-item>
            <test-wrapped-list-item>Item 2 <button class="edit">Edit</button></test-wrapped-list-item>
            <igx-list-item>Item 3 <button class="edit">Edit</button></igx-list-item>
        </igx-list>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent, WrappedListItemComponent]
})
export class GridWithWrappedItemsComponent extends BasicListComponent {
}

/** A listbox in a row of a grid list, with its options in the template of another component. */
@Component({
    template: `
    <div #wrapper>
        <igx-list navigation="grid">
            <igx-list-item>
                <span igxListLineTitle>Assignees</span>
                <igx-list navigation="listbox" class="inner">
                    <test-wrapped-list-item>Kate</test-wrapped-list-item>
                    <test-wrapped-list-item>Lee</test-wrapped-list-item>
                </igx-list>
                <button class="add">Add</button>
            </igx-list-item>
        </igx-list>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent, IgxListLineTitleDirective, WrappedListItemComponent]
})
export class GridWithWrappedNestedListboxComponent extends BasicListComponent {
}

/** Items named by their title and described by their subtitle and header. */
@Component({
    template: `
    <div #wrapper>
        <igx-list [navigation]="navigation()">
            <igx-list-item [isHeader]="true">Team</igx-list-item>
            <igx-list-item>
                <span igxListThumbnail>KD</span>
                <span igxListLineTitle>Kate</span>
                @if (showSubtitle()) {
                    <span igxListLineSubTitle>Designer</span>
                }
                <span igxListAction>Online</span>
            </igx-list-item>
            <igx-list-item [attr.aria-label]="label()">
                <span igxListLineTitle id="lee-title">Lee</span>
                <span igxListLineSubTitle>Developer</span>
            </igx-list-item>
            <igx-list-item>
                <span igxListLineTitle>Max</span>
                <span igxListLineSubTitle id="max-note">Tester</span>
                <igx-list navigation="listbox" class="inner">
                    <igx-list-item><span igxListLineTitle>Inner</span></igx-list-item>
                </igx-list>
            </igx-list-item>
            <igx-list-item aria-labelledby="own-label" aria-describedby="own-description">
                <span igxListLineTitle>Ann</span>
                <span igxListLineSubTitle>Manager</span>
            </igx-list-item>
            <igx-list-item>No title</igx-list-item>
        </igx-list>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent, IgxListLineTitleDirective, IgxListLineSubTitleDirective, IgxListThumbnailDirective, IgxListActionDirective]
})
export class NamedListComponent extends BasicListComponent {
    public readonly navigation = signal<'none' | 'listbox' | 'grid'>('listbox');
    public readonly showSubtitle = signal(true);
    public readonly label = signal<string | null>(null);
}

/** A grid list in a row of another grid list, which counts as one control of the row. */
@Component({
    template: `
    <div #wrapper>
        <button id="before">Before</button>
        <igx-list navigation="grid" class="outer">
            <igx-list-item>
                <span igxListLineTitle>Sprint</span>
                <igx-list navigation="grid" class="inner">
                    <igx-list-item>Task 1 <button class="task">Edit</button></igx-list-item>
                    <igx-list-item>Task 2 <button class="task">Edit</button></igx-list-item>
                </igx-list>
                <button class="add">Add</button>
            </igx-list-item>
            <igx-list-item>Backlog <button class="open">Open</button></igx-list-item>
        </igx-list>
        <button id="after">After</button>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent, IgxListLineTitleDirective]
})
export class GridWithNestedGridComponent extends BasicListComponent {
}


@Component({
    template: `
    <div #wrapper>
        <igx-list navigation="listbox">
            <igx-list-item>Item 1</igx-list-item>
            <test-wrapped-list-item>Item 2</test-wrapped-list-item>
            <test-wrapped-list-item>Item 3</test-wrapped-list-item>
            <igx-list-item>Item 4</igx-list-item>
        </igx-list>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent, WrappedListItemComponent]
})
export class ListboxWithWrappedItemsComponent extends BasicListComponent {
}

/** A listbox in an item of a static list, which a list item allows, unlike an option. */
@Component({
    template: `
    <div #wrapper>
        <igx-list>
            <igx-list-item>Outer 1</igx-list-item>
            <igx-list-item>
                <igx-list navigation="listbox" class="inner">
                    <igx-list-item>Inner 1</igx-list-item>
                    <igx-list-item>Inner 2</igx-list-item>
                </igx-list>
            </igx-list-item>
            <igx-list-item>Outer 3</igx-list-item>
        </igx-list>
    </div>`,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class NestedListboxComponent extends BasicListComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list role="listbox" tabindex="0" aria-activedescendant="own-item-1">
            <igx-list-item [isHeader]="true" aria-hidden="true">Header</igx-list-item>
            <igx-list-item id="own-item-1" role="option" tabindex="-1" aria-selected="true">Item 1</igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class ListWithOwnAttributesComponent extends BasicListComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [attr.tabindex]="tabIndex">
            <igx-list-item [isHeader]="true" [attr.aria-hidden]="hidden">Header</igx-list-item>
            <igx-list-item [attr.tabindex]="tabIndex" [attr.aria-selected]="selected" [attr.aria-describedby]="description">
                Item 1
            </igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class ListWithBoundAttributesComponent extends BasicListComponent {
    public tabIndex = '0';
    public hidden = 'true';
    public selected = 'true';
    public description = 'Note';
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [allowRightPanning]="allowRightPanning" [allowLeftPanning]="allowLeftPanning">
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class ListWithPanningComponent extends BasicListComponent {
    public allowRightPanning = true;
    public allowLeftPanning = true;
}

@Component({
    template: `
    <div #wrapper>
        <igx-list>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent]
})
export class EmptyListComponent extends BasicListComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list>
            <ng-template igxEmptyList>
                <h3>Custom no items message.</h3>
            </ng-template>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxEmptyListTemplateDirective]
})
export class CustomEmptyListComponent extends BasicListComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [isLoading]="isLoading">
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent]
})
export class ListLoadingComponent extends BasicListComponent {
    public isLoading = true;
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [isLoading]="isLoading">
            <ng-template igxDataLoading>
                <h3>Loading data...</h3>
            </ng-template>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxDataLoadingTemplateDirective]
})
export class ListCustomLoadingComponent extends ListLoadingComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [allowRightPanning]="allowRightPanning" [allowLeftPanning]="allowLeftPanning">
            <igx-list-item [isHeader]="true">Header 1</igx-list-item>
            <igx-list-item [isHeader]="false" [hidden]="false">Item 1</igx-list-item>
            <igx-list-item [isHeader]="true">Header 2</igx-list-item>
            <igx-list-item [hidden]="true">Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`,
    selector: 'igx-list-with-headers',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class TwoHeadersListComponent extends ListWithPanningComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [allowRightPanning]="false" [allowLeftPanning]="false">
            <igx-list-item [isHeader]="true">Header 1</igx-list-item>
            <igx-list-item [isHeader]="false" [hidden]="false">Item 1</igx-list-item>
            <igx-list-item [isHeader]="true">Header 2</igx-list-item>
            <igx-list-item [hidden]="true">Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`,
    selector: 'igx-list-with-headers-no-panning',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent]
})
export class TwoHeadersListNoPanningComponent extends ListWithHeaderComponent {
}

@Component({
    template: `
    <div #wrapper>
        <igx-list [allowRightPanning]="allowRightPanning" [allowLeftPanning]="allowLeftPanning">
            <ng-template igxListItemLeftPanning>
                <div>Left</div>
            </ng-template>
            <ng-template igxListItemRightPanning>
                <div>Right</div>
            </ng-template>
            <igx-list-item [isHeader]="true">Header</igx-list-item>
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent, IgxListItemLeftPanningTemplateDirective, IgxListItemRightPanningTemplateDirective]
})
export class ListWithPanningTemplatesComponent extends ListWithPanningComponent {
}

@Component({
    template: `
    <igx-list #forOfList [navigation]="listbox ? 'listbox' : 'none'">
        <div [style.height]="'240px'" [style.overflow]="'hidden'" [style.position]="'relative'">
            <igx-list-item
                [index]="i"
                [style.height]="'40px'"
                *igxFor="let item of data; index as i; scrollOrientation : 'vertical'; containerSize: '240px'; itemSize: '40px'">
                <div class="item-container">
                    <span>{{ item.key }}</span>&nbsp;
                    <span>{{ item.name }}</span>
                </div>
            </igx-list-item>
        </div>
    </igx-list>`,
    styles: [`.item-container {
        display: flex;
    }`],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxListComponent, IgxListItemComponent, IgxForOfDirective]
})
export class ListWithIgxForAndScrollingComponent {
    @ViewChild('forOfList', { read: IgxListComponent, static: true })
    public forOfList: IgxListComponent;

    @ViewChild(IgxForOfDirective)
    public igxFor: IgxForOfDirective<any>;

    public listbox = false;

    public data = [
        { key: 1, name: 'John' },
        { key: 2, name: 'Brian' },
        { key: 3, name: 'Christian' },
        { key: 4, name: 'Mark' },
        { key: 5, name: 'William' },
        { key: 6, name: 'Dave' },
        { key: 7, name: 'Riley' },
        { key: 8, name: 'Terrance' },
        { key: 9, name: 'Erick' },
        { key: 10, name: 'Victor' },
        { key: 11, name: 'Rick' },
        { key: 12, name: 'Stefan' }
    ];
}
