import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgxIconComponent } from './icon.component';
import { IgxIconService } from './icon.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [IgxIconComponent],
    exports: [IgxIconComponent],
    imports: [CommonModule, HttpClientModule],
    providers: [IgxIconService]
})
export class IgxIconModule {
    public static forRoot() {
        return {
            ngModule: IgxIconModule,
            providers: [IgxIconService]
        };
    }
}

export * from './icon.component';
export * from './icon.service';
