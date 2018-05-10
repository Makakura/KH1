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
        createdDate: ''
      }
    
  };
  currentGift = {
    name: '',
    id: '',
    playedCounter: 0,
    numberOfReward: 0,
    codeArray: [
      {
        name: '',
        code: '',
        phone: '',
        createdDate: '',
        playedDate: ''
      }
    ]
  };
  currentCodeExport = '';
  isShowButtonExportGiftResult = true;
  currentTotalReward = 0;
  currentTotalCodeUsed = 0;

  constructor(private eventService: EventService,
    private route: ActivatedRoute, 
    private router: Router) { }

  ngOnInit() {
    if (!FNC.getToken()) {
      this.goTo('');
      return;
    }
    let that = this;
    $('body').css('background-color', 'black');
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
              this.calValueReport();
              FNC.hideSpinner(1000);
            } else {
              FNC.hideSpinner(1000);
              FNC.displayNotify('Đã xảy ra lỗi','Để được giải đáp liên hệ: shaharaki@gmail.com', resJson.message);
            }
          },
          err => {
            FNC.hideSpinner(1000);
            FNC.displayNotify('THÔNG BÁO', 'Không kết nối được tới server vui lòng kiểm tra lại đường dẫn hoặc kết nối mạng');
          });
      } else {
        FNC.hideSpinner(1000);
        FNC.displayNotify('THÔNG BÁO', 'Đường dẫn bị sai, xin vui lòng kiểm tra lại');
      }
    });
    this.sub.unsubscribe();
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

  // getResult = (id) => {
  //   this.eventService.getResult(id).subscribe(
  //     res => {
  //       let resJson = res.json();
  //       if (resJson.result) {
  //         this.results = resJson.data;
  //         this.calValueReport("-1");
  //         FNC.hideSpinner(1000);
  //       } else {
  //         FNC.hideSpinner(1000);
  //         FNC.displayNotify("Đã xảy ra lỗi","Để được giải đáp liên hệ: shaharaki@gmail.com", resJson.message);
  //       }
  //     },
  //     err => {
  //       FNC.hideSpinner(1000);
  //       FNC.displayNotify("THÔNG BÁO", "Không kết nối được tới server vui lòng kiểm tra lại đường dẫn hoặc kết nối mạng");
  //     });
  // }

  selectGift = (gift) => {
    if (!gift.codeArray || gift.codeArray.length === 0) {
      this.isShowButtonExportGiftResult = true;
      FNC.showSpinner();
      this.eventService.getGiftResult(gift._id).subscribe(
        res => {
          let resJson = res.json();
          if (resJson.result) {
            gift.codeArray = resJson.data;
            this.currentGift = gift;
            // this.currentCodeExport = this.eventModel._id + ';' + this.currentGift.id;
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
      this.currentGift = gift;
      // this.currentCodeExport = this.eventModel._id + ';' + this.currentGift.id;
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
            this.currentGift.codeArray = resJson.data;
            this.currentGift.name ='Kết quả tìm kiếm';
            this.currentGift.playedCounter = resJson.data.length;
            this.currentGift.numberOfReward = resJson.data.length;
            // this.currentCodeExport = this.eventModel._id + ';' + this.currentGift.id;
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
    this.currentCode = codeIem;
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
    if (giftID) {
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
}
