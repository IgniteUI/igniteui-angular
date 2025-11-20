import { Component } from '@angular/core';
import { IgxStepperComponent } from 'igniteui-angular/stepper';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [IgxStepperComponent],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
}
