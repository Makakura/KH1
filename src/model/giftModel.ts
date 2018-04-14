export class GiftModel {
    id: number = 0;
    name: string = '';
    numberOfReward: number = 0;
    playedCounter: number = 0;
    isLimited: boolean = false;
    constructor(id, name, numberOfReward, isLimited, playedCounter) {
        this.id = id;
        this.name = name;
        this.numberOfReward = numberOfReward;
        this.playedCounter = playedCounter;
        this.isLimited = isLimited;
    }
}