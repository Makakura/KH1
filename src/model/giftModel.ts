export class GiftModel {
    id: number = 0;
    name: string = '';
    numberOfReward: number = 0;
    playedCounter: number = 0;
    codeArray = [];
    constructor(id, name, numberOfReward, playedCounter) {
        this.id = id;
        this.name = name;
        this.numberOfReward = numberOfReward;
        this.playedCounter = playedCounter;
    }
}