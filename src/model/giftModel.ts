export class GiftModel {
    id: number = 0;
    name: string = '';
    numberOfReward: number = 0;
    constructor(id, name, numberOfReward) {
        this.id = id;
        this.name = name;
        this.numberOfReward = numberOfReward;
    }
}