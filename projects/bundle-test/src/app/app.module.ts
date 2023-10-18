import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
// import { AppRoutingModule } from './app-routing.module';
import { IgxChipsModule } from 'igniteui-angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // AppRoutingModule,
    IgxChipsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
