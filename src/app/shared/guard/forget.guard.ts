import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const forgetGuard: CanActivateFn = (route, state) => {
  let platForm=inject(PLATFORM_ID);
  let router=inject(Router)
  let auth=inject(AuthService)
  if(isPlatformBrowser(platForm)){
    if(auth.getEmail() === ''){
      router.navigate(['/forgotPassword'])
      return false;
    }else{
      return true;
      }
  }else{
    return false;
  }};
