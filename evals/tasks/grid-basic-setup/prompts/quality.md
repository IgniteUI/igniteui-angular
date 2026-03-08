# Grid Basic Setup — LLM Rubric

Evaluate the agent's approach to adding a flat data grid with sorting and pagination.

## Correct Grid Type Selection (0–0.3)
- Did the agent choose `igx-grid` (Flat Grid) for the flat employee data?
- Did the agent avoid `igx-tree-grid`, `igx-hierarchical-grid`, or `igx-pivot-grid` — which are wrong for flat, non-hierarchical data?
- Did the agent avoid native HTML `<table>`, Angular Material `mat-table`, or other third-party grids?

## Skill Routing & Reference File Usage (0–0.3)
- Did the agent read the grids skill SKILL.md to identify the correct grid type?
- Did the agent read the relevant reference files (`structure.md` for columns/sorting, `paging-remote.md` for pagination) before writing code?
- Did the agent follow the mandatory protocol (identify grid type → read references → produce output)?

## Idiomatic API Usage (0–0.25)
- Did the agent bind data correctly using the `[data]` input?
- Did the agent use `igx-column` elements with correct `[field]` bindings for each data field?
- Did the agent enable sorting correctly (e.g., `[sortable]="true"` on columns or grid-level `[allowSorting]`)?
- Did the agent import from the correct entry point (`igniteui-angular/grids/grid`)?
- Did the agent use `IGX_GRID_DIRECTIVES` or individual component imports?

## Code Quality (0–0.15)
- Is the component standalone with `ChangeDetectionStrategy.OnPush`?
- Did the agent avoid hallucinated API names or non-existent inputs/outputs?
- Is the code clean and well-structured?
