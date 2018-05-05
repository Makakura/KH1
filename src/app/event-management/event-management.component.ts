declare var $ :any;
import { Component, OnInit } from '@angular/core';
import { EventWheelModel } from '../../model/eventWheelModel';
import { GiftModel } from '../../model/giftModel';
import { EventService } from '../services/event-service';
import { FNC } from '../services/functioncommon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.css'],
  providers: [EventService] 
})

export class EventManagementComponent implements OnInit {
  listEvent = [];
  listGift = [new GiftModel(0,'', 0, 0, false), new GiftModel(1,'', 0, 0, false), new GiftModel(2,'', 0, 0, false), new GiftModel(3,'', 0, 0, false)];
  // For create popup
  isHideAddGiftButton = false;
  isShowImage = false; 
  newEvent:EventWheelModel;
  // For edit popup
  selectingEvent: EventWheelModel;
  editingEvent: EventWheelModel;
  isShowEditGift = false;  

  constructor(private eventService: EventService, private router: Router) { }

  ngOnInit() {
    let token = FNC.getToken();
    if (!token || token === undefined) {
      this.goTo('');
      return;
    }
    this.newEvent = new EventWheelModel();
    this.selectingEvent = new EventWheelModel();
    this.editingEvent = new EventWheelModel();
    this.setCssForView();
    this.getEventsToView();
  }

  getEventsToView = () => {
    FNC.showSpinner();
    this.eventService.getEvents().subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          this.listEvent = this.eventService.converJsontoArrayEvent(resJson.data).reverse();
          FNC.hideSpinner(1000);
        } else {
          FNC.hideSpinner(1000);
          FNC.displayNotify('Đã xảy ra lỗi','Để được giải đáp liên hệ: shaharaki@gmail.com', resJson.message);
        }
      },
      err => {
        FNC.hideSpinner(1000);
        FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
      });
  }

  setCssForView = () => {
    $('body').css('background-color', 'black');
    // $('#create-event').modal('show');
    $('#myInput').on('keyup', function() {
      var value = $(this).val().toLowerCase();
      $('#myTable tr').filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
    let that = this
    // on exit edit popup
    $('#show-event').on('hidden.bs.modal', function (e) {
      that.isShowEditGift = false;
      that.selectingEvent = new EventWheelModel();
      that.editingEvent = new EventWheelModel();
    });
  }

  showCreateEventPop = () => {
    $('#create-event').modal('show');
  }
  
  addGift = () => {
    if(this.listGift.length < 8) {
      this.listGift.push(new GiftModel(this.listGift.length, '', 0, 0, false));
    }
    if(this.listGift.length >= 8) {
      this.isHideAddGiftButton = true;
    } else {
      this.isHideAddGiftButton = false;
    }
  }
  
  linkImageKeyUp = (value) => {
    if (value.indexOf('.png') !== -1) {
      this.isShowImage = true;
    } else {
      this.isShowImage = false;
    }
  }

  addEvent = () => {
    if (!this.validateDataEvent()) {
      FNC.displayNotify('THÔNG BÁO', 'Vui lòng nhập đầy đủ thông tin cho sự kiện');
      return;
    }

    if (this.newEvent.linkImageWheel.indexOf('.png') === -1) {
      FNC.displayNotify('THÔNG BÁO', 'Vui lòng nhập link image vòng quay có đuôi là ".png"');
      return;
    }

    if (!this.validateDataGift()) {
      FNC.displayNotify('THÔNG BÁO', 'Vui lòng nhập phần thưởng cho sự kiện');
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
          this.listEvent.splice(0, 0, createdEvent);
          this.resetDataPopup(PopupType.CREATE);
        } else {
          FNC.displayNotify('Đã xảy ra lỗi','Để được giải đáp liên hệ: shaharaki@gmail.com', resJson.message);
        }
      },
      err => {
        FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
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

  limitValue = (value) => {
    if (value < 0 ) {
      value = 0;
    }
    if (value > 99999) {
      value = 99999;
    }
    return value;
  }

  valueKeyup = (event) => {
    if (event.target.value < 0 ) {
      event.target.value = 0;
    }
    if (event.target.value > 99999) {
      event.target.value = 99999;
    }
  }

  resetValueInput = () => {
    $('#create-event').each(function(){
          $(this).find('input').val('');
    })
  }

  selectEvent = (event) => {
    if (!event.giftArray || event.giftArray.length === 0) {
      FNC.showSpinner();
      this.eventService.getGifts(event._id).subscribe(
        res => {
          let resJson = res.json();
          if (resJson.result) {
            event.giftArray = resJson.data;
            this.selectingEvent = event;
            this.editingEvent = event.clone();
            if ( this.selectingEvent) {
              $('#show-event').modal('show');
              $('#select-status').val(this.selectingEvent.status);
            }
            FNC.hideSpinner(1000);
          } else {
            FNC.hideSpinner(1000);
            FNC.displayNotify('Thông báo','Không lấy được danh sách phần thưởng');
          }
        },
        err => {
          FNC.hideSpinner(1000);
          FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
        }
      );
    } else {
      this.selectingEvent = event;
      this.editingEvent = event.clone();
      if ( this.selectingEvent) {
        $('#show-event').modal('show');
        $('#select-status').val(this.selectingEvent.status);
      }
    }
    
  }

  editEvent = () => {
    if(this.selectingEvent && this.editingEvent) {
      if (this.checkIsNeedToUpdateEvent(this.selectingEvent, this.editingEvent)) {     
        FNC.showSpinner();
        this.eventService.updateEvent(this.editingEvent).subscribe(
          res => {
            let resJson = res.json();
            if (resJson.result) {
              let editedEvent = this.eventService.converJsonToEvent(resJson.data);
              this.eventService.updateNewValueToEvent(editedEvent, this.selectingEvent);
              this.resetDataPopup(PopupType.EDIT);
              FNC.displayNotify('Thông báo', 'Lưu thành công');
              FNC.hideSpinner(500);
            } else {
              FNC.displayNotify('Đã xảy ra lỗi', 'Để được giải đáp liên hệ: shaharaki@gmail.com', resJson.message);
              FNC.hideSpinner(500);
            }
          },
          err => {
            FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
            FNC.hideSpinner(500);
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

  goTo = (page, param?) => {
    if (param) {
      this.router.navigate(['/' + page, param]);
    } else {
      this.router.navigate(['/' + page]);
    }
    this.resetDataPopup(PopupType.CREATE);
    this.resetDataPopup(PopupType.EDIT);
  }

  selectEditStatus = (selector) => {
    this.editingEvent.status =  $('#select-status').val();
  }
  
  logOut = () => {
    FNC.clearToken();
    this.goTo('');
  }
}

enum PopupType {
  CREATE,
  EDIT,
}
