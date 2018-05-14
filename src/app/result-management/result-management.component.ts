declare var $ :any;
import { Component, OnInit } from '@angular/core';
import { EventWheelModel } from "../../model/eventWheelModel";
import { GiftModel } from "../../model/giftModel";
import { EventService } from "../services/event-service";
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FNC } from "../services/functioncommon";

@Component({
  selector: 'app-result-management',
  templateUrl: './result-management.component.html',
  styleUrls: ['./result-management.component.css'],
  providers: [EventService]
})
export class ResultManagementComponent implements OnInit {
  eventModel: EventWheelModel = new EventWheelModel();
  currentTotalCode = 0;
  isShowOP1 = false;
  sub: any;
  searchFilter = '';
  giftFilter = '';
  results = [];
  currentCode = {
    name: '',
    codeArray: 
      {
        name: '',
        code: '',
        phone: '',
        createdDate: '',
        playedDate: '',
        isGiven: ''
      }
    
  };
  currentGift = {
    name: '123',
    id: '123',
    playedCounter: 0,
    numberOfReward: 0,
    codeArray: [
      {
        name: '',
        id: '',
        codeArray: 
          {
            name: '123',
            code: '123',
            phone: '123',
            createdDate: '123',
            playedDate: '123',
            isGiven: ''
          }
      }
    ]
  };
  currentCodeExport = '';
  isShowButtonExportGiftResult = true;
  currentTotalReward = 0;
  currentTotalCodeUsed = 0;
  listRecent = [];

  constructor(private eventService: EventService,
    private route: ActivatedRoute, 
    private router: Router) { }

  ngOnInit() {
    let token = FNC.getToken();
    if (!token || token === undefined) {
      this.goTo('');
      return;
    }
    
    let that = this;
    $('body').css('background-color', 'black');

    $('#gift-detail').on('hide.bs.modal', function (e) {
      FNC.scrollListToTop('#result-list');
    });

    $("#searchGiftResults").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#giftResults tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
    this.getCodeToView();
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
              
              let giftArr = this.eventModel.giftArray;
              giftArr = FNC.sortByKey(giftArr, 'id');
              this.calValueReport();
              this.getRecent(id);
              FNC.hideSpinner(500);
            } else {
              FNC.hideSpinner(500);
              FNC.displayNotify('Đã xảy ra lỗi','Để được giải đáp liên hệ: shaharaki@gmail.com', resJson.message);
            }
          },
          err => {
            FNC.hideSpinner(500);
            FNC.displayNotify('THÔNG BÁO', 'Không kết nối được tới server vui lòng kiểm tra lại đường dẫn hoặc kết nối mạng');
          });
      } else {
        FNC.hideSpinner(500);
        FNC.displayNotify('THÔNG BÁO', 'Đường dẫn bị sai, xin vui lòng kiểm tra lại');
      }
    });
    this.sub.unsubscribe();
  }

  getRecent = (eventID) => {
    FNC.showSpinner();
    this.eventService.getRecent(eventID).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          this.listRecent = resJson.data.reverse();
          FNC.hideSpinner(500);
        } else {
          FNC.hideSpinner(500);
          FNC.displayNotify('Thông báo','Không lấy được thông tin kết quả gần đây');
        }
      },
      err => {
        FNC.hideSpinner(500);
        FNC.displayNotify('THÔNG BÁO','Không kết nối được tới server, xin vui lòng kiểm tra và thử lại');
    });
  }

  calValueReport = () => {
    this.currentTotalReward = 0;
    this.currentTotalCodeUsed = 0;
    let gift: any;
    for (let i = 0; i < this.eventModel.giftArray.length; i++) {
      gift = this.eventModel.giftArray[i];
      this.currentTotalReward += gift.numberOfReward;
      this.currentTotalCodeUsed += gift.playedCounter;
    }
  }

  selectGift = (gift) => {
    if (!gift.codeArray || gift.codeArray.length === 0) {
      this.isShowButtonExportGiftResult = true;
      FNC.showSpinner();
      this.eventService.getGiftResult(gift._id).subscribe(
        res => {
          let resJson = res.json();
          if (resJson.result) {
            gift.codeArray = resJson.data.reverse();
            this.currentGift = FNC.cloneJSON(gift);
            $('#gift-detail').modal('show');
            FNC.hideSpinner(500);
          } else {
            FNC.hideSpinner(500);
            FNC.displayNotify('Thông báo','Không lấy được danh sách kết quả, vui lòng thử lại');
          }
        },
        err => {
          FNC.hideSpinner(500);
          FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
        }
      );
    } else {
      this.currentGift = FNC.cloneJSON(gift);
      $('#gift-detail').modal('show');
    }
  }

  searchPhone = (input) => {
    if (input.value) {
      this.isShowButtonExportGiftResult = false;
      FNC.showSpinner();
      this.eventService.searchResultByPhone(input.value).subscribe(
        res => {
          input.value = '';
          let resJson = res.json();
          if (resJson.result) {
            this.currentGift.codeArray = FNC.cloneJSON(resJson.data.reverse());
            this.currentGift.name ='Kết quả tìm kiếm';
            this.currentGift.playedCounter = resJson.data.length;
            this.currentGift.numberOfReward = resJson.data.length;
            $('#gift-detail').modal('show');
            FNC.hideSpinner(500);
          } else {
            FNC.hideSpinner(500);
            FNC.displayNotify('Thông báo','Không lấy được danh sách kết quả, vui lòng thử lại');
          }
        },
        err => {
          FNC.hideSpinner(500);
          FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
        }
      );
    }
  }

  closePopupGift = () => {
    $('#gift-detail').modal('hide');
    this.isShowButtonExportGiftResult = true;
  }

  selectCode = (codeIem) => {
    this.currentCode = FNC.cloneJSON(codeIem);
    $('#show-code').modal('show');
  }

  closeModalShowCode = () => {
    $('#show-code').modal('hide');
  }

  closeModalExport = () => {
    $('#export-excel-modal').modal('hide');
  }

  showExportExcel = (eventID, giftID?) => {
    this.currentCodeExport = eventID;
    if (giftID !== undefined) {
      this.currentCodeExport+= ';' + giftID;
    }
    $('#export-excel-modal').modal('show');
  }

  goTo = (page, param?) => {
    if (param) {
      this.router.navigate(['/' + page, param]);
    } else {
      this.router.navigate(['/' + page]);
    }
  }

  getDateNumber = (date) => {
    var oneDay = 24*60*60*1000;
    var curDate = new Date().getTime();
    var pastDate = new Date(date).getTime();
    var diffDays = 0;
    diffDays = Math.round(Math.abs((curDate - pastDate)/(oneDay)));
    return diffDays;
  }
}
