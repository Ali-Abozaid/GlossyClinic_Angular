import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';
interface Service {
  title: string;
  description: string;
  icon: string;
  link: string;
  showFullDescription: boolean; // تعريف الخاصية هنا
}
interface Problem {
  title: string;
  description: string;
  icon: string;
}
@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})

export class ServicesComponent {
  services: Service[] = [
    {
      title: 'تنضيف الجير ',
      description: 'تنظيف الأسنان من الجير هو إجراء يتم فيه إزالة طبقة الجير المتراكمة على سطح الأسنان، والتي تحدث نتيجة بعض العادات الخاطئة وتؤدي إلى تراكم البكتريا على الأسنان، ويصعب التخلص من هذه الترسبات الجيرية باستخدام الفرشاة العادية، ويهدف تنظيف الأسنان إلى تنعيم الأسطح الخارجية للأسنان وجعلها أكثر لمعانًا وأيضًا التخلص من الجير الموجود بين الأسنان',
      icon: '../../../assets/images/36.png',
      link: '#',
      showFullDescription: false // خاصية لتحديد عرض النص
    },
    {
      title: 'حشوات العصب',
      description: 'حشو العصب هو إجراء ضروري عندما يتلف لب السن، الأنسجة الرخوة داخل السن، أو يصاب بالعدوى. يمكن أن يحدث هذا الضرر لأسباب مختلفة، بما في ذلك التسوسات العميقة، أو الصدمات، أو أعمال الأسنان السابقة. أثناء حشو العصب  يقوم طبيب الأسنان بإزالة اللب التالف أو المصاب، وتنظيفها ، وملئها بمادة خاصة لمنع العدوى وإغلاق السن. تساعد هذه العملية في إنقاذ السن من الخلع، مما يسمح له بمواصلة العمل كجزء طبيعي من ابتسامتك',
      icon: '../../../assets/images/35.png',
      link: '#',
      showFullDescription: false // خاصية لتحديد عرض النص
    },
    {
      title: 'حشوات الأسنان',
      description: 'حشوات تجاويف الأسنان هي إجراء طب أسنان شائع يهدف إلى إصلاح الأسنان المتضررة بسبب التسوس أو التآكل. يمكن أن يحدث هذا الضرر بسبب سوء نظافة الفم، مما يسمح للبكتيريا بإنتاج الأحماض التي تؤدي إلى تآكل مينا الأسنان بالإضافة إلى إصلاح التجاويف، يمكن أيضًا استخدام الحشوات لاستعادة الأسنان المتشققة أو المكسورة. من خلال ملء المنطقة المتضررة، يمكن لطبيب الأسنان تقوية السن ومنع المزيد من الضرر. يساعد هذا في الحفاظ على وظيفة السن ومظهره، مما يضمن ابتسامة صحية وجذابة',
      icon: '../../../assets/images/34.png',
      link: '#',
      showFullDescription: false // خاصية لتحديد عرض النص
    },
    {
      title: 'زراعة الاسنان',
      description: 'جراحة زرع الأسنان هي عملية تُستبدل من خلالها جذور الأسنان بدعامات معدنية شبيهة بالبراغي، وتُستبدل السن التالفة أو المفقودة بسن اصطناعية تشبه الأسنان الحقيقية بصورة كبيرة من حيث الشكل والأداء. قد تُوفِّر جراحة زرع الأسنان بديلًا مقبولًا لأطقم الأسنان أو الجسور السنِّيَّة التي لا تتوافق على النحو المطلوب، ويمكن أن تُوفِّر اختيارًا عندما لا تسمح جذور الأسنان الطبيعية بتركيب أطقم الأسنان أو استبدال الجسور السنية',
      icon: '../../../assets/images/33.png',
      link: '#',
      showFullDescription: false // خاصية لتحديد عرض النص
    },
    {
      title: 'تركيبات الاسنان',
      description: 'هو الحصول على أسنان صناعية يتم وضعها حسب الرغبة أو بالمكان الذي تم فقد الاسنان فيه، وتتنوع التركيبات من بين تركيبات ثابتة أو تركيبات متحركة. مميزات تركيب الاسنان منح الوجه الشكل الجمالي. المساعدة في المضغ. المحافظة على صحة الاسنان والفم',
      icon: '../../../assets/images/32.png',
      link: '#',
      showFullDescription: false // خاصية لتحديد عرض النص
    },
    {
      title: 'هتاكل ايس كريم براحتك',
      description: 'نعم، يمكنك عمومًا تناول الآيس كريم بعد زيارة عيادة الأسنان يمكن أن يكون الاستمتاع بملعقة من الآيس كريم طريقة منعشة لتخفيف أي إزعاج والاحتفال بزيارة ناجحة لطبيب الأسنان.',
      icon: '../../../assets/images/31.png',
      link: '#',
      showFullDescription: false // خاصية لتحديد عرض النص
    }
  ];
  dentalProblems: Problem[] = [
    {
      title: 'تسوس الأسنان',
      description: 'نحن نقدم علاجات فعالة لتسوس الأسنان باستخدام أحدث التقنيات للحفاظ على صحة أسنانك ومنع انتشار التسوس.',
      icon: '../../../assets/images/tooth-decay.png',
    },
    {
      title: 'ألم الأسنان',
      description: 'سواء كنت تعاني من ألم حاد أو خفيف، فإن أطبائنا سيقومون بتشخيص السبب وتقديم العلاج المناسب للتخلص من الألم.',
      icon: '../../../assets/images/tooth-pain.png',
    },
    {
      title: 'التهابات اللثة',
      description: 'نقدم حلولاً فعالة للتهابات اللثة والحفاظ على صحة اللثة، مما يضمن سلامة الفم والأسنان.',
      icon: '../../../assets/images/gum-disease.png'
    },
    {
      title: 'تشققات الأسنان',
      description: 'نقدم حلولاً لإصلاح تشققات الأسنان سواء كانت صغيرة أو كبيرة باستخدام تقنيات مثل الحشوات والتلبيسات.',
      icon: '../../../assets/images/tooth-crack.png'
    },
    {
      title: 'الأسنان المفقودة',
      description: 'نحن نقدم زراعة الأسنان وغيرها من الحلول لتعويض الأسنان المفقودة، مما يضمن لك ابتسامة صحية وجميلة.',
      icon: '../../../assets/images/missing-teeth.png'
    },
    {
      title: 'حساسية الأسنان',
      description: 'نعمل على معالجة حساسية الأسنان وتقديم العلاجات التي تساعدك في التغلب على الآلام الناتجة عن الطعام والمشروبات الباردة أو الساخنة.',
      icon: '../../../assets/images/tooth-sensitivity.png'
    }
  ];


  toggleDescription(service: Service) {
    service.showFullDescription = !service.showFullDescription;
  }

}
