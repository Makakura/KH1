declare var $ :any;
import { Component, OnInit, group } from '@angular/core';
import { EventWheelModel } from '../../model/eventWheelModel';
import { GiftModel } from '../../model/giftModel';
import { EventService } from '../services/event-service';
import { ActivatedRoute } from '@angular/router';
import { delay } from 'rxjs/operator/delay';
import { Router } from '@angular/router';
import { count } from 'rxjs/operator/count';
import { FNC } from '../services/functioncommon';

@Component({
  selector: 'app-code-management',
  templateUrl: './code-management.component.html',
  styleUrls: ['./code-management.component.css'],
  providers: [EventService] 
})
export class CodeManagementComponent implements OnInit {
  eventModel: EventWheelModel = new EventWheelModel();
  currentTotalReward = 0;
  currentTotalCodeUsed = 0;
  sub: any;
  currentGift: GiftModel = new GiftModel(0, '', 0, 0);
  currentCodeArrayShow = [];
  currentCodeOfGiftGroupByDate = [];
  currentCodeExport = '';
  releaseCodeCounter = 0;
  isCreateCode = false;
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
    this.getCodeToView();
    // on exit edit popup
    $('#gift-detail').on('hidden.bs.modal', function (e) {
      that.currentGift = new GiftModel(0, '', 0, 0);
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
              let giftArr = this.eventModel.giftArray;
              giftArr = FNC.sortByKey(giftArr, 'id');
              this.calValueReport();
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
    let numberOfCode = Number.parseInt($('#inputNumberOfCode').val());
    if (!numberOfCode || numberOfCode <= 0 || !this.currentGift){
      return;
    }
    this.isCreateCode = true;
    this.displayConfirmDialog('LƯU Ý:', 'Bạn có muốn xuất '+ Number.parseInt($('#inputNumberOfCode').val()) +' mã cho phần thưởng: ' + this.currentGift.name, 'closeConfirmDialog', 'createCode');
  }

  createCode = () => {
    let numberOfCode = Number.parseInt($('#inputNumberOfCode').val());
    
    let thisDate = new Date();
    let bodydata = {
      eventID: this.eventModel._id,
      gift: {
        _id: this.currentGift._id, 
        numberOfCode: numberOfCode,
      },
      createDate: thisDate,
      clientCreatedDate: thisDate.toLocaleString('en-GB')
    };
    FNC.showSpinner();
    this.eventService.createCode(bodydata).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          let receiveCodeArray = resJson.data;
          receiveCodeArray.forEach(element => {
          this.currentGift.codeArray.push(element);
          this.currentCodeOfGiftGroupByDate = this.groupByDate(this.currentGift.codeArray, 'createdDate');
          this.selectGift(this.currentGift);
          $('#inputNumberOfCode').val('');
          FNC.hideSpinner(500);
          FNC.displayNotify('THÔNG BÁO', 'ĐÃ TẠO MÃ THÀNH CÔNG');
          });
        } else {
          FNC.hideSpinner(500);
          FNC.displayNotify('Thông báo','Không lấy được danh sách phần thưởng');
        }
      },
      err => {
        FNC.hideSpinner(500);
        FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
    });
    this.closeConfirmDialog();
  }

  selectDate = (value) => {
    if (value === '-1' ) {
      this.currentCodeArrayShow = this.currentGift.codeArray;
      this.currentCodeExport = this.eventModel._id + ';' + this.currentGift.id;
    } else {
      let dateSelected = $('#select-date option:selected').val();
      this.currentCodeExport = this.eventModel._id + ';' + this.currentGift.id + ';' + dateSelected;
      this.currentCodeArrayShow = this.getCodeArrayByDate(this.currentCodeOfGiftGroupByDate, dateSelected);
    }
    this.countReleaseCode();
    
  }

  countReleaseCode = () => {
    let arrayReleasedCode = this.currentCodeArrayShow.filter((item)=> { return item.isUsed });
    this.releaseCodeCounter = arrayReleasedCode.length;
    this.currentCodeArrayShow = FNC.sortByKey(this.currentCodeArrayShow, 'isUsed'); 
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
    if (!gift.codeArray || gift.codeArray.length === 0) {
      FNC.showSpinner();
      this.eventService.getCodes(gift._id).subscribe(
        res => {
          let resJson = res.json();
          if (resJson.result) {
            gift.codeArray = resJson.data;
            this.currentGift = gift;
            this.currentCodeExport = this.eventModel._id + ';' + this.currentGift.id;
            this.currentCodeOfGiftGroupByDate = this.groupByDate(this.currentGift.codeArray, 'createdDate');
            this.selectDate('-1');
            $('#gift-detail').modal('show');
            FNC.hideSpinner(500);
          } else {
            FNC.hideSpinner(500);
            FNC.displayNotify('Thông báo','Không lấy được danh sách phần thưởng');
          }
        },
        err => {
          FNC.hideSpinner(500);
          FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
        }
      );
    } else {
      this.currentGift = gift;
      this.currentCodeExport = this.eventModel._id + ';' + this.currentGift.id;
      this.currentCodeOfGiftGroupByDate = this.groupByDate(this.currentGift.codeArray, 'createdDate');
      this.selectDate('-1');
      $('#gift-detail').modal('show');
    }
  }
  
  goTo = (page, param?) => {
    if (param) {
      this.router.navigate(['/' + page, param]);
    } else {
      this.router.navigate(['/' + page]);
    }
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

  releaseCode = (codeItem) => {
    FNC.showSpinner();
      this.eventService.releaseCode(this.currentGift._id, codeItem.code).subscribe(
        res => {
          let resJson = res.json();
          if (resJson.result) {
            codeItem.isUsed = true;
            this.countReleaseCode();
            FNC.hideSpinner(0);
          } else {
            FNC.hideSpinner(0);
            FNC.displayNotify('Thông báo','Không cập nhật được thông tin mã');
          }
        },
        err => {
          FNC.hideSpinner(0);
          FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
        }
      );
  }

  valueKeyup = (event) => {
    if (event.target.value < 0 ) {
      event.target.value = 0;
    }
    if (event.target.value > 500) {
      event.target.value = 500;
    }
  }

  exportAllCodes = () => {
    this.currentCodeExport = this.eventModel._id;
    $('#export-excel-modal').modal('show');
  }

  showExportExcel = () => {
    $('#export-excel-modal').modal('show');
  }

  closeModalExport = () => {
    $('#export-excel-modal').modal('hide');
  }

  displayConfirmDialog (header, body, cancelFunction, okFunction) {
    $('#confirm-header').text(header);
    $('#confirm-body').text(body);
    $('#confirm-cancel').click((e) => {
      if (this.isCreateCode === false){
        e.stopImmediatePropagation();
        e.preventDefault();
      } else {
        this.isCreateCode = false;
        this[cancelFunction]();
      }
    })
    $('#confirm-ok').click((e) => {
      if (this.isCreateCode === false){
        e.stopImmediatePropagation();
        e.preventDefault();
      } else {
        this.isCreateCode = false;
        this[okFunction]();
      }
    })
    $('#confirm-model').modal('show');
  }

  closeConfirmDialog = () => {
    $('#confirm-model').modal('hide');
  }

  closePopupGift = () => {
    $('#gift-detail').modal('hide');
    this.currentGift = new GiftModel(0, '', 0, 0);
    this.currentCodeArrayShow = [];
    this.currentCodeOfGiftGroupByDate = [];
  }
}
