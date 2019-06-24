import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgxIconComponent } from './icon.component';
import { DeprecateMethod } from '../core/deprecateDecorators';

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxIconComponent],
    exports: [IgxIconComponent],
    imports: [CommonModule]
})
export class IgxIconModule {
    @DeprecateMethod('IgxIconModule.forRoot method is deprecated. Use IgxIconModule instead.')
    public static forRoot() {
        return {
            ngModule: IgxIconModule
        };
    }
}

export * from './icon.component';
export * from './icon.service';
