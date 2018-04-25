declare var $ :any;
import { Injectable } from '@angular/core';  

 @Injectable()
 export class FNC {
    public static displayNotify (header, body, sub?, link?, isShowCloseButton?) {
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
        if(isShowCloseButton) {
          $(".notify-button").css('display', 'initial');
        } else {
          $(".notify-button").css('display', 'none');
        }
        $('#notify-model').modal('show');
    }

    public static showSpinner = () => {
      $('#spinner').css('visibility', 'visible');
    }
    
    public static hideSpinner = (delay) => {
      setTimeout(function(){
        $('#spinner').css('visibility', 'hidden');
      }, delay);
    }

 }
