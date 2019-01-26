import { NgModule } from '@angular/core';
import { IgxDropDownComponent } from './drop-down.component';
import { IgxDropDownItemComponent } from './drop-down-item.component';
import { IgxDropDownItemNavigationDirective } from './drop-down-navigation.directive';
import { CommonModule } from '@angular/common';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { IgxSelectionAPIService } from '../core/selection';
import { IgxDropDownGroupComponent } from './drop-down-group.component';

export * from './drop-down.component';
export * from './drop-down-item.component';
export { ISelectionEventArgs, IDropDownNavigationDirective,  } from './drop-down.common';
export * from './drop-down-navigation.directive';
export * from './drop-down.base';
export * from './drop-down-item.base';
export * from './drop-down-group.component';


@NgModule({
    declarations: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownGroupComponent, IgxDropDownItemNavigationDirective],
    exports: [IgxDropDownComponent, IgxDropDownItemComponent, IgxDropDownGroupComponent, IgxDropDownItemNavigationDirective],
    imports: [CommonModule, IgxToggleModule],
    providers: [IgxSelectionAPIService]
})
export class IgxDropDownModule { }
