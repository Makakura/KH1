declare var $ :any;
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-result-management',
  templateUrl: './result-management.component.html',
  styleUrls: ['./result-management.component.css']
})
export class ResultManagementComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $('body').css('background-color', 'black');
  }

}
