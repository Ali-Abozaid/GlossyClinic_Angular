import { Component, OnInit } from '@angular/core';
import { ChatbotService } from '../../Services/chatbot.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
})
export class ChatbotComponent implements OnInit {
  messages: Array<{sender: string, text: string}> = [];
  userMessage = '';
  isExpanded = false;
  hideButtons = false;
  predefinedKeys: string[] = [
    "ساعات العمل",
    "الخدمات",
    "حجز",
    "الفروع",
    "دكتور مينا",
    "دكتور مقار"
  ];
  get buttonPairs(): string[][] {
    const pairs: string[][] = [];
    for (let i = 0; i < this.predefinedKeys.length; i += 2) {
      pairs.push(this.predefinedKeys.slice(i, i + 2));
    }
    return pairs;
  }
  constructor(public chatService: ChatbotService) {}
  ngOnInit() {
    console.log("ChatbotComponent initialized");
  }
  sendMessage() {
    if (this.userMessage.trim()) {
      this.sendMessageToService(this.userMessage);
      this.userMessage = '';
    }
  }

  sendPredefinedMessage(key: string) {
    this.hideButtons = true;
    this.sendMessageToService(key);
  }

  
  private sendMessageToService(message: string) {
    this.messages.push({sender: 'user', text: message});
    this.chatService.sendMessage(message).subscribe(
      response => {
        this.messages.push({sender: 'bot', text: response.message});
        // Show buttons again after bot responds
        setTimeout(() => {
          this.hideButtons = false;
        }, 500); 
      },
      error => {
        console.error('Error:', error);
        this.messages.push({sender: 'bot', text: 'عذراً، حدث خطأ في معالجة طلبك.'});

        setTimeout(() => {
          this.hideButtons = false;
        }, 500);
      }
    );
  }

  toggleChat() {
    this.isExpanded = !this.isExpanded;
  }
  minimizeChat() {
    this.chatService.closeChat();
  }
}