declare var $ :any;
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventWheelModel } from '../../model/eventWheelModel';
import { EventService } from '../services/event-service';
import { FNC } from '../services/functioncommon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [EventService]
})
export class HomeComponent implements OnInit {
  curClass = '';
  code = '';
  isValidCode = false;
  isPlayed = false;
  isShowFireWork = false;
  isCompleteInput = false;
  sub: any;
  isCheckingCode = false;
  currentEvent:EventWheelModel = new EventWheelModel();
  audioYeah: any;
  audioRotate: any;
  codeItem = {
    'code': '',
    'name': '',
    'phone': '',
    'fb': '',
    'playedDate': ''
  };
  currentNumber = -1;
  giftName = '';

  constructor(private route: ActivatedRoute, 
              private eventService: EventService,
              ) { }

  ngOnInit() {
    this.initCssView();
    this.getEvent();
    this.initSoundRotate();
    this.initSoundCheer();
  }

  initCssView = () => {
    $('body').css('background-image', 'none');
    $('body').css('background-color', '#6d0000');
  }

  getEvent = () => {
    FNC.showSpinner();
    this.sub = this.route.params.subscribe(params => {
      let id = params['id'];
      if (id){ 
        this.eventService.getEventByIDForClient(id).subscribe(
          res => {
            let resJson = res.json();
            if (resJson.result) {
              this.currentEvent = this.eventService.converJsonToEvent(resJson.data);
              FNC.hideSpinner(1000);
            } else {
              FNC.hideSpinner(1000);
              FNC.displayNotify('Thông báo','Không tìm thấy sự kiện, liên hệ với chúng tôi để được hỗ trợ');
            }
          },
          err => {
            FNC.hideSpinner(1000);
            FNC.displayNotify('THÔNG BÁO','Không kết nối được tới server, xin vui lòng kiểm tra và thử lại');
          });
      }
   });
   this.sub.unsubscribe();
  }
  
  start = () => {
    if (this.isCompleteInput && this.currentNumber > -1  && this.giftName) {
      this.isPlayed = true;
      this.audioRotate.play();
      let that = this;
      this.curClass = 'rotate';

      setTimeout(function(){
        that.curClass = 'rotate' + that.currentNumber;
      }, 3000);

      setTimeout(function(){
        that.audioRotate.pause();
        that.audioYeah.play();
        that.sendResult();
      }, 13500);

      setTimeout(function(){
        FNC.displayNotify(
          'CHÚC MỪNG !!!', 
        'Bạn đã nhận được: ' + that.giftName, 
        'Quý khách vui lòng liên hệ với chúng tôi để được hỗ trợ nhận thưởng.',
        that.currentEvent.linkPostFB,
        true);
      }, 14500);
    } else {
      $('#inputModal').modal('show');
    }
  }
  
  completeInput = () => {
    // Validate input data
    this.codeItem.phone = $('#phoneInput').val()
    if (this.validateInputData()) {
      FNC.showSpinner();
      this.eventService.checkPhone(this.codeItem.phone, this.currentEvent._id).subscribe(
        res => {
          let resJson = res.json();
          if (resJson.result && resJson.data) {
            if (resJson.data.isValid) {
              $('#inputModal').modal('hide');
              this.isCompleteInput = true;
            } else {
              FNC.displayNotify('THÔNG BÁO', 'SĐT này đã được sử dụng, chỉ được tham gia 1 lần !');
            }
          } else {
            FNC.displayNotify('THÔNG BÁO','Không kiểm tra được thông tin của bạn, xin vui lòng thử lại');
            return false;
          }
          FNC.hideSpinner(0);
        },
        err => {
          FNC.hideSpinner(0);
          FNC.displayNotify('THÔNG BÁO','Không kết nối được tới server, xin vui lòng kiểm tra và thử lại');
        });  
    } else {
      FNC.displayNotify('THÔNG BÁO', 'Vui lòng nhập đầy đủ thông tin để tiếp tục !');
    }
    
  }
  
  validateInputData = () => {
    if (this.codeItem.name && this.codeItem.phone) {
       return true;
    }
    return false ;
  }

  checkValidCode = (code) => {
    FNC.showSpinner();
    this.eventService.checkCode(code, this.currentEvent._id).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result && resJson.data.isValid) {
          this.currentNumber = resJson.data.number;
          this.giftName = resJson.data.giftName;
          this.isValidCode = true;
          this.isCheckingCode = true;
          // focus next textbox
          $('input[type="text"]').get(1).focus();
        } else if (!resJson.result || !resJson.data.isValid){
          FNC.displayNotify('THÔNG BÁO', resJson.message);
          this.isValidCode = false;
          this.isCheckingCode = false;
        } else {
          FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
          this.isValidCode = false;
          this.isCheckingCode = false;
        }
        FNC.hideSpinner(0);
      },
      err => {
        FNC.hideSpinner(0);
        FNC.displayNotify('THÔNG BÁO', 'Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng');
        this.isValidCode = false;
        this.isCheckingCode = false;
      });
  }

  // Check code input
  codeInputKeyUp = (code) => {
    if (code.length >= 8) {
      this.isCheckingCode = true;
      this.checkValidCode(code);
    } else {
      this.isValidCode = false;
    }
  }

  // Click button check code
  buttonCheckCode = (code) => {
    if (code.length >= 8) {
      this.isCheckingCode = true;
      this.checkValidCode(code);
    } else {
      this.isValidCode = false;
      FNC.displayNotify('THÔNG BÁO', 'Bạn nhập mã thiếu thì phải ^^!');
      this.isValidCode = false;
      this.isCheckingCode = false;
    }
  }

  // Limit length phone
  phoneKeyUp = () => {
    let temp = $('#phoneInput').val();
    if (temp.length > 11) {
      let limited = temp.slice(0,11);
      $('#phoneInput').val(limited);
    }
  }

  initSoundRotate = () => {
    this.audioRotate = new Audio();
    this.audioRotate.src = '../../../assets/audio/rotate.mp3';
    this.audioRotate.load();
  }

  initSoundCheer = () => {
    this.audioYeah = new Audio();
    this.audioYeah.src = '../../../assets/audio/cheer.mp3';
    this.audioYeah.load();
  }

  sendResult = () => {
    if (this.codeItem.code && this.codeItem.name && this.codeItem.phone) {
      this.eventService.sendResult(this.codeItem, this.currentEvent._id).subscribe(
        res => {
          let resJson = res.json();
          if (!resJson.result) {
          FNC.displayNotify('THÔNG BÁO','Đã xảy gián đoạn trong quá trình lưu kết quả, xin vui lòng liên hệ với chúng tôi để được hỗ trợ');
          }
        },
        err => {
          FNC.displayNotify('THÔNG BÁO','Không kết nối được tới server, xin vui lòng kiểm tra và thử lại');
        });
    }
  }
}
