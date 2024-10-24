import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.component.html',
  styleUrl: './modal-message.component.css'
   
  
})
export class ModalMessageComponent {
  constructor(private dialogRef: MatDialogRef<ModalMessageComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
