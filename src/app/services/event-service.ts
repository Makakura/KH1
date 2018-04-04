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
            new GiftModel(1,'01 Máy giặt', 100),
            new GiftModel(2,'01 Tủ lạnh', 100),
            new GiftModel(3,'01 Tivi', 100),
            new GiftModel(4,'01 Máy sấy tóc', 100)
        ]
        return event;
    }

    getEventByID = (id): any => {
        return this.http.get(this.url + '/events/'+ id);
    }

    converJsonToEvent = (event): EventWheelModel => {
        let newEvent = new EventWheelModel();
        newEvent.setValue(
            event._id,
            event.name,
            event.nameOfCompany,
            event.dateCreate,
            event.isDone,
            event.linkImageWheel,
            event.giftArray,
            event.linkPostFB,
            event.isActive
        );
        return newEvent
    }

    converJsontoArrayEvent = (jsonArray): Array<EventWheelModel> => {
        let arrayEvent = new Array<EventWheelModel>();
        for (var i = 0; i < jsonArray.length; i++) {
            arrayEvent.push(this.converJsonToEvent(jsonArray[i]));
        };
        return arrayEvent;
    }

    getEvents = (): any => {
        return this.http.get(this.url + '/events');
    }

    addEvent = (event): any => {
        return this.http.post(this.url + '/events', event)
    }

    updateEvent = (event): any => {
        return this.http.put(this.url + '/events/' + event._id, event)
    }

    updateNewValueToEvent = (eventFrom: EventWheelModel, eventTo: EventWheelModel) => {
        let eventFromClone = eventFrom.clone();
        for(var p in eventFromClone) {
            if(JSON.stringify(eventFrom[p]) !== JSON.stringify(eventTo[p])){
                eventTo[p] = eventFromClone[p];
            }
        }
    }
 } 