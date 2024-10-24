import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatbotService } from '../../Services/chatbot.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule,RouterModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentIndex = 0;
  teamMembers = [
    {
      name: 'د / مقار ماجد',
      image: 'assets/images/DrMaqar.jpg',
      details: [
        'أخصائي طب و جراحة الفم و الأسنان',
        'عضو الجمعية الأمريكية لتقويم الأسنان',
        'د.زمالة الكلية الملكية ببريطانيا',
      ],
    },
    {
      name: 'د / مينا يسري',
      image: 'assets/images/DrMina.jpg',
      details: [
        'أخصائي طب و جراحة الفم و الأسنان',
        'عضو الجمعية الأمريكية لزراعة الأسنان',
        'د.زمالة الكلية الملكية ببريطانيا',
      ],
    },
  ];

  nextSlide() {
    if (this.currentIndex < this.teamMembers.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Loop back to the first slide
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.teamMembers.length - 1; // Loop back to the last slide
    }
  }

  private slideInterval: any;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private chatService: ChatbotService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.startSlider();
    }
  }

  startSlider() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  
  ngOnDestroy() {
    if (this.isBrowser && this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
  //chatbot
  openChat() {
    console.log("HomeComponent: Opening chat");
    this.chatService.openChat();
  }
}

