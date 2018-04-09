declare var $ :any;
import { Component, OnInit } from '@angular/core';
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { EventService } from "../services/event-service";
import { Router } from '@angular/router';
@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.css'],
  providers: [EventService] 
})

export class EventManagementComponent implements OnInit {
  listEvent = [];
  listGift = [new GiftModel(0,'', 0, false), new GiftModel(1,'', 0, false), new GiftModel(2,'', 0, false), new GiftModel(3,'', 0, false)];
  isHideAddGiftButton = false; // For create popup
  isShowImage = false; // For create popup
  newEvent:EventWheelModel; // For create popup
  selectingEvent: EventWheelModel; // For edit popup
  editingEvent: EventWheelModel; // For edit popup
  isShowEditGift = false; // For edit popup  

  constructor(private eventService: EventService, private router: Router) { }

  ngOnInit() {
    this.newEvent = new EventWheelModel();
    this.selectingEvent = new EventWheelModel();
    this.editingEvent = new EventWheelModel();
    this.setCssForView();
    this.getEventsToView();
  }

  getEventsToView = () => {
    this.eventService.getEvents().subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          this.listEvent = this.eventService.converJsontoArrayEvent(resJson.data);
        } else {
          console.log(resJson.message);
        }
      },
      err => {
        console.log('Không kết nối được tới server, xin vui lòng thử lại')
      });
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
    let that = this
    // on exit edit popup
    $('#show-event').on('hidden.bs.modal', function (e) {
      that.isShowEditGift = false;
    })
  }

  showCreateEventPop = () => {
    $('#create-event').modal('show');
  }
  
  addGift = () => {
    if(this.listGift.length < 8) {
      this.listGift.push(new GiftModel(this.listGift.length, "", 0, false));
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
    this.newEvent.status = 'Preparing'; // 1 Preparing, 2 Running, 3 Pause, 4 Done 
    this.newEvent.isDeleted = false;
    this.newEvent.giftArray = this.listGift;
    delete this.newEvent._id;
    this.eventService.addEvent(this.newEvent).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          let createdEvent = this.eventService.converJsonToEvent(resJson.data);
          this.listEvent.push(createdEvent);
          this.resetDataPopup(PopupType.CREATE);
          console.log('Success');
        } else {
          console.log(resJson.message);
        }
      },
      err => {
        console.log('Không kết nối được tới server, xin vui lòng thử lại')
    });

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
      if (this.listGift[i].name === '' || this.listGift[i].numberOfReward === 0) {
        return false;
      }
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

  selectEvent = (event) => {
    this.selectingEvent = event;
    this.editingEvent = event.clone();
    if ( this.selectingEvent) {
      $('#show-event').modal('show');
    }
  }

  editEvent = () => {
    if(this.selectingEvent && this.editingEvent) {
      if (this.checkIsNeedToUpdateEvent(this.selectingEvent, this.editingEvent)) {     
        this.eventService.updateEvent(this.editingEvent).subscribe(
          res => {
            let resJson = res.json();
            if (resJson.result) {
              let editedEvent = this.eventService.converJsonToEvent(resJson.data);
              this.eventService.updateNewValueToEvent(editedEvent, this.selectingEvent);
              this.resetDataPopup(PopupType.EDIT);
             
            } else {
              console.log(resJson.message);
            }
          },
          err => {
            console.log('Không kết nối được tới server, xin vui lòng thử lại')
          }
        );
      } else {
        this.resetDataPopup(PopupType.EDIT);
      }
    } else {
      this.resetDataPopup(PopupType.EDIT);
    }
  }

  checkIsNeedToUpdateEvent = (selectingEvent: EventWheelModel, editedEvent: EventWheelModel): boolean => {
    let isNeedToUpdate = false;
    for(var p in editedEvent) {
      if(JSON.stringify(editedEvent[p]) !== JSON.stringify(selectingEvent[p])){
        isNeedToUpdate = true;
      } else if(p != '_id' && JSON.stringify(editedEvent[p]) === JSON.stringify(selectingEvent[p])){
        delete editedEvent[p];
      }
    }
    return isNeedToUpdate;
  }

  showHideEditGift = () => {
    if (this.isShowEditGift){
      this.isShowEditGift = false;
    } else {
      this.isShowEditGift = true;
    }
    
  }

  resetDataPopup(popup: PopupType){
    switch(popup) {
      case PopupType.CREATE:
        this.newEvent = new EventWheelModel();
        this.resetValueInput();
        this.isShowImage = false;
        $('#create-event').modal('hide');
        break;
      case PopupType.EDIT: 
        $('#show-event').modal('hide');
        this.editingEvent = new EventWheelModel();
        this.selectingEvent = new EventWheelModel();
        break;
    }
  }

  goTo = (page, param) => {
    this.router.navigate(['/' + page, param]);
    this.resetDataPopup(PopupType.CREATE);
    this.resetDataPopup(PopupType.EDIT);
  }

  handleChange = (e,i) => {
    console.log(e);
    console.log(i);
  }

  selectEditStatus = (selector) => {
    this.editingEvent.status =  $('#select-status').val();
  }
}

enum PopupType {
  CREATE,
  EDIT,
}