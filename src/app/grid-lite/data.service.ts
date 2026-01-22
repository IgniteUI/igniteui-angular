import { Injectable } from '@angular/core';

export interface UserSimple {
    id: string;
    username: string;
    email: string;
    subscribed: boolean;
}

export interface ProductInfo {
    id: string;
    name: string;
    price: number;
    sold: number;
    rating: number;
    total: number;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    avatar: string;
    active: boolean;
    priority: 'Low' | 'Standard' | 'High';
    satisfaction: number;
    registeredAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class GridLiteDataService {
    private counter = 0;

    private namesMen = ['John', 'john', 'Mark', 'Charlie', 'Martin', 'Bill', 'Frank', 'Larry', 'Henry', 'Steve', 'Mike', 'Andrew'];
    private namesWomen = ['Jane', 'Alice', 'Diana', 'Eve', 'Grace', 'Katie', 'Irene', 'Liz', 'Fiona', 'Pam', 'Val', 'Mindy'];
    private lastNames = ['Smith', 'Johnson', 'Mendoza', 'Brown', 'Spencer', 'Stone', 'Stark', 'Rooney'];
    private productNames = ['Widget', 'Gadget', 'Gizmo', 'Device', 'Tool', 'Instrument', 'Machine', 'Equipment'];
    private productModels = ['Pro', 'Plus', 'Max', 'Ultra', 'Mini', 'Lite'];
    private priorities: ('Low' | 'Standard' | 'High')[] = ['Low', 'Standard', 'High'];

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private randomFloat(min: number, max: number, precision = 2): number {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const random01 = array[0] / 2 ** 32;
        return parseFloat((random01 * (max - min) + min).toFixed(precision));
    }

    private randomElement<T>(array: T[]): T {
        return array[this.randomInt(0, array.length - 1)];
    }

    private randomBoolean(): boolean {
        const array = new Uint8Array(1);
        window.crypto.getRandomValues(array);
        return (array[0] & 1) === 0;
    }

    private generateId(): string {
        return `1000-${this.counter++}-${this.randomInt(1000, 9999)}`;
    }

    private createProductInfo(): ProductInfo {
        const price = this.randomFloat(50, 500, 2);
        const sold = this.randomInt(10, 100);
        const total = parseFloat((price * sold).toFixed(2));
        const product = this.randomElement(this.productNames) + ' ' + this.randomElement(this.productModels);

        return {
            price,
            sold,
            total,
            id: this.generateId(),
            name: product,
            rating: this.randomFloat(0, 5, 1)
        };
    }

    private createUserSimple(): UserSimple {
        const firstName = this.randomElement(this.namesMen.concat(this.namesWomen)).toLowerCase();
        const lastName = this.randomElement(this.lastNames).toLowerCase();
        const email = firstName + '.' + lastName + '@example.com';
        const username = firstName + '.' + lastName + this.randomInt(1, 99);
        return {
            id: this.generateId(),
            username: username,
            email: email,
            subscribed: this.randomBoolean()
        };
    }

    private createUser(): User {
        let imagePath: string = "";
        let firstName: string = "";
        const gender = this.randomInt(0, 1);
        if (gender === 0) {
            imagePath = "https://dl.infragistics.com/x/img/people/men/" + this.randomInt(10, 40) + ".png";
            firstName = this.randomElement(this.namesMen);
        } else {
            imagePath = "https://dl.infragistics.com/x/img/people/women/" + this.randomInt(10, 40) + ".png";
            firstName = this.randomElement(this.namesWomen);
        }
        const lastName = this.randomElement(this.lastNames);
        const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@example.com';

        return {
            id: this.generateId(),
            firstName,
            lastName,
            age: this.randomInt(18, 90),
            email,
            avatar: imagePath,
            active: this.randomBoolean(),
            priority: this.randomElement(this.priorities),
            satisfaction: this.randomInt(0, 5),
            registeredAt: new Date(Date.now() - this.randomInt(0, 365 * 24 * 60 * 60 * 1000))
        };
    }

    public generateUsers(count: number): User[] {
        return Array.from({ length: count }, () => this.createUser());
    }

    public generateProducts(count: number): ProductInfo[] {
        return Array.from({ length: count }, () => this.createProductInfo());
    }

    public generateSimpleUsers(count: number): UserSimple[] {
        return Array.from({ length: count }, () => this.createUserSimple());
    }
}
