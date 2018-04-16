declare var $ :any;
import { Component, OnInit } from '@angular/core';
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { EventService } from "../services/event-service";
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result-management',
  templateUrl: './result-management.component.html',
  styleUrls: ['./result-management.component.css'],
  providers: [EventService] 
})
export class ResultManagementComponent implements OnInit {
  eventModel: EventWheelModel = new EventWheelModel();
  currentTotalCode = 0;
  sub: any;
  searchFilter = '';
  giftFilter = '';

  currentCode = {};
  currentGift = {};
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
              let ev = this.eventService.converJsonToEvent(resJson.data);
              this.eventModel = this.filterTheCode(ev);
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
  
  calValueReport = (value) => {
    this.currentTotalCode = 0;
    let gift: any;

    if (value === "-1") {
      for (let i = 0; i < this.eventModel.giftArray.length; i++) {
        gift = this.eventModel.giftArray[i];
        for (let j = 0; j < gift.codeArray.length; j++) {
          let code = gift.codeArray[j];
          this.currentTotalCode++;
        }
      }
    } else {
      gift = this.eventModel.giftArray[value];
      for (let j = 0; j < gift.codeArray.length; j++) {
        let code = gift.codeArray[j];
        this.currentTotalCode++;
      }
    }
  }

  selectCode = (code, gift) => {
    console.log('123');
    this.currentCode = code;
    this.currentGift = gift;
    $('#show-code').modal('show');
  }

  filterTheCode = (ev) => {
    let evClone = JSON.parse(JSON.stringify(ev));
    evClone.giftArray.forEach(gift => {
      gift.codeArray = [];
    });

    ev.giftArray.forEach((gift, giftIndex) => {
      gift.codeArray.forEach((code, codeIndex) => {
        if (code.isPlayed) {
          evClone.giftArray[giftIndex].codeArray.push(code);
        }
      });
    });
    
    return evClone;
  }

  goTo = (page, param) => {
    this.router.navigate(['/' + page, param]);
  }
}
