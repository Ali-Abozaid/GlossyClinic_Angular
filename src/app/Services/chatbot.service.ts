import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:5275/api/Chatbot';
  private isChatOpenSubject = new BehaviorSubject<boolean>(false);
  isChatOpen$ = this.isChatOpenSubject.asObservable();

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    return this.http.post(this.apiUrl, { message });
  }

  toggleChat() {
    this.isChatOpenSubject.next(!this.isChatOpenSubject.value);
  }

  openChat() {
    console.log("ChatbotService: Opening chat");
    this.isChatOpenSubject.next(true);
    console.log("ChatbotService: Chat open state:", this.isChatOpenSubject.value);
  }

  closeChat() {
    console.log("ChatbotService: Closing chat");
    this.isChatOpenSubject.next(false);
    console.log("ChatbotService: Chat open state:", this.isChatOpenSubject.value);
  }
}