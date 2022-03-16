import { CommonModule } from '@angular/common';
import { Component, ContentChild, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ChildStandaloneComponent } from './child-standalone/child-standalone.component';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent {
    @ContentChild(ChildStandaloneComponent)
    public child: ChildStandaloneComponent | Element;

    public get childComponent(): ChildStandaloneComponent | Element {
        if (!this.child) {
            const collection = document.getElementsByTagName('app-child-standalone');
            this.child = collection?.length ? collection.item(0) : null;
        }
        return this.child
    }

    constructor() { }

    public changeChildText() {
      if (this.childComponent) {
        (this.childComponent as ChildStandaloneComponent).text = "Parent modified text.";
      }
    }
}

@NgModule({
    declarations: [
        WrapperComponent,
        ChildStandaloneComponent
    ],
    exports: [
        WrapperComponent,
        ChildStandaloneComponent
    ],
    imports: [
      BrowserModule,
      CommonModule
    ]
  })
  export class WrapperModule {}
