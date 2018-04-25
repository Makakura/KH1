declare var $ :any;
import { Component, OnInit, group } from '@angular/core';
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { EventService } from "../services/event-service";
import { ActivatedRoute } from '@angular/router';
import { delay } from 'rxjs/operator/delay';
import { Router } from '@angular/router';
import { count } from 'rxjs/operator/count';
import { FNC } from "../services/functioncommon";

@Component({
  selector: 'app-code-management',
  templateUrl: './code-management.component.html',
  styleUrls: ['./code-management.component.css'],
  providers: [EventService] 
})
export class CodeManagementComponent implements OnInit {
  eventModel: EventWheelModel = new EventWheelModel();
  codeArray = [];
  currentTotalReward = 0;
  currentTotalCodeUsed = 0;
  sub: any;
  currentGift: GiftModel = new GiftModel(0, '', 0, false, false);
  currentCodeArrayShow = [];
  currentCodeOfGiftGroupByDate = [];
  constructor(private eventService: EventService,
    private route: ActivatedRoute, 
    private router: Router) { }

  ngOnInit() {
    let that = this;
    this.getCodeToView();
    // on exit edit popup
    $('#gift-detail').on('hidden.bs.modal', function (e) {
      that.currentGift = new GiftModel(0, '', 0, false, false);
      that.currentCodeArrayShow = [];
      that.currentCodeOfGiftGroupByDate = [];
    });
  }

  getCodeToView = () => {
    FNC.showSpinner();
    this.sub = this.route.params.subscribe(params => {
      let id = params['id'];
      if (id){ 
        this.eventService.getEventByID(id).subscribe(
          res => {
            let resJson = res.json();
            if (resJson.result) {
              this.eventModel = this.eventService.converJsonToEvent(resJson.data);
              this.calValueReport();
              FNC.hideSpinner(1000);
            } else {
              FNC.hideSpinner(1000);
              FNC.displayNotify("Đã xảy ra lỗi","Để được giải đáp liên hệ: shaharaki@gmail.com", resJson.message);
            }
          },
          err => {
            FNC.hideSpinner(1000);
            FNC.displayNotify("THÔNG BÁO", "Không kết nối được tới server vui lòng kiểm tra lại đường dẫn hoặc kết nối mạng");
          });
      } else {
        FNC.hideSpinner(1000);
        FNC.displayNotify("THÔNG BÁO", "Đường dẫn bị sai, xin vui lòng kiểm tra lại");
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
  showConfirmCreateCode = () => {
    this.displayConfirmDialog("LƯU Ý:", "Bạn có muốn xuất "+ Number.parseInt($('#inputNumberOfCode').val()) +" mã cho phần thưởng: " + this.currentGift.name, 'closeConfirmDialog', 'createCode');
  }
  createCode = () => {
    let numberOfCode = Number.parseInt($('#inputNumberOfCode').val());
    let bodydata = {
      eventID: this.eventModel._id,
      giftArray: [],
      createDate: new Date()
    };
    bodydata.giftArray.push(
      {
        id: this.currentGift.id, 
        numberOfCode: numberOfCode,
      });
    this.eventService.createCode(bodydata).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          let receiveCodeArray = resJson.data;
          receiveCodeArray.forEach(element => {
          this.currentGift.codeArray.push(element);
          this.currentCodeOfGiftGroupByDate = this.groupByDate(this.currentGift.codeArray, 'createdDate');
          this.selectGift(this.currentGift);
          this.displayNotify("THÔNG BÁO", "ĐÃ TẠO MÃ THÀNH CÔNG");
          });
        } else {
          console.log(resJson.message);
        }
      },
      err => {
        console.log('Không kết nối được tới server, xin vui lòng thử lại')
    });
    this.closeConfirmDialog();
  }

  selectDate = (value) => {
    if (value === "-1" ) {
      this.currentCodeArrayShow = this.currentGift.codeArray;
    } else {
      let dateSelected = $('#select-date option:selected').val();
      this.currentCodeArrayShow = this.getCodeArrayByDate(this.currentCodeOfGiftGroupByDate, dateSelected);
    }
    this.currentCodeArrayShow = this.sortByKey(this.currentCodeArrayShow, 'isPlayed').reverse();    
  }

  getUnUsedCodeCount = (codeArr) => {
    let count = 0;
    codeArr.forEach(element => {
      if (!element.isPlayed) {
        count ++;
      }
    });
    return count;
  }


  selectGift = (gift) => {
    this.currentGift = gift;
    this.currentCodeOfGiftGroupByDate = this.groupByDate(this.currentGift.codeArray, 'createdDate');
    this.selectDate('-1');
    $('#gift-detail').modal('show');
  }
  
  goTo = (page, param) => {
    this.router.navigate(['/' + page, param]);
  }

  sortByKey(array, key) {
    return array.sort(function(a, b) {
        let x = a[key]; let y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }

  groupByDate = (array, key) => {
    let groups = [];
    array.forEach(item => {
      let keyValue = item[key];
      if (!this.checkGroupHasThisDate(groups, keyValue)) {
        groups.push({
          date: keyValue,
          codes: []
        });
      }
      for (let i = 0; i < groups.length; i++ ) {
        if (groups[i].date === keyValue) {
          groups[i].codes.push(item);
          break;
        }
      }
    });
    return groups;
  }

  checkGroupHasThisDate = (groups, date) => {
    for (let i = 0; i < groups.length; i++ ) {
      if (groups[i].date === date) {
        return true
      }
    }
    return false;
  }

  getCodeArrayByDate = (groups, date) => {
    for (let i = 0; i < groups.length; i++ ) {
      if (groups[i].date === date) {
        return groups[i].codes;
      }
    }
    return undefined;
  }
  calValueReport = () => {
    this.currentTotalReward = 0;
    this.currentTotalCodeUsed = 0;
    let gift: any;
    for (let i = 0; i < this.eventModel.giftArray.length; i++) {
      gift = this.eventModel.giftArray[i];
      this.currentTotalReward += gift.numberOfReward;
      this.currentTotalCodeUsed += (gift.numberOfReward - gift.playedCounter)
    }
  }

  displayConfirmDialog (header, body, cancelFunction, okFunction) {
    $("#confirm-header").text(header);
    $("#confirm-body").text(body);
    $("#confirm-cancel").click(() => {
      this[cancelFunction]();
    })
    $("#confirm-ok").click(() => {
      this[okFunction]();
    })
    $('#confirm-model').modal('show');
  }

  displayNotify (header, body, sub?, link?) {
    $("#notify-header").text(header);
    $("#notify-body").text(body);
    if (sub) {
      $("#notify-body-sub").text(sub);
    } else {
      $("#notify-body-sub").text('');
    }
    if (link) {
      $("#notify-body-link").text(link);
      $("#notify-body-link").attr("href", link)
    } else {
      $("#notify-body-link").text('');
    }
    $('#notify-model').modal('show');
  }

  closeConfirmDialog = () => {
    $('#confirm-model').modal('hide');
  }

  closePopupGift = () => {
    $('#gift-detail').modal('hide');
    this.currentGift = new GiftModel(0, '', 0, false, false);
    this.currentCodeArrayShow = [];
    this.currentCodeOfGiftGroupByDate = [];
  }
}
