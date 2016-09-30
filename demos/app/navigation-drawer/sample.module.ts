import { NgModule } from "@angular/core";
import { CommonModule }   from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from '@angular/router';

import { NavigationDrawerModule, NavigationClose, NavigationToggle } from "../../../src/main";
import { NavDrawerSampleComponent, MainDrawerSampleComponent, PinNavDrawerSampleComponent, MiniNavDrawerSampleComponent } from './sample.component';

const routes: Routes = [
  { 
      path: 'navigation-drawer',
      component: NavDrawerSampleComponent,
      children: [
        { path: '', component: MainDrawerSampleComponent },
        { path: 'pin', component: PinNavDrawerSampleComponent },
        { path: 'mini', component: MiniNavDrawerSampleComponent }
      ]
  },
 
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