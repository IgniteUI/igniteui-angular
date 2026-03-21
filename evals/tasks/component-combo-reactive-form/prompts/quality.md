# Component Combo Reactive Form — LLM Rubric

Evaluate the agent's approach to adding a multi-select combo bound to a reactive form.

## Correct Component Selection (0–0.3)
- Did the agent choose `igx-combo` for the multi-select requirement?
- Did the agent avoid using `igx-select` (which is single-select only)?
- Did the agent avoid using native `<select multiple>`, Angular Material `mat-select`, or other third-party select components?
- Did the agent correctly identify that multi-select requires the Combo component, not the Select component?

## Skill Routing & Reference File Usage (0–0.3)
- Did the agent read the components skill SKILL.md to identify the correct component?
- Did the agent read `references/form-controls.md` for Combo API details?
- Did the agent follow the mandatory protocol (identify component → read references → produce output)?
- Did the agent avoid writing code from memory without consulting references?

## Idiomatic API Usage (0–0.25)
- Did the agent bind data using `[data]` input on the combo?
- Did the agent configure `[displayKey]` and `[valueKey]` correctly?
- Did the agent use `[formControlName]` or `[formControl]` to bind to the reactive form?
- Did the agent import from the correct igniteui-angular entry point?
- Did the agent import `ReactiveFormsModule` or use standalone form directives?

## Code Quality (0–0.15)
- Is the component standalone with `ChangeDetectionStrategy.OnPush`?
- Did the agent set up form validation (required validator)?
- Did the agent avoid hallucinated API names or non-existent inputs/outputs?
- Is the code clean, well-structured, and following Angular best practices?
