import { Component, ViewChild } from '@angular/core';
import { IgxListComponent } from '../list';

@Component({
    template: `<div #wrapper>
        <igx-list>
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`
})
export class BasicListComponent {
    @ViewChild(IgxListComponent) public list: IgxListComponent;
    @ViewChild('wrapper') public wrapper;
}

@Component({
    template: `<div #wrapper>
        <igx-list>
            <igx-list-item [isHeader]="true">Header</igx-list-item>
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`
})
export class ListWithHeaderComponent extends BasicListComponent {
}

@Component({
    template: `<div #wrapper>
        <igx-list [allowRightPanning]="allowRightPanning" [allowLeftPanning]="allowLeftPanning">
            <igx-list-item>Item 1</igx-list-item>
            <igx-list-item>Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`
})
export class ListWithPanningComponent extends BasicListComponent {
    allowRightPanning = true;
    allowLeftPanning = true;
}

@Component({
    template: `<div #wrapper>
        <igx-list>
        </igx-list>
    </div>`
})
export class EmptyListComponent extends BasicListComponent {
}

@Component({
    template: `<div #wrapper>
        <igx-list>
            <ng-template igxEmptyList>
                <h3>Custom no items message.</h3>
            </ng-template>
        </igx-list>
    </div>`
})
export class CustomEmptyListComponent extends BasicListComponent {
}

@Component({
    template: `<div #wrapper>
        <igx-list [isLoading]="isLoading">
        </igx-list>
    </div>`
})
export class ListLoadingComponent extends BasicListComponent {
    isLoading = true;
}

@Component({
    template: `<div #wrapper>
        <igx-list [isLoading]="isLoading">
            <ng-template igxDataLoading>
                <h3>Loading data...</h3>
            </ng-template>
        </igx-list>
    </div>`
})
export class ListCustomLoadingComponent extends ListLoadingComponent {
}

@Component({
    template: `<div #wrapper>
        <igx-list [allowRightPanning]="allowRightPanning" [allowLeftPanning]="allowLeftPanning">
            <igx-list-item [isHeader]="true">Header 1</igx-list-item>
            <igx-list-item [isHeader]="false" [hidden]="false">Item 1</igx-list-item>
            <igx-list-item [isHeader]="true">Header 2</igx-list-item>
            <igx-list-item [hidden]="true">Item 2</igx-list-item>
            <igx-list-item>Item 3</igx-list-item>
        </igx-list>
    </div>`
})
export class TwoHeadersListComponent extends ListWithPanningComponent {
}

@Component({
    template: `<div #wrapper>
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
    </div>`
})
export class ListWithPanningTemplatesComponent extends ListWithPanningComponent {
}
