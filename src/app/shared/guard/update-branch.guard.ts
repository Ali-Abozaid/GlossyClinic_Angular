import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalMessageComponent } from '../../Components/modal-message/modal-message.component'; 

export const UpdateBranchGuard: CanActivateFn = (route, state) => {
  const platform = inject(PLATFORM_ID);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  if (isPlatformBrowser(platform)) {
    const token = localStorage.getItem('eToken');

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;

      if (userRole === 'Admin') {
        return true; 
      } else {
        dialog.open(ModalMessageComponent); 
        return false;
      }
    } else {
      router.navigate(['/DashboardGloosy/login']);
      return false;
    }
  } else {
    return false; 
  }
};
