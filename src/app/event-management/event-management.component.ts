declare var $ :any;
import { Component, OnInit } from '@angular/core';
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.css']
})
export class EventManagementComponent implements OnInit {
  listEvent = [];
  listGift = [];
  isHideAddGiftButton = false;
  isShowImage = false;
  constructor() { }

  ngOnInit() {
    this.addGift();
    this.addGift();
    this.addGift();
    this.addGift();
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
    if(this.listEvent.length < 8) {
      this.listGift.push(new GiftModel());
    }
    
    if(this.listEvent.length >= 8) {
      this.isHideAddGiftButton = true;
    } else {
      this.isHideAddGiftButton = false;
    }
  }
  
  linkImageKeyUp = () => {
    this.isShowImage = true;
  }

  addEvent = () => {
    $('#create-event').modal('hide');
  }

}
