import { Component } from '@angular/core';
import { ChipResourceStringsBG } from 'igniteui-angular-i18n';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected chipStrings = ChipResourceStringsBG;
}
