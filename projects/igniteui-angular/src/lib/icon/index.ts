import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgxIconComponent } from './icon.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [IgxIconComponent],
    exports: [IgxIconComponent],
    imports: [CommonModule, HttpClientModule]
})
export class IgxIconModule {}

export * from './icon.component';
export * from './icon.service';
