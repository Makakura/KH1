declare var $ :any;
import { Component, OnInit } from '@angular/core';
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { EventService } from "../services/event-service";
import { ActivatedRoute } from '@angular/router';
import { delay } from 'rxjs/operator/delay';
import { Router } from '@angular/router';

@Component({
  selector: 'app-code-management',
  templateUrl: './code-management.component.html',
  styleUrls: ['./code-management.component.css'],
  providers: [EventService] 
})
export class CodeManagementComponent implements OnInit {
  eventModel: EventWheelModel = new EventWheelModel();
  codeArray = [];
  currentTotalCode = 0;
  currentTotalCodeUsed = 0;
  currentTotalCodeAvailable = 0;
  sub: any;
  giftSelectedIndex = 0;
  searchFilter = '';
  giftFilter = '';

  constructor(private eventService: EventService,
    private route: ActivatedRoute, 
    private router: Router) { }

  ngOnInit() {
    let that = this;
    $('body').css('background-color', 'black');
    $("#myInput").on("keyup", function() {
      that.searchFilter = $(this).val().toLowerCase();
      $("#myTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(that.giftFilter) > -1)
        if ($(this).text().toLowerCase().indexOf(that.searchFilter) < 0) {
          $(this).toggle(false);
        }
      });
    });
    this.getCodeToView();
    
  }

  getCodeToView = () => {
    this.sub = this.route.params.subscribe(params => {
      let id = params['id'];
      if (id){ 
        this.eventService.getEventByID(id).subscribe(
          res => {
            let resJson = res.json();
            if (resJson.result) {
              this.eventModel = this.eventService.converJsonToEvent(resJson.data);
              this.calValueReport("-1");
            } else {
              console.log(resJson.message);
            }
          },
          err => {
            console.log('Không kết nối được tới server, xin vui lòng thử lại')
          });
      }
    });
    this.sub.unsubscribe();
  }

  generateCodeArray = (eventParam) => {
    this.codeArray = [];
    for (let i = 0; i < eventParam.giftArray.length; i++) {
      let gift = eventParam.giftArray[i];
      for (let j = 0; j < gift.codeArray.length; j++) {
        this.codeArray.push();
      }
    }
  }

  showPopupCreateCode() {
    for (let i = 0; i < this.eventModel.giftArray.length; i++) {
      let gift = this.eventModel.giftArray[i];
      gift.numberOfCode = gift.numberOfReward;
    }
    $('#create-code').modal('show');
  }

  numberOfCodeChange = (event) => {
    if (!event.target.value || event.target.value < 0 ) {
      event.target.value = '';
    }
  }

  createCode = () => {
    let bodydata = {
      eventID: this.eventModel._id,
      giftArray: [],
      dateCreated: new Date()
    };

    for (let i = 0; i < this.eventModel.giftArray.length; i++) {
      let gift = this.eventModel.giftArray[i];
      if (gift.numberOfCode > 0) {
        bodydata.giftArray.push({id: gift.id, numberOfCode: gift.numberOfCode})
      }
    }

    this.eventService.createCode(bodydata).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          let receiveEvent = this.eventService.converJsonToEvent(resJson.data);
          this.eventModel = receiveEvent;
          $('#create-code').modal('hide');
          console.log('Success');
        } else {
          console.log(resJson.message);
        }
      },
      err => {
        console.log('Không kết nối được tới server, xin vui lòng thử lại')
    });
  }

  selectGift = (selector) => {
    if (selector.value === "-1" ) {
      this.giftFilter = '';
    } else {
      this.giftFilter = $('#select-gift option:selected').text().toLowerCase();
    }
    let that = this;
    that.searchFilter = $("#myInput").val().toLowerCase();
    $("#myTable tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(that.searchFilter) > -1)
      if ($(this).text().toLowerCase().indexOf(that.giftFilter) < 0) {
        $(this).toggle(false);
      }
    });
    this.calValueReport(selector.value);
  }
  
  filterCode = () => {

  }
  
  calValueReport = (value) => {
    this.currentTotalCode = 0;
    this.currentTotalCodeUsed = 0;
    this.currentTotalCodeAvailable = 0;
    let gift: any;

    if (value === "-1") {
      for (let i = 0; i < this.eventModel.giftArray.length; i++) {
        gift = this.eventModel.giftArray[i];
        for (let j = 0; j < gift.codeArray.length; j++) {
          let code = gift.codeArray[j];
          this.currentTotalCode++;
          if (code.isPlayed) {
            this.currentTotalCodeUsed++;
          } else {
            this.currentTotalCodeAvailable++;
          }
        }
      }
    } else {
      gift = this.eventModel.giftArray[value];
      for (let j = 0; j < gift.codeArray.length; j++) {
        let code = gift.codeArray[j];
        this.currentTotalCode++;
        if (code.isPlayed) {
          this.currentTotalCodeUsed++;
        } else {
          this.currentTotalCodeAvailable++;
        }
      }
    }
  }

  selectCode = () => {

  }
  
  goTo = (page, param) => {
    this.router.navigate(['/' + page, param]);
  }
}
