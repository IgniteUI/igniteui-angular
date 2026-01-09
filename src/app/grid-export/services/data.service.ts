import { Injectable } from '@angular/core';
import { IProduct } from '../models/grid-models';
import { GRID_DATA } from '../data/gridData';
import { TGRID_DATA } from '../data/tGridData';
import { HGRID_DATA } from '../data/hGridData';
import { IProductNode } from '../models/product-category.interface';
import { ISinger } from '../models/singer.interfaces';


@Injectable({ providedIn: 'root' })
export class GridDataService {
    public getFlatGridData(): IProduct[] {
        return GRID_DATA;
    }   
    public getTreeGridData(): IProductNode[] {
        return TGRID_DATA;
    }
    public getHierarchicalGridData(): ISinger[] {
        return HGRID_DATA;
    }
}