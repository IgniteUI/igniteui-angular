import {
  Component,
  Input,
  ViewChild,
  ComponentRef,
  ViewContainerRef,
  OnInit,
} from '@angular/core';
import {
  IChangeCheckboxEventArgs,
  IgxRadioComponent,
  IgxRadioGroupDirective,
  RadioGroupAlignment,
} from 'igniteui-angular';

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.component.html',
  imports: [IgxRadioGroupDirective],
})
export class RadioGroupComponent implements OnInit {

  @Input() public alignment!: RadioGroupAlignment;
  @Input() public required!: boolean;
  @Input() public value!: unknown;

  public handleChange(args: IChangeCheckboxEventArgs) {
    this.value = args.value;
  }

  @ViewChild('radioContainer', { read: ViewContainerRef, static: true })
  public container!: ViewContainerRef;

  @Input() public radios: { label: string; value: any }[] = [];

  public ngOnInit(): void {
    this.container.clear();
    this.radios.forEach((option) => {
      const componentRef: ComponentRef<IgxRadioComponent> =
        this.container.createComponent(IgxRadioComponent);

      componentRef.instance.placeholderLabel.nativeElement.textContent =
        option.label;
      componentRef.instance.value = option.value;
    });
  }
}
