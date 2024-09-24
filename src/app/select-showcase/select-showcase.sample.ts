import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { IgxButtonDirective, IgxSelectComponent, IgxLabelDirective, IgxPrefixDirective, IgxIconComponent, IgxSelectItemComponent, IgxSelectHeaderDirective, IgxSelectFooterDirective, IgxButtonGroupComponent, IgxSuffixDirective, IgxHintDirective, IgxSelectGroupComponent, IgxSwitchComponent } from 'igniteui-angular';
import { SizeSelectorComponent } from '../size-selector/size-selector.component';
import { defineComponents, IgcSelectGroupComponent, IgcSelectComponent, IgcSelectItemComponent, IgcSelectHeaderComponent } from 'igniteui-webcomponents';

defineComponents(IgcSelectGroupComponent, IgcSelectComponent, IgcSelectItemComponent, IgcSelectHeaderComponent);

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-select-showcase-sample',
    styleUrls: ['./select-showcase.sample.scss'],
    templateUrl: './select-showcase.sample.html',
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
