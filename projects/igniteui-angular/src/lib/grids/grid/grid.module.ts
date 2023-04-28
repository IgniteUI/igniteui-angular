import { NgModule } from '@angular/core';
import { IGX_GRID_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
  imports: [
    ...IGX_GRID_DIRECTIVES
  ],
  exports: [
    ...IGX_GRID_DIRECTIVES
  ]
})
export class IgxGridModule {}
