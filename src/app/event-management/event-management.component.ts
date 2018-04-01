declare var $ :any;
import { Component, OnInit } from '@angular/core';
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { EventService } from "../services/event-service";

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.css'],
  providers: [EventService] 
})
export class EventManagementComponent implements OnInit {
  listEvent = [];
  listGift = [new GiftModel('', 0), new GiftModel('', 0), new GiftModel('', 0), new GiftModel('', 0)];
  isHideAddGiftButton = false;
  isShowImage = false;
  newEvent: EventWheelModel;
  constructor(private eventSerice: EventService) { }

  ngOnInit() {
    this.setCssForView();
    this.listEvent = this.eventSerice.getService();
    this.newEvent  = new EventWheelModel();
    this.newEvent.name = 'abc';
    console.log(JSON.stringify(this.listEvent));
  }

  setCssForView = () => {
    $('body').css('background-color', 'black');
    // $('#create-event').modal('show');
    $("#myInput").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#myTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  }

  showCreateEventPop = () => {
    $('#create-event').modal('show');
  }
  
  addGift = () => {
    if(this.listGift.length < 8) {
      this.listGift.push(new GiftModel("", 0));
    }
    if(this.listGift.length >= 8) {
      this.isHideAddGiftButton = true;
    } else {
      this.isHideAddGiftButton = false;
    }
  }
  
  linkImageKeyUp = () => {
    this.isShowImage = true;
  }

  addEvent = () => {
    if (!this.validateDataEvent()) {
      console.log('Vui long nhap day du thong tin cho su kien');
      return;
    }
    
    if (!this.validateDataGift()) {
      console.log('Vui long nhap phan thuong cho su kien');
      return;
    }

    this.newEvent.dateCreate = new Date();
    this.newEvent.isDone = false;
    this.listEvent.push(this.newEvent.clone());

    // Reset value
    this.newEvent = new EventWheelModel();
    this.resetValueInput();
    this.isShowImage = false;

    $('#create-event').modal('hide');
  }

  validateDataEvent = () => {
    if (!this.newEvent.name
    || !this.newEvent.nameOfCompany
    || !this.newEvent.linkImageWheel) {
      return false;
    }
    return true;
  }

  validateDataGift = () => {
    let count = 0;
    for (var i = 0; i <= this.listGift.length - 1; i++) {
      if (this.listGift[i].name === '') {
        count++;
      }

      if (this.listGift[i].name !== '' 
          && this.listGift[i].numberOfReward === 0 ) {
        return false;
      }
    }
    if (count >= this.listGift.length) {
      return false;
    }
    return true;
  }
  numberOfRewardChange = (event) => {
    if (!event.target.value || event.target.value < 0 ) {
      event.target.value = '';
    }
  }

  resetValueInput = () => {
    $("#create-event").each(function(){
          $(this).find('input').val("");
    })
  }
}
