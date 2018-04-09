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
  audio: any;
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
    this.audio = new Audio();
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
      this.playSoundRotate();
      let that = this;
      this.curClass = "rotate";
      setTimeout(function(){
        that.curClass = "rotate" + that.currentNumber;
      }, 3000);
      setTimeout(function(){
        that.playSoundCheer();
        that.sendResult();
      }, 3500);
      setTimeout(function(){
        that.displayNotify(
          "CHÚC MỪNG !!!", 
        "Bạn đã nhận được 01 " + that.giftName, 
        "Quý khách vui lòng liên hệ với chúng tôi để được hỗ trợ nhận thưởng.",
        that.currentEvent.linkPostFB);
      }, 4500);
    } else {
      console.log('Đã có lỗi xảy ra, xin vui lòng thử lại')
    }
  }

  fireworkClick = () => {
    this.isShowFireWork = false;
  }
  
  completeInput = () => {
    // Validate input data
    $('#inputModal').modal('hide');
    this.isCompleteInput = true;
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
        } else if (!resJson.result){
          this.displayNotify("THÔNG BÁO", resJson.message);
          this.isValidCode = false;
          this.isCheckingCode = false;
        } else if (!resJson.data.isValid) {
          this.displayNotify("THÔNG BÁO", "Mã không hợp lệ");
          this.isValidCode = false;
          this.isCheckingCode = false;
        } else {
          this.displayNotify("THÔNG BÁO", "Không kiểm tra được mã xin hãy thử lại sau");
          this.isValidCode = false;
          this.isCheckingCode = false;
        }
        
      },
      err => {
        console.log('Không kết nối được tới server, xin vui lòng thử lại');
        this.isCheckingCode = false;
        this.isValidCode = false;
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

  playSoundRotate = () => {
    this.audio = new Audio();
    this.audio.src = "../../../assets/audio/rotate.mp3";
    this.audio.load();
    this.audio.play();
  }

  playSoundCheer = () => {
    this.audio.pause();
    this.audio = new Audio();
    this.audio.src = "../../../assets/audio/cheer.mp3";
    this.audio.load();
    this.audio.play();
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
