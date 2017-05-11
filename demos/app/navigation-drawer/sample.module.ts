import { CommonModule }   from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { NavigationClose, NavigationDrawerModule, NavigationToggle } from "../../../src/main";
import { MainDrawerSampleComponent, MiniNavDrawerSampleComponent, NavDrawerSampleComponent, PinNavDrawerSampleComponent } from "./sample.component";

const routes: Routes = [
  {
      path: "navigation-drawer",
      component: NavDrawerSampleComponent,
      children: [
        { path: "", component: MainDrawerSampleComponent },
        { path: "pin", component: PinNavDrawerSampleComponent },
        { path: "mini", component: MiniNavDrawerSampleComponent }
      ]
  }

];

@NgModule({
    imports: [
        NavigationDrawerModule,
        CommonModule, // for core directives
        FormsModule, // for ngModel binding
        RouterModule.forChild(routes)
    ],
    declarations: [
        NavigationClose,
        NavigationToggle,
        NavDrawerSampleComponent,
        MainDrawerSampleComponent,
        PinNavDrawerSampleComponent,
        MiniNavDrawerSampleComponent
    ]
})
export class NavDrawerSampleModule {}