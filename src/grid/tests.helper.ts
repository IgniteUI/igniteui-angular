import { SortingStrategy } from "../../src/data-operations/sorting-strategy"
import { StableSortingStrategy } from "../../src/data-operations/stable-sorting-strategy"

const KEY_JOB_TITLE: String =  "JobTitle";

export class CustomJobTitleSortingStrategy extends SortingStrategy {
    jobTitles = {
        ceo : { name: "CEO", weight: 1 },
        vicePresident : { name: "Vice President", weight: 2 },
        director: { name: "Director", weight: 3 },
        manager : { name: "Manager", weight: 4 },
        softwareDevTeamLead : { name: "Software Development Team Lead", weight: 5 },
        seniorSoftDev : { name: "Senior Software Developer", weight: 6 },
        softwareDeveloper : { name : "Software Developer", weight: 7 },
        associateSoftwareDev : { name : "Associate Software Developer", weight : 8}
    };

    private getJobTitleWeight(value): number {
        var weight = 0;

        switch (value) {
            case this.jobTitles.ceo.name:
                weight = this.jobTitles.ceo.weight;
                break;
            case this.jobTitles.vicePresident.name:
                weight = this.jobTitles.vicePresident.weight;
                break;
            case this.jobTitles.director.name:
                weight = this.jobTitles.director.weight;
                break;
            case this.jobTitles.manager.name:
                weight = this.jobTitles.manager.weight;
                break;
            case this.jobTitles.softwareDevTeamLead.name:
                weight = this.jobTitles.softwareDevTeamLead.weight;
                break;
            case this.jobTitles.seniorSoftDev.name:
                weight = this.jobTitles.seniorSoftDev.weight;
                break;
            case this.jobTitles.softwareDeveloper.name:
                weight = this.jobTitles.softwareDeveloper.weight;
                break;
            case this.jobTitles.associateSoftwareDev.name:
                weight = this.jobTitles.associateSoftwareDev.weight;
                break;
            default:
                break;
        }
        return weight;
    }

    protected compareObjects(obj1: object, obj2: object, key: string, reverse: number, ignoreCase: boolean):number {
        var res;
        if (key === KEY_JOB_TITLE) {
            res = reverse * this.compareValues(this.getJobTitleWeight(obj1[key]),
                                            this.getJobTitleWeight(obj2[key]));
        } else {
            res = super.compareObjects.apply(this, arguments);
        }
        const replacerFn = (key, val) => {
            if (val === undefined) {
                return null;
            }
            return val;
        };
        if (!res) {
            return JSON.stringify(obj1, replacerFn)
                .localeCompare(JSON.stringify(obj2, replacerFn));
        }
        return res;
    }
}