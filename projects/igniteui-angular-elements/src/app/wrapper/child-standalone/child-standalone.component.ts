import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-child-standalone',
  templateUrl: './child-standalone.component.html',
  styleUrls: ['./child-standalone.component.scss']
})
export class ChildStandaloneComponent {

    @Input()
    public text = "Default input text.";

    @Input()
    public template: TemplateRef<any>;

    public get context() {
      const ctx = {
        $implicit: this.text
      };
      return ctx;
    }

    constructor() { }
}
