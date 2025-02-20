import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxDateTimeEditorDirective, IgxDateTimeEditorEventArgs, IgxIconButtonDirective, IgxIconComponent, IgxInputDirective, IgxInputGroupComponent, IgxRippleDirective, IgxSuffixDirective } from 'igniteui-angular';

@Component({
    selector: 'app-date-time-editor',
    templateUrl: './date-time-editor.sample.html',
    styleUrls: ['./date-time-editor.sample.css'],
    imports: [IgxInputGroupComponent, IgxInputDirective, IgxDateTimeEditorDirective, FormsModule, IgxSuffixDirective, IgxRippleDirective, IgxIconComponent, IgxIconButtonDirective]
})
export class DateTimeEditorSampleComponent {
  public date = new Date(2020, 2, 23);
  public date1 = new Date(2021, 3, 24);
  public format = 'dd/M/yyyy';

  public minDate = new Date(2020, 2, 20, 11, 15);
  public maxDate = new Date(2020, 2, 25);

  public valueChange(event: Date | string) {
    console.log('value changed', event);
  }

  public onValidationFailed(event: IgxDateTimeEditorEventArgs) {
    console.log('validation failed', event.oldValue, event.newValue);
  }
}
