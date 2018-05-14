declare var $ :any;
import { Injectable } from '@angular/core';  
import { Md5 } from 'ts-md5/dist/md5';
 @Injectable()
 export class FNC {
    public static token = undefined;
    public static MD5 = (str) => {
        var md5Factory = new Md5();
        return md5Factory.appendStr(str).end();
    }

    public static saveToken (token) {
      let savedToken = FNC.getToken();
      if (!savedToken || savedToken === '6ad14ba9986e3615423dfca256d04e3f') {
        localStorage.setItem('token', token);
      }
    }

    public static getToken () {
      return localStorage.getItem('token');
    }

    public static clearToken () {
      localStorage.removeItem('token');
    }
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

    public static compareJSON = (json1, json2): boolean => {
      return JSON.stringify(json1) === JSON.stringify(json2);
    }

    public static cloneJSON = (json1): any => {
      return JSON.parse(JSON.stringify(json1));
    }

    public static sortByKey = (array, key) => {
      return array.sort(function(a, b) {
          let x = a[key]; let y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }

    public static scrollListToTop(idList) {
      $('#' + idList).scrollTop(0);
    }
 }
