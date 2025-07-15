import { Injectable } from '@angular/core';
import { Mulberry32 } from '../lib/mulberry';
import { DATA as athletesData } from "../data/athletesData"
import { CITIES, FIRSTNAMES, LASTNAMES, MOCKATHLETESDATA, ROADNAMES, ROADSFX } from '../data/mockData';


@Injectable({
    providedIn: 'root'
})
export class DataService {
    private rows = 10000;
    private cols = 30;
    constructor() { }
    public generateData(): any[] {
        const rnd = new Mulberry32(1234);
        return this.generateAthletesData(rnd);
    }

    private generateAthletesData(rnd: Mulberry32): any[] {
        const currData = [];
        for (let i = 0; i < this.rows; i++) {
            const rand = Math.floor(rnd.random() * Math.floor(athletesData.length));
            const dataObj = Object.assign({}, athletesData[rand]);

            dataObj["Registered"] = this.randomizeDate(rnd);
            dataObj["FirstAppearance"] = this.randomizeDate(rnd);
            dataObj["Relatives"] = this.randomizeName(rnd);

            for (const mockData of MOCKATHLETESDATA) {
                for (const prop in mockData) {
                    if (mockData.hasOwnProperty(prop)) {
                        const operation = Math.round(rnd.random());
                        dataObj[prop] = operation ?
                            mockData[prop] + (this.generateRandomNumber(rnd, 1, 22) / 100) * mockData[prop] :
                            mockData[prop] - (this.generateRandomNumber(rnd, 1, 22) / 100) * mockData[prop];
                    }
                }
            }

            dataObj["Trainer"] = this.randomizeName(rnd);
            dataObj["TrainerRegistration"] = this.randomizeDate(rnd);
            dataObj["CareerStart"] = this.randomizeDate(rnd);
            dataObj["CurrentAddress"] = this.getRandomStreet(rnd);
            dataObj["DebutCity"] = this.getRandomCity(rnd);

            for (const mockData of MOCKATHLETESDATA) {
                for (const prop in mockData) {
                    if (mockData.hasOwnProperty(prop)) {
                        const operation = Math.round(rnd.random());
                        dataObj["Trainer" + prop] = operation ?
                            mockData[prop] + (this.generateRandomNumber(rnd, 1, 22) / 100) * mockData[prop] :
                            mockData[prop] - (this.generateRandomNumber(rnd, 1, 22) / 100) * mockData[prop];
                    }
                }
            }

            dataObj.Id = i + 1;

            const obj = {};
            let k = 0;
            for (const x in dataObj) {
                if (k >= this.cols - 2) {
                    break;
                }
                obj[x] = dataObj[x];
                k += 1;
            }

            currData.push(obj);
        }
        return currData;
    }

    private randomizeDate(rnd: Mulberry32) {
        const date = new Date();
        date.setHours(this.generateRandomNumber(rnd, 0, 23));
        date.setMonth(this.generateRandomNumber(rnd, 0, date.getMonth()));
        date.setDate(this.generateRandomNumber(rnd, 0, 23));
        return (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear();
    }

    private generateRandomNumber(rnd, min, max) {
        return Math.floor(rnd.random() * (max - min + 1)) + min;
    }
    
    private randomizeName(rnd: Mulberry32) {
        const firstNum = this.generateRandomNumber(rnd, 0, FIRSTNAMES.length - 1);
        const lastNum = this.generateRandomNumber(rnd, 0, LASTNAMES.length - 1);
        return FIRSTNAMES[firstNum] + " " + LASTNAMES[lastNum];
    }

    private getRandomStreet(rnd: Mulberry32): string {
        const roadNum = this.generateRandomNumber(rnd, 0, ROADNAMES.length - 1);
        const sfxNum = this.generateRandomNumber(rnd, 0, ROADSFX.length - 1);
        const num = Math.round(this.generateRandomNumber(rnd, 100, 300)).toString();
        return num + " " + ROADNAMES[roadNum] + " " + ROADSFX[sfxNum];
    }

    private getRandomCity(rnd: Mulberry32): string {
        const cityNum = this.generateRandomNumber(rnd, 0, CITIES.length - 1);
        return CITIES[cityNum];
    }
}