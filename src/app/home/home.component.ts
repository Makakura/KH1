declare var $ :any;
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventWheelModel } from '../../model/eventWheelModel';
import { EventService } from '../services/event-service';

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
    "code": "",
    "name": "",
    "phone": "",
    "fb": ""
  };
  currentNumber = -1;
  giftName = "";

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
    $('#inputModal').modal({
      backdrop: 'static',
      keyboard: false
    })
    $('#inputModal').modal('show');
    $('body').css('background-color', 'darkred');
    $('body').css('background-image', 'none');
  }

  getEvent = () => {
    this.sub = this.route.params.subscribe(params => {
      let id = params['id'];
      if (id){ 
        this.eventService.getEventByIDForClient(id).subscribe(
          res => {
            let resJson = res.json();
            if (resJson.result) {
              this.currentEvent = this.eventService.converJsonToEvent(resJson.data);
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
  
  start = () => {
    if (this.isCompleteInput && this.currentNumber > -1  && this.giftName) {
      this.isCompleteInput = false;
      this.audioRotate.play();
      let that = this;

      this.curClass = "rotate";

      setTimeout(function(){
        that.curClass = "rotate" + that.currentNumber;
      }, 3000);

      setTimeout(function(){
        that.audioRotate.pause();
        that.audioYeah.play();
        that.sendResult();
      }, 13500);

      setTimeout(function(){
        that.displayNotify(
          "CHÚC MỪNG !!!", 
        "Bạn đã nhận được: " + that.giftName, 
        "Quý khách vui lòng liên hệ với chúng tôi để được hỗ trợ nhận thưởng.",
        that.currentEvent.linkPostFB);
      }, 14500);
    } else {
      console.log('Đã có lỗi xảy ra, xin vui lòng thử lại')
    }
  }

  fireworkClick = () => {
    this.isShowFireWork = false;
  }
  
  completeInput = () => {
    // Validate input data
    if (this.validateInputData()) {
      this.eventService.checkPhone(this.codeItem.phone, this.currentEvent._id).subscribe(
        res => {
          let resJson = res.json();
          if (resJson.result && resJson.data) {
            if (resJson.data.isValid) {
              $('#inputModal').modal('hide');
              this.isCompleteInput = true;
            } else {
              this.displayNotify("THÔNG BÁO", "SĐT này đã được sử dụng, chỉ được tham gia 1 lần !");
            }
          } else {
            console.log(resJson.message);
            return false;
          }
        },
        err => {
          console.log('Không kết nối được tới server, xin vui lòng thử lại')
        });  
    } else {
      this.displayNotify("THÔNG BÁO", "Vui lòng nhập đầy đủ thông tin để tiếp tục !");
    }
    
  }
  
  validateInputData = () => {
    if (this.codeItem.name && this.codeItem.phone && this.codeItem.fb) {
       return true;
    }
    return false ;
  }

  checkValidCode = (code) => {
    this.eventService.checkCode(code, this.currentEvent._id).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result && resJson.data.isValid) {
          this.currentNumber = resJson.data.number;
          this.giftName = resJson.data.giftName;
          this.isValidCode = true;
          this.isCheckingCode = true;
          // focus next textbox
          $('#input-name').focus();
        } else if (!resJson.result || !resJson.data.isValid){
          this.displayNotify("THÔNG BÁO", resJson.message);
          this.isValidCode = false;
          this.isCheckingCode = false;
        } else {
          this.displayNotify("THÔNG BÁO", "Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng");
          this.isValidCode = false;
          this.isCheckingCode = false;
        }
        
      },
      err => {
        this.displayNotify("THÔNG BÁO", "Không tìm thấy kết nối, xin vui lòng kiểm tra lại mạng");
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
      this.displayNotify("THÔNG BÁO", "Bạn nhập mã thiếu thì phải ^^!");
      this.isValidCode = false;
      this.isCheckingCode = false;
    }
  }

  // Limit length phone
  phoneKeyUp = () => {
    let temp = $('#phoneInput').val()
    if (temp.length > 11) {
      let limited = temp.slice(0,11);
      $('#phoneInput').val(limited);
    }
  }

  initSoundRotate = () => {
    this.audioRotate = new Audio();
    this.audioRotate.src = "../../../assets/audio/rotate.mp3";
    this.audioRotate.load();
  }

  initSoundCheer = () => {
    this.audioYeah = new Audio();
    this.audioYeah.src = "../../../assets/audio/cheer.mp3";
    this.audioYeah.load();
  }

  sendResult = () => {
    console.log(this.codeItem);
    if (this.codeItem.code && this.codeItem.name && this.codeItem.phone) {
      this.eventService.sendResult(this.codeItem, this.currentEvent._id).subscribe(
        res => {
          let resJson = res.json();
          if (!resJson.result) {
            console.log('Đã xảy ra lỗi xin vui lòng thử lại hoặc liên hệ với chúng tôi');
          }
        },
        err => {
          console.log('Không kết nối được tới server, xin vui lòng thử lại');
        });
    }
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
}
