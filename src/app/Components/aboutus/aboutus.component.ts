import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gallery, GalleryItem, ImageItem, GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';

interface SocialMedia {
  name: string;
  icon: string;
  link: string;
}

interface TeamMember {
  name: string;
  image: string;
  details: string[];
  socialMedia: SocialMedia[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, GalleryModule, LightboxModule],
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutComponent implements OnInit {
  teamMembers: TeamMember[] = [
    {
      name: 'د / مقار ماجد',
      image: 'assets/images/DrMaqar.jpg',
      details: [
        'أخصائي طب و جراحة الفم و الأسنان',
        'عضو الجمعية الأمريكية لتقويم الأسنان',
        'د.زمالة الكلية الملكية ببريطانيا'
      ],
      socialMedia: [
        { name: 'Facebook', icon: 'fab fa-facebook', link: 'https://www.facebook.com/makar.maged.1?mibextid=ZbWKwL' },
        { name: 'Twitter', icon: 'fab fa-twitter', link: '#' },
        { name: 'YouTube', icon: 'fab fa-youtube', link: '#' }
      ]
    },
    {
      name: 'د / مينا يسري',
      image: 'assets/images/DrMina.jpg',
      details: [
        'أخصائي طب و جراحة الفم و الأسنان',
        'عضو الجمعية الأمريكية لزراعة الأسنان',
        'د.زمالة الكلية الملكية ببريطانيا'
      ],
      socialMedia: [
        { name: 'Facebook', icon: 'fab fa-facebook', link: 'https://www.facebook.com/mena.yousry.9?mibextid=ZbWKwL' },
        { name: 'Twitter', icon: 'fab fa-twitter', link: '#' },
        { name: 'YouTube', icon: 'fab fa-youtube', link: '#' }
      ]
    }
  ];

  galleryItems: GalleryItem[] = [];

  constructor(private gallery: Gallery) {}

  ngOnInit() {
    const imageUrls = [
      'assets/images/case14.jpg',
      'assets/images/case2.jpg',
      'assets/images/case3.jpg',
      'assets/images/case4.jpg',
      'assets/images/case5.jpg',
      'assets/images/case6.jpg',
      'assets/images/case7.jpg',
      'assets/images/case8.jpg',
      'assets/images/case9.jpg',
      'assets/images/case10.jpg'
    ];

    this.galleryItems = imageUrls.map(url => new ImageItem({ src: url, thumb: url }));

    const galleryRef = this.gallery.ref('myGallery');
    galleryRef.setConfig({
      thumbPosition: 'bottom',
      // itemSize: 'fit',
      imageSize: 'contain',
      loop: true, // التمرير المستمر
      counter: false, // إخفاء الع // تشغيل تلقائي
      nav: true, // اظهار أزرار التنقل
      dots: true, // اظهار النقاط السفلية
    });

  }}

