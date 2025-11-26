import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class IgxRowIslandAPIService {
    public rowIsland: IgxRowIslandComponent;
    public change: Subject<any> = new Subject<any>();
    protected state: Map<string, IgxRowIslandComponent> = new Map<string, IgxRowIslandComponent>();
    protected destroyMap: Map<string, Subject<boolean>> = new Map<string, Subject<boolean>>();

    protected childRowIslands: Map<string, IgxRowIslandComponent> = new Map<string, IgxRowIslandComponent>();
    protected childGrids:  Map<any, IgxHierarchicalGridComponent> = new Map<any, IgxHierarchicalGridComponent>();

    public register(rowIsland: IgxRowIslandComponent) {
        this.state.set(rowIsland.id, rowIsland);
        this.destroyMap.set(rowIsland.id, new Subject<boolean>());
    }

    public unsubscribe(rowIsland: IgxRowIslandComponent) {
        this.state.delete(rowIsland.id);
    }

    public get(id: string): IgxRowIslandComponent {
        return this.state.get(id);
    }

    public unset(id: string) {
        this.state.delete(id);
        this.destroyMap.delete(id);
    }

    public reset(oldId: string, newId: string) {
        const destroy = this.destroyMap.get(oldId);
        const rowIsland = this.get(oldId);

        this.unset(oldId);

        if (rowIsland) {
            this.state.set(newId, rowIsland);
        }

        if (destroy) {
            this.destroyMap.set(newId, destroy);
        }
    }

    public registerChildRowIsland(rowIsland: IgxRowIslandComponent) {
        this.childRowIslands.set(rowIsland.key, rowIsland);
        this.destroyMap.set(rowIsland.key, new Subject<boolean>());
    }

    public unsetChildRowIsland(rowIsland: IgxRowIslandComponent) {
        this.childRowIslands.delete(rowIsland.key);
        this.destroyMap.delete(rowIsland.key);
    }

    public getChildRowIsland(rowIslandKey: string) {
        return this.childRowIslands.get(rowIslandKey);
    }

    public registerChildGrid(parentRowID: any, grid: IgxHierarchicalGridComponent) {
        this.childGrids.set(parentRowID, grid);
    }

    public getChildGrids(inDepth?: boolean) {
        let allChildren = [];
        this.childGrids.forEach((grid) => {
            allChildren.push(grid);
        });
        if (inDepth) {
            this.childRowIslands.forEach((layout) => {
                allChildren = allChildren.concat(layout.rowIslandAPI.getChildGrids(inDepth));
            });
        }

        return allChildren;
    }

    public getChildGridByID(rowID) {
        return this.childGrids.get(rowID);
    }
}
