/**
 * ---------------------------------------------------------------------------
 * FOR TESTING PURPOSES ONLY - SAFE TO REMOVE AFTER REVIEW.
 *
 * Manual repro / verification page for issue #17292 (custom `igxRowSelector`
 * checkbox state getting out of sync with the row selection when rows are
 * recycled by virtualization). Covers all three grid flavours that share the
 * row rendering code: igx-grid, igx-hierarchical-grid and igx-tree-grid.
 *
 * Not referenced by the library or its tests - only wired into the dev demo
 * app routes/nav. Delete this folder and its route/nav entries once the fix
 * has been reviewed.
 * ---------------------------------------------------------------------------
 */
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
    IgxColumnComponent,
    IgxGridComponent,
    IgxRowSelectorDirective,
    IGX_HIERARCHICAL_GRID_DIRECTIVES,
    IGX_TREE_GRID_DIRECTIVES,
    IRowSelectionEventArgs
} from 'igniteui-angular';

interface Person {
    ID: number;
    Name: string;
    Department: string;
}

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance'];

const PEOPLE: Person[] = Array.from({ length: 25 }, (_, i) => ({
    ID: i + 1,
    Name: `Person ${i + 1}`,
    Department: DEPARTMENTS[i % DEPARTMENTS.length]
}));

// Nested data for the hierarchical grid (root record + `childData` collection).
const HIERARCHICAL_DATA = Array.from({ length: 25 }, (_, i) => ({
    ID: i + 1,
    Name: `Parent ${i + 1}`,
    Department: DEPARTMENTS[i % DEPARTMENTS.length],
    childData: Array.from({ length: 4 }, (_, j) => ({
        ID: (i + 1) * 100 + j,
        Name: `Child ${i + 1}.${j + 1}`,
        Department: DEPARTMENTS[(i + j) % DEPARTMENTS.length]
    }))
}));

// Nested data for the tree grid (`childDataKey = children`), 3 levels deep so cascading
// selection (and partially-selected/indeterminate middle parents) can be exercised.
const TREE_DATA = Array.from({ length: 10 }, (_i, i) => ({
    ID: i + 1,
    Name: `Node ${i + 1}`,
    Department: DEPARTMENTS[i % DEPARTMENTS.length],
    children: Array.from({ length: 3 }, (_j, j) => ({
        ID: (i + 1) * 100 + (j + 1) * 10,
        Name: `Node ${i + 1}.${j + 1}`,
        Department: DEPARTMENTS[(i + j) % DEPARTMENTS.length],
        children: Array.from({ length: 2 }, (_k, k) => ({
            ID: (i + 1) * 100 + (j + 1) * 10 + (k + 1),
            Name: `Node ${i + 1}.${j + 1}.${k + 1}`,
            Department: DEPARTMENTS[(i + j + k) % DEPARTMENTS.length],
            children: []
        }))
    }))
}));

@Component({
    selector: 'app-grid-row-selector-cd-sample',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .testing-banner {
            margin: 16px; padding: 8px 16px; border: 2px dashed #b71c1c; border-radius: 6px;
            background: #fff3f3; color: #b71c1c; font-weight: 600;
        }
        .section { padding: 8px 16px 24px; }
        .section h2 { margin: 8px 0 4px; }
        .wrapper { display: flex; gap: 24px; flex-wrap: wrap; }
        .col { display: flex; flex-direction: column; gap: 8px; }
        .col h3 { margin: 0; }
        .buggy h3 { color: #c62828; }
        .control h3 { color: #2e7d32; }
        .sel-cb { width: 18px; height: 18px; }
        code { background: #eee; padding: 1px 4px; border-radius: 3px; }
        .hint { max-width: 900px; }
    `],
    template: `
    <div class="testing-banner">
        ⚠ FOR TESTING PURPOSES ONLY — this page is a manual repro for #17292 and can be removed after review.
    </div>

    <!-- ===================== FLAT GRID (A/B, the reported scenario) ===================== -->
    <div class="section">
        <h2>igx-grid — custom vs default row selector</h2>
        <p class="hint">Both grids share the <b>same</b> signal-computed data that keeps <b>selected rows sorted to the top</b>
           and the same selection. Left uses a custom <code>igxRowSelector</code> with a native
           <code>&lt;input type="checkbox" [checked]="rowContext.selected"&gt;</code>; right uses the built-in selector.</p>
        <ol class="hint">
            <li>Click a few checkboxes near the middle/bottom — they jump to the top (selected-first sort).</li>
            <li>Deselect rows <b>from the top</b>, one after another.</li>
            <li>Without the fix the left (custom) grid keeps stale checkbox states; the right (default) grid stays correct.</li>
        </ol>
        <p><b>Live selection:</b> {{ selectedIds() }}</p>
        <div class="wrapper">
            <div class="col buggy">
                <h3>Custom row selector</h3>
                <igx-grid #g1
                    [data]="data()" [primaryKey]="'ID'" [rowSelection]="'multiple'" [autoGenerate]="false"
                    [height]="'400px'" [width]="'420px'"
                    [selectedRows]="selectedIds()" (rowSelectionChanging)="onSelectionChanging($event)">
                    <igx-column field="ID" header="ID" [width]="'60px'"></igx-column>
                    <igx-column field="Name" header="Name"></igx-column>
                    <igx-column field="isSelected" header="isSelected" [width]="'90px'"></igx-column>
                    <ng-template igxRowSelector let-rowContext>
                        <input class="sel-cb" type="checkbox" [checked]="rowContext.selected" />
                    </ng-template>
                </igx-grid>
            </div>
            <div class="col control">
                <h3>Default row selector</h3>
                <igx-grid #g2
                    [data]="data()" [primaryKey]="'ID'" [rowSelection]="'multiple'" [autoGenerate]="false"
                    [height]="'400px'" [width]="'420px'"
                    [selectedRows]="selectedIds()" (rowSelectionChanging)="onSelectionChanging($event)">
                    <igx-column field="ID" header="ID" [width]="'60px'"></igx-column>
                    <igx-column field="Name" header="Name"></igx-column>
                    <igx-column field="isSelected" header="isSelected" [width]="'90px'"></igx-column>
                </igx-grid>
            </div>
        </div>
    </div>

    <!-- ===================== HIERARCHICAL GRID ===================== -->
    <div class="section">
        <h2>igx-hierarchical-grid — custom row selector (root + child island)</h2>
        <p class="hint">Both the root grid and the child island use a native-checkbox custom selector.
           Select rows, then <b>scroll</b> and <b>expand/collapse</b> — the custom checkboxes must stay in sync
           with the selection on every recycled row.</p>
        <igx-hierarchical-grid #hGrid
            [data]="hierarchicalData" [primaryKey]="'ID'" [rowSelection]="'multiple'" [autoGenerate]="false"
            [height]="'400px'" [width]="'640px'">
            <igx-column field="ID" header="ID" [width]="'70px'"></igx-column>
            <igx-column field="Name" header="Name"></igx-column>
            <igx-column field="Department" header="Department"></igx-column>

            <ng-template igxRowSelector let-rowContext>
                <input class="sel-cb" type="checkbox" [checked]="rowContext.selected" />
            </ng-template>

            <igx-row-island [key]="'childData'" [primaryKey]="'ID'" [rowSelection]="'multiple'"
                [autoGenerate]="false" [height]="'250px'">
                <igx-column field="ID" header="ID" [width]="'70px'"></igx-column>
                <igx-column field="Name" header="Name"></igx-column>
                <igx-column field="Department" header="Department"></igx-column>

                <ng-template igxRowSelector let-rowContext>
                    <input class="sel-cb" type="checkbox" [checked]="rowContext.selected" />
                </ng-template>
            </igx-row-island>
        </igx-hierarchical-grid>
    </div>

    <!-- ===================== TREE GRID (cascade) ===================== -->
    <div class="section">
        <h2>igx-tree-grid — custom row selector (multipleCascade)</h2>
        <p class="hint">Cascading selection: selecting a parent selects <b>all its descendants</b>, and a parent whose
           children are all selected becomes selected too. One click flips many rows programmatically — every
           recycled child checkbox must reflect it. Select a parent, then <b>scroll</b> and <b>expand/collapse</b>.</p>
        <p class="hint"><b>Known limitation (not #17292):</b> the custom <code>rowContext</code> exposes only
           <code>selected</code>, not the tri-state <code>indeterminate</code>. So a partially-selected parent
           shows here as <b>unchecked</b> with a plain <code>&lt;input&gt;</code>; the built-in
           <code>igx-checkbox</code> selector would show the indeterminate dash.</p>
        <igx-tree-grid #tGrid
            [data]="treeData" [primaryKey]="'ID'" childDataKey="children"
            [rowSelection]="'multipleCascade'" [autoGenerate]="false" [height]="'400px'" [width]="'560px'">
            <igx-column field="ID" header="ID" [width]="'80px'"></igx-column>
            <igx-column field="Name" header="Name"></igx-column>
            <igx-column field="Department" header="Department"></igx-column>

            <ng-template igxRowSelector let-rowContext>
                <input class="sel-cb" type="checkbox" [checked]="rowContext.selected" />
            </ng-template>
        </igx-tree-grid>
    </div>
    `,
    imports: [
        IgxGridComponent,
        IgxColumnComponent,
        IgxRowSelectorDirective,
        IGX_HIERARCHICAL_GRID_DIRECTIVES,
        IGX_TREE_GRID_DIRECTIVES
    ]
})
export class GridRowSelectorCdSampleComponent {
    // --- Flat grid: single source of truth for the selection. ---
    public selectedIds = signal<number[]>([]);

    // Computed data: adds an `isSelected` flag and sorts selected rows to the top,
    // mirroring the reported scenario (computed array + sort on the selection column).
    public data = computed(() => {
        const selected = new Set(this.selectedIds());
        return PEOPLE
            .map(p => ({ ...p, isSelected: selected.has(p.ID) }))
            .sort((a, b) => Number(b.isSelected) - Number(a.isSelected) || a.ID - b.ID);
    });

    // --- Hierarchical / tree grids: plain static data, exercised via scroll + expand/collapse. ---
    public hierarchicalData = HIERARCHICAL_DATA;
    public treeData = TREE_DATA;

    public onSelectionChanging(event: IRowSelectionEventArgs): void {
        // Keep our signal in sync with the grid selection -> re-computes & re-sorts the data.
        this.selectedIds.set(event.newSelection.map((r: Person) => r.ID));
    }
}
