
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { IgxGridComponent, IgxGridModule } from 'igniteui-angular';

@NgModule({
  imports: [
    BrowserModule,
    IgxGridModule
  ],
  providers: []
})
export class AppModule {

  constructor(private injector: Injector){}

  ngDoBootstrap(){
    const grid = createCustomElement(IgxGridComponent, { injector: this.injector })
    customElements.define("igc-grid", grid);
  }

}
