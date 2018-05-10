import { Injectable } from '@angular/core';  
import { EventWheelModel } from '../../model/eventWheelModel';
import { GiftModel } from '../../model/giftModel';
import { FNC } from './functioncommon';
import { Http, HttpModule, Headers, RequestOptions} from '@angular/http'
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';

 @Injectable()
 export class EventService {
    private url = 'http://localhost:8080/api';
    //private url = 'https://quaythuong.herokuapp.com/api';
    //private url = 'https://quaythuongdev.herokuapp.com/api';
    constructor (private http: Http) {
    }

    requestOptions = (): RequestOptions => {
        let header: any = new Headers({'token': FNC.token});
        let options = new RequestOptions({ headers: header });
        return options; 
    }

    getEventByID = (id): any => {
        return this.http.get(this.url + '/events/'+ id, this.requestOptions());
    }

    getGifts = (eventID): any => {
        return this.http.get(this.url + '/gifts/'+ eventID, this.requestOptions());
    }

    getCodes = (giftID): any => {
        return this.http.get(this.url + '/codes/'+ giftID, this.requestOptions());
    }

    getGiftResult = (giftID): any => {
        return this.http.get(this.url + '/results/'+ giftID, this.requestOptions());
    }

    searchResultByPhone = (phone) => {
        return this.http.get(this.url + '/searchbyphone/'+ phone, this.requestOptions());
    }
    
    getEvents = (): any => {
        return this.http.get(this.url + '/events', this.requestOptions());
    }

    addEvent = (event): any => {
        return this.http.post(this.url + '/events', event, this.requestOptions())
    }

    updateEvent = (event): any => {
        return this.http.put(this.url + '/events/' + event._id, event, this.requestOptions())
    }

    createCode = (bodyData) => {
        return this.http.put(this.url + '/createcode', bodyData, this.requestOptions())
    }

    getEventByIDForClient = (id): any => {
        return this.http.get(this.url + '/getevent/'+ id, this.requestOptions());
    }

    validateToken = (token) => {
        return this.http.get(this.url + '/author/'+ token, this.requestOptions());
    }

    checkCode = (codeParam, eventIDParam) => {
        let bodyData = {
            eventID: eventIDParam,
            code: codeParam
        }
        return this.http.post(this.url + '/checkcode', bodyData, this.requestOptions())
    }

    checkPhone = (phoneParam, eventIDParam) => {
        let bodyData = {
            eventID: eventIDParam,
            phone: phoneParam
        }
        return this.http.post(this.url + '/checkphone', bodyData, this.requestOptions())
    }

    sendResult = (codeItemParam, eventIDParam, giftIDParam): any => {
        let thisDate =  new Date();
        codeItemParam.playedDate = thisDate
        codeItemParam.clientPlayedDate = thisDate.toLocaleString('en-GB');
        let bodyData = {
            eventID: eventIDParam,
            giftID: giftIDParam,
            codeItem: codeItemParam
        }

        return this.http.put(this.url + '/addcodeinfo/', bodyData, this.requestOptions())
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

    updateNewValueToEvent = (eventFrom: EventWheelModel, eventTo: EventWheelModel) => {
        let eventFromClone = eventFrom.clone();
        for(var p in eventFromClone) {
            if(JSON.stringify(eventFrom[p]) !== JSON.stringify(eventTo[p])){
                eventTo[p] = eventFromClone[p];
            }
        }
    }

    
 } 
