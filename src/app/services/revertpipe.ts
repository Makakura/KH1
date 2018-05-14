import {Pipe} from '@angular/core';

@Pipe({
  name: 'reverse',
  pure: false
})
export class ReversePipe {
  
transform (values) {
    return values.reverse();
  }
}