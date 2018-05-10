import { Component, OnInit } from '@angular/core';
import { EventService } from "../services/event-service";
import { FNC } from '../services/functioncommon';
import { Md5 } from 'ts-md5/dist/md5';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  providers: [EventService] 
})
export class LoginPageComponent implements OnInit {
  username = '';
  pass = '';
  
  constructor(private eventService: EventService, 
              private router: Router) {
  }

  ngOnInit() {
    
  }

  login = () => {
    if (!this.username || !this.pass) {
      FNC.displayNotify('Thông báo','Vui lòng nhập đầy đủ thông tin để đăng nhập');
    } else {
      let str = this.username.toLocaleLowerCase() + this.pass.toLocaleLowerCase();
      let token = FNC.MD5(str);
      this.validate(token);
    }
  }

  validate = (token) => {
    FNC.saveToken('6ad14ba9986e3615423dfca256d04e3f');
    FNC.showSpinner();
    this.eventService.validateToken(token).subscribe(
      res => {
        let resJson = res.json();
        if (resJson.result) {
          // FNC.token = resJson.data.token;
          FNC.saveToken(resJson.data.token);
          FNC.hideSpinner(0);
          setTimeout(() => {
            this.goTo('manage');
          }, 500);
        } else {
          FNC.hideSpinner(0);
          FNC.displayNotify('Thông báo','Thông tin xác thực không hợp lệ');
        }
      },
      err => {
        FNC.hideSpinner(0);
        FNC.displayNotify('THÔNG BÁO','Không kết nối được tới server, xin vui lòng kiểm tra và thử lại');
    });
  }

  goTo = (page) => {
    this.router.navigate(['/' + page]);
  }
}
