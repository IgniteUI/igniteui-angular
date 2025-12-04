import { Component } from '@angular/core';
import { IgxStepperComponent } from 'igniteui-angular';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [IgxStepperComponent],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
}
