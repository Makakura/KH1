export class GiftModel {
    id: number = 0;
    name: string = '';
    numberOfReward: number = 0;
    isLimited: boolean = false;
    constructor(id, name, numberOfReward, isLimited) {
        this.id = id;
        this.name = name;
        this.numberOfReward = numberOfReward;
        this.isLimited = isLimited;
    }
}