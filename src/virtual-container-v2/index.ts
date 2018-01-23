import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { HorizontalChunkComponent } from "./horizontal-chunk.component";
import { VerticalChunkComponent } from "./vertical-chunk.component";
import { VirtualContainerComponent } from "./virtual-container.component";

@NgModule({
    declarations: [
      VirtualContainerComponent,
      VerticalChunkComponent,
      HorizontalChunkComponent
    ],
    entryComponents: [
      VerticalChunkComponent,
      HorizontalChunkComponent
    ],
    imports: [
      CommonModule
    ],
    exports: [
      VirtualContainerComponent,
      VerticalChunkComponent,
      HorizontalChunkComponent
    ]
})
export class VirtualContainerV2Module {
    public static forRoot() {
      return {
        ngModule: VirtualContainerV2Module
      };
    }
  }