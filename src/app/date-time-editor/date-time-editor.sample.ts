import { Component } from '@angular/core';
import { IgxDateTimeEditorEventArgs } from 'igniteui-angular';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxSuffixDirective } from '../../../projects/igniteui-angular/src/lib/directives/suffix/suffix.directive';
import { FormsModule } from '@angular/forms';
import { IgxDateTimeEditorDirective } from '../../../projects/igniteui-angular/src/lib/directives/date-time-editor/date-time-editor.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';

@Component({
    selector: 'app-date-time-editor',
    templateUrl: './date-time-editor.sample.html',
    styleUrls: ['./date-time-editor.sample.css'],
    standalone: true,
    imports: [IgxInputGroupComponent, IgxInputDirective, IgxDateTimeEditorDirective, FormsModule, IgxSuffixDirective, IgxRippleDirective, IgxButtonDirective, IgxIconComponent]
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
