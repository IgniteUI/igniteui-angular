import { IgxSelectItemComponent } from './select-item.component';
import { QueryList } from '@angular/core';

export interface ISelectComponent {
    children: QueryList<IgxSelectItemComponent>;
}
