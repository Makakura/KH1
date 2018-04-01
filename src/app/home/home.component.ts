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
  private curClass = '';
  private code = '';
  private isValidCode = false;
  private isPlayed = false;
  private isShowFireWork = false;
  private isCompleteInput = false;
  private sub: any;
  private currentEvent:EventWheelModel = new EventWheelModel();
  
  constructor(private route: ActivatedRoute, 
              private eventService: EventService,
              ) { }

  ngOnInit() {
    this.initCssView();
    this.getEvent();
  }

  initCssView = () => {
    $('#inputModal').modal({
      backdrop: 'static',
      keyboard: false
    })
    $('#inputModal').modal('show');
    $('body').css('background-color', 'darkred');
  }

  getEvent = () => {
    this.sub = this.route.params.subscribe(params => {
      let id = params['id'];
      if (id){ 
        this.eventService.getEventByID(id).subscribe(response => {
          this.currentEvent = this.eventService.converJsonToEvent(response.json());
          console.log(this.currentEvent);
        });
      }
      
   });
  }
  
  start = () => {
    if (this.isCompleteInput) {
      let that = this;
      this.curClass = "rotate";
      setTimeout(function(){
        that.curClass = "rotate" + that.getRamdomNum();
      }, 3000);
    } else {
      $('#inputModal').modal('show');
    }
    
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
    // Validate input data
    $('#inputModal').modal('hide');
    this.isCompleteInput = true;
  }
  

  checkValidCode = (code) => {
    if (code.length >= 8) {
      return true;
    } else {
      return false;
    }
  }

  // Check code input
  codeInputKeyUp = (code) => {
    if (code.length >= 8 && this.checkValidCode(code)) {
        this.isValidCode = true;
    } else {
      this.isValidCode = false;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
