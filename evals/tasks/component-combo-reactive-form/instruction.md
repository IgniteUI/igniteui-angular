# Task: Add a Multi-Select Combo in a Reactive Form

You are working in an Angular 20+ project that already has `igniteui-angular` installed and a theme applied.

## Requirements

Create a `UserSettingsComponent` with a reactive form that includes a multi-select combo for choosing notification channels.

1. **Component location**: `src/app/user-settings/user-settings.component.ts` (with its template)

2. **Form structure**: Create a reactive form (`FormGroup`) with a `notificationChannels` control

3. **Data source**: Use the following list of notification channels:

   ```typescript
   channels = [
     { id: 1, name: 'Email', icon: 'email' },
     { id: 2, name: 'SMS', icon: 'sms' },
     { id: 3, name: 'Push Notification', icon: 'notifications' },
     { id: 4, name: 'Slack', icon: 'chat' },
     { id: 5, name: 'Microsoft Teams', icon: 'groups' },
   ];
   ```

4. **Combo configuration**:
   - Use the Ignite UI for Angular Combo component for multi-selection
   - Bind it to the `notificationChannels` form control
   - Display the `name` field in the dropdown
   - Use the `id` field as the value key

5. **Form validation**: The `notificationChannels` control must be required (at least one channel must be selected)

6. **Submit button**: Add a submit button that is disabled when the form is invalid

## Constraints

- Use the Ignite UI `igx-combo` component — do NOT use a native `<select multiple>`, `igx-select`, or Angular Material `mat-select`.
- Import from the correct `igniteui-angular` entry point.
- The component must be standalone and use `ChangeDetectionStrategy.OnPush`.
- Use reactive forms (`FormGroup` / `FormControl`), not template-driven forms.
