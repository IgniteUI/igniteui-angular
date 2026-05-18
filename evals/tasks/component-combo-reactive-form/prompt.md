# Agent Prompt: Combo with Reactive Form

You are working in an Angular 20+ project that already has `igniteui-angular` installed.

Create a `UserSettingsComponent` at `src/app/user-settings/user-settings.component.ts` with a reactive form containing a multi-select combo for notification channel selection.

Use this data:

```typescript
channels = [
  { id: 1, name: 'Email', icon: 'email' },
  { id: 2, name: 'SMS', icon: 'sms' },
  { id: 3, name: 'Push Notification', icon: 'notifications' },
  { id: 4, name: 'Slack', icon: 'chat' },
  { id: 5, name: 'Microsoft Teams', icon: 'groups' },
];
```

Requirements:
- Use the Ignite UI for Angular `igx-combo` component (NOT igx-select, native select, or mat-select)
- Bind the combo to a `notificationChannels` FormControl inside a FormGroup
- Set displayKey to 'name' and valueKey to 'id'
- Add required validation (at least one channel must be selected)
- Add a submit button disabled when form is invalid
- Import IgxComboComponent from the `igniteui-angular/combo` entry point (not the root barrel)
- Import ReactiveFormsModule for form support
- Component must be standalone with ChangeDetectionStrategy.OnPush
- Create both a `.ts` file and a `.html` template file
