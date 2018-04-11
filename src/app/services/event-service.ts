import { Injectable } from '@angular/core';  
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { Http ,HttpModule} from '@angular/http'
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';

 @Injectable()
 export class EventService {
    private url = 'http://localhost:8080/api';
    //private url = 'https://quaythuong.herokuapp.com/api';
    
    constructor (private http: Http) {}

    getEventByID = (id): any => {
        return this.http.get(this.url + '/events/'+ id);
    }

    getEventByIDForClient = (id): any => {
        return this.http.get(this.url + '/getevent/'+ id);
    }

    converJsonToEvent = (event): EventWheelModel => {
        let newEvent = new EventWheelModel();
        newEvent.setValue(
            event._id,
            event.name,
            event.nameOfCompany,
            event.dateCreate,
            event.status,
            event.linkImageWheel,
            event.giftArray,
            event.linkPostFB,
            event.isDeleted,
            event.linkToPrivacy
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

    createCode = (bodyData) => {
        return this.http.put(this.url + '/createcode', bodyData)
    }

    checkCode = (codeParam, eventIDParam) => {
        let bodyData = {
            eventID: eventIDParam,
            code: codeParam
        }
        return this.http.post(this.url + '/checkcode', bodyData)
    }

    sendResult = (codeItemParam, eventIDParam): any => {
        let bodyData = {
            eventID: eventIDParam,
            codeItem: codeItemParam
        }
        return this.http.put(this.url + '/addcodeinfo/', bodyData)
    }
 } 