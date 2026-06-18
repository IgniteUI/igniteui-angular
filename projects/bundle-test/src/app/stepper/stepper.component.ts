import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgxStepperComponent } from 'igniteui-angular/stepper';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [IgxStepperComponent],
  templateUrl: './stepper.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
}
