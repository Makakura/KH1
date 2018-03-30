declare var $ :any;
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  curClass = '';
  code = '';
  isValidCode = false;
  isPlayed = false;
  isShowFireWork = false;
  isCompleteInput = false;
  constructor() { }

  ngOnInit() {
    $('#inputModal').modal('show');
  }

  start = () => {
    let that = this;
    this.curClass = "rotate";
    setTimeout(function(){
      that.curClass = "rotate" + that.getRamdomNum();
    }, 3000); 

    // if (!this.isCompleteInput) {
    //   let that = this;
    //   this.curClass = "rotate";
    //   setTimeout(function(){
    //     that.curClass = "rotate" + that.getRamdomNum();
    //   }, 3000); 
    //   // setTimeout(function(){
    //   //   that.isShowFireWork = true;
    //   // }, 5000);
    // } else {
    //   $('.alert').alert()
    // }
  }

  fireworkClick = () => {
    this.isShowFireWork = false;
  }

  getRamdomNum = (): number => {
		var randomNum = Math.round((Math.random() * 10));
		if (randomNum == 9)
			randomNum = 3;
		else if (randomNum == 10)
			randomNum = 5;
		return randomNum;
  }
  
  completeInput = () => {
    $('#inputModal').modal('hide');
    this.isCompleteInput = true;
  }
  
  checkValidCode = (code) => {
    if (code.length >= 9) {
      this.isValidCode = true;
      $('#codeCheckButton').prop('disabled', true);
    } else {
      this.isValidCode = false;
      $('#codeCheckButton').prop('disabled', false);
    }
  }
  codeInputKeyUp = () => {
    this.isValidCode = false;
    $('#codeCheckButton').prop('disabled', false);    
  }
}
