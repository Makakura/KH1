export class GiftModel {
    name: string = '';
    numberOfReward: number = 0;
    constructor(name, numberOfReward) {
        this.name = name;
        this.numberOfReward = numberOfReward;
    }
}