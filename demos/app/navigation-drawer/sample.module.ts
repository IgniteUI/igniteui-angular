import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { NavigationClose, NavigationDrawerModule, NavigationToggle } from "../../../src/main";
import { MainDrawerSampleComponent,
    MiniNavDrawerSampleComponent,
    NavDrawerSampleComponent,
    PinNavDrawerSampleComponent } from "./sample.component";

const routes: Routes = [
  {
      children: [
        { path: "", component: MainDrawerSampleComponent },
        { path: "pin", component: PinNavDrawerSampleComponent },
        { path: "mini", component: MiniNavDrawerSampleComponent }
      ],
      component: NavDrawerSampleComponent,
      path: "navigation-drawer"
  }

];

@NgModule({
    declarations: [
        NavigationClose,
        NavigationToggle,
        NavDrawerSampleComponent,
        MainDrawerSampleComponent,
        PinNavDrawerSampleComponent,
        MiniNavDrawerSampleComponent
    ],
    imports: [
        NavigationDrawerModule,
        CommonModule, // for core directives
        FormsModule, // for ngModel binding
        RouterModule.forChild(routes)
    ]
})
export class NavDrawerSampleModule {}
