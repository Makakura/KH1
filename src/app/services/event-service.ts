import { Injectable } from '@angular/core';  
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { Http ,HttpModule} from '@angular/http'
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';

 @Injectable()
 export class EventService {
    private url = 'http://localhost:8080/api'
    
    constructor (private http: Http) {}
    getService(): any { 
        let eventList = [];
        eventList.push(this.createAEvent());
        eventList.push(this.createAEvent());
        eventList.push(this.createAEvent());
        eventList.push(this.createAEvent());
        eventList.push(this.createAEvent());
        eventList.push(this.createAEvent());
        eventList.push(this.createAEvent());
        return eventList; 
    } 

    createAEvent = (): EventWheelModel => {
        var event = new EventWheelModel();
        event.name = "NUTRI FOOD EVENT";
        event.dateCreate =  new Date();
        event.isDone = false;
        event.nameOfCompany = "NUTRI FOOD";
        event.giftArray = [
            new GiftModel('01 Máy giặt', 100),
            new GiftModel('01 Tủ lạnh', 100),
            new GiftModel('01 Tivi', 100),
            new GiftModel('01 Máy sấy tóc', 100)
        ]
        return event;
    }

    getEventByID = (id): any => {
        return this.http.get(this.url + '/events/'+ id);
    }

    converJsonToEvent = (event): EventWheelModel => {
        let newEvent = new EventWheelModel();
        newEvent.setValue(
            event.name,
            event.nameOfCompany,
            event.dateCreate,
            event.isDone,
            event.linkImageWheel,
            event.giftArray,
            event.linkPostFB
        );
        return newEvent
    }
 } 