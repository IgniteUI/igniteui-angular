import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { IgxButtonDirective, IgxSelectComponent, IgxLabelDirective, IgxPrefixDirective, IgxIconComponent, IgxSelectItemComponent, IgxSelectHeaderDirective, IgxSelectFooterDirective, IgxButtonGroupComponent, IgxSuffixDirective, IgxHintDirective, IgxSelectGroupComponent, IgxSwitchComponent } from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { defineComponents, IgcSelectGroupComponent, IgcSelectComponent, IgcSelectItemComponent, IgcSelectHeaderComponent, IgcIconComponent, registerIconFromText } from 'igniteui-webcomponents';

defineComponents(IgcSelectGroupComponent, IgcSelectComponent, IgcSelectItemComponent, IgcSelectHeaderComponent, IgcIconComponent);

const favorite = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
registerIconFromText('favorite', favorite);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-select-showcase-sample',
    styleUrls: ['./select-showcase.sample.scss'],
    templateUrl: './select-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [
        IgxButtonDirective,
        IgxSelectComponent,
        FormsModule,
        IgxLabelDirective,
        IgxPrefixDirective,
        IgxIconComponent,
        IgxSelectItemComponent,
        NgFor,
        IgxSelectHeaderDirective,
        IgxSelectFooterDirective,
        IgxButtonGroupComponent,
        IgxSuffixDirective,
        IgxHintDirective,
        IgxSelectGroupComponent,
        ReactiveFormsModule,
        IgxSwitchComponent,
        SizeSelectorComponent
    ]
})
export class SelectShowcaseSampleComponent {
    @ViewChild('selectReactive', { read: IgxSelectComponent, static: true })
    public select: IgxSelectComponent;
    @ViewChild('model', { read: IgxSelectComponent, static: true })
    public selectFruits: IgxSelectComponent;
    @ViewChild('sizeSelect', { read: IgxSelectComponent, static: true })
    public sizeSelect: IgxSelectComponent;

    public fruits: string[] = ['Orange', 'Apple', 'Banana', 'Mango', 'Pear', 'Lemon', 'Peach', 'Apricot', 'Grapes', 'Cactus'];
    public selected: string;

    public selectBanana() {
        this.selectFruits.setSelectedItem(3);
    }

    public setToNull() {
        this.selectFruits.value = null;
        this.selected = null;
    }
}
