export interface IProductNode {
    ID: number;
    ParentID: number; // Referência ao ID do pai (-1 para raízes)
    Name: string;
    UnitPrice: number;
    AddedDate: Date;
    Discontinued: boolean;
}