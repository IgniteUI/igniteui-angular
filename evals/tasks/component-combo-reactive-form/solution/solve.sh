#!/bin/bash
# Reference solution for component-combo-reactive-form
# Proves the task is solvable and validates grader correctness

set -euo pipefail

mkdir -p src/app/user-settings

# Create the component TypeScript file
cat > src/app/user-settings/user-settings.component.ts << 'EOF'
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IgxComboComponent } from 'igniteui-angular';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IgxComboComponent],
})
export class UserSettingsComponent {
  channels = [
    { id: 1, name: 'Email', icon: 'email' },
    { id: 2, name: 'SMS', icon: 'sms' },
    { id: 3, name: 'Push Notification', icon: 'notifications' },
    { id: 4, name: 'Slack', icon: 'chat' },
    { id: 5, name: 'Microsoft Teams', icon: 'groups' },
  ];

  settingsForm = new FormGroup({
    notificationChannels: new FormControl<number[]>([], Validators.required),
  });

  onSubmit() {
    if (this.settingsForm.valid) {
      console.log('Selected channels:', this.settingsForm.value.notificationChannels);
    }
  }
}
EOF

# Create the template
cat > src/app/user-settings/user-settings.component.html << 'EOF'
<form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
  <igx-combo
    [data]="channels"
    [displayKey]="'name'"
    [valueKey]="'id'"
    formControlName="notificationChannels"
    placeholder="Select notification channels"
  ></igx-combo>

  <button type="submit" [disabled]="settingsForm.invalid">Save Settings</button>
</form>
EOF
