import {GiftModel} from "./giftModel";
export class EventWheelModel {
    _id: string = '';
    name: string = '';
    nameOfCompany: string = '';
    giftArray:any = [];
    dateCreate: any = {};
    status: String = 'Preparing'; // true: done
    isDeleted: boolean = true; // true: done
    linkImageWheel: string = '';
    linkPostFB: string = '';
    constructor () {
    }

    setValue = (_id, name, nameOfCompany, dateCreate, status, linkImageWheel, giftArray, linkPostFB, isDeleted) => {
        this._id = _id;
        this.name = name;
        this.nameOfCompany = nameOfCompany;
        this.dateCreate = dateCreate;
        this.status = status;
        this.linkImageWheel = linkImageWheel;
        this.giftArray = giftArray;
        this.linkPostFB = linkPostFB;
        this.isDeleted = isDeleted;
    }

    clone = () => {
        return JSON.parse(JSON.stringify(this));
    }
}