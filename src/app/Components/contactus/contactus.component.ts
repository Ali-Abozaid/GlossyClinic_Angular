import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BranchService } from '../../shared/services/branch.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Gallery, GalleryItem, ImageItem, GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [CommonModule, RouterLink,GalleryModule, LightboxModule],
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css'],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ContactusComponent implements OnInit {
  branches: any[] = [];
  constructor(private branchService: BranchService, private gallery: Gallery, private sanitizer: DomSanitizer) {}
  ngOnInit(): void {
    this.branchService.getBranches().subscribe({
      next: (value) => {
        this.branches = value;
        // Initialize gallery items for each branch
        this.branches.forEach(branch => {
          const galleryRef = this.gallery.ref(branch.branchName);
          galleryRef.setConfig({
            thumbPosition: 'top',
            imageSize: 'contain',
            loop: true,
            counter: true,
            nav: true,
            dots: true,
          });
          galleryRef.load(this.getGalleryItems(branch.branchName));
        });
      },
      error: (err) => console.error(err),
    });
  }

  getGalleryItems(branchName: string): GalleryItem[] {
    const images = this.getBranchImages(branchName);
    return images.map(imagePath => new ImageItem({ src: imagePath, thumb: imagePath }));
  }

  getBranchImages(branchName: string): string[] {
    if (branchName === 'القوصية' || branchName === 'qussia') {
      return [
        './assets/images/1.png', './assets/images/2.png', './assets/images/3.png', 
        './assets/images/7.jpeg', './assets/images/21.png', './assets/images/22.png', 
        './assets/images/23.png', './assets/images/24.png', './assets/images/30.png', 
        './assets/images/26.png', './assets/images/27.png'
      ];
    } else if (branchName === 'ابنوب' || branchName === 'abnoub') {
      return [
        './assets/images/14.png',
         './assets/images/9.png',
          './assets/images/11.png', 
        './assets/images/12.png',
         './assets/images/13.png',
          './assets/images/14.png', 
        './assets/images/15.png',
         './assets/images/16.png',
          './assets/images/17.png', 
        './assets/images/18.png',
         './assets/images/19.png',
          './assets/images/20.png'
      ];
    } else {
      return [];
    }
  }

  sanitizeMapUrl(branchName: string): SafeResourceUrl {
  const url = (branchName === 'qussia' || branchName === 'القوصية')
    ? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3528.7151896650755!2d31.151928!3d27.2674027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14450590e9390a91%3A0x57a481f5604fd9e!2sAbnub%2C%20Abanoub%2C%20Abnub%2C%20Assiut%20Governorate%202251557!5e0!3m2!1sen!2seg!4v1697743506356!5m2!1sen!2seg    '
    : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3526.464869904733!2d30.8226506!3d27.439539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1444e3e8c0837a4d%3A0xb58d5963459bdf1a!2sEl-Galaa%2C%20Fazarah%2C%20El%20Qusiya%2C%20Assiut%20Governorate!5e0!3m2!1sen!2seg!4v1697742226195!5m2!1sen!2seg    ';

  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}


getMapUrl(branchName: string): string {
  if (branchName === 'qussia' || branchName === 'القوصية') {
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3528.7151896650755!2d31.151928!3d27.2674027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14450590e9390a91%3A0x57a481f5604fd9e!2sAbnub%2C%20Abanoub%2C%20Abnub%2C%20Assiut%20Governorate%202251557!5e0!3m2!1sen!2seg!4v1697743506356!5m2!1sen!2seg    ';
  } else if (branchName === 'abnoub' || branchName === 'ابنوب') {
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3526.464869904733!2d30.8226506!3d27.439539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1444e3e8c0837a4d%3A0xb58d5963459bdf1a!2sEl-Galaa%2C%20Fazarah%2C%20El%20Qusiya%2C%20Assiut%20Governorate!5e0!3m2!1sen!2seg!4v1697742226195!5m2!1sen!2seg    ';
  } else {
    return '';
  }
}
}
