import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ChatbotComponent } from './Components/chatbot/chatbot.component';
import { ChatbotService } from './Services/chatbot.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,NgxSpinnerModule,ChatbotComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[ChatbotService]
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'GlossyClinic';
  isChatOpen = false;
  private chatSubscription!: Subscription;

  constructor(public chatService: ChatbotService) {}

  ngOnInit() {
    this.chatSubscription = this.chatService.isChatOpen$.subscribe(isOpen => {
      console.log("AppComponent: Chat open state changed:", isOpen);
      this.isChatOpen = isOpen;
    });
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }
}
