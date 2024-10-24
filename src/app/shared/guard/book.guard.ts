import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const bookGuard: CanActivateFn = (route, state) => {
  
  let platForm=inject(PLATFORM_ID);
  let router=inject(Router)

  if(isPlatformBrowser(platForm)){
    if(localStorage.getItem("eToken")){
      return true;
      }else{
        router.navigate(['/login'])
        return false;
      }
  }else{
    return false;
  }

};
