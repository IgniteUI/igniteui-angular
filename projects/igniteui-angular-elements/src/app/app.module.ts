
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { IgxGridComponent, IgxGridModule } from 'igniteui-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IgxGridModule
  ],
  providers: []
})
export class AppModule {

  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const grid = createCustomElement(IgxGridComponent, { injector: this.injector });
    customElements.define("igx-grid", grid);

    // const pager = createCustomElement(IgxPaginatorComponent, { injector: this.injector });
    // customElements.define("igc-paginator", pager);
  }

}
