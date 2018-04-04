import {GiftModel} from "./giftModel";
export class EventWheelModel {
    _id: string = '';
    name: string = '';
    nameOfCompany: string = '';
    giftArray:any = [];
    dateCreate: any = {};
    isDone: boolean = false; // true: done
    isActive: boolean = true; // true: done
    linkImageWheel: string = '';
    linkPostFB: string = '';

    constructor () {
    }

    setValue = (_id, name, nameOfCompany, dateCreate, isDone, linkImageWheel, giftArray, linkPostFB, isActive) => {
        this._id = _id;
        this.name = name;
        this.nameOfCompany = nameOfCompany;
        this.dateCreate = dateCreate;
        this.isDone = isDone;
        this.linkImageWheel = linkImageWheel;
        this.giftArray = giftArray;
        this.linkPostFB = linkPostFB;
        this.isActive = isActive;
    }

    clone = () => {
        return JSON.parse(JSON.stringify(this));
    }
}