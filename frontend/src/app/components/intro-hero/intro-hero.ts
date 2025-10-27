import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-intro-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro-hero.html',
  styleUrls: ['./intro-hero.scss']
})
export class IntroHeroComponent implements AfterViewInit {

  constructor(private zone: NgZone){}

  ngAfterViewInit(): void {
    // Text split + intro animation (no external libs)
    const splitTargets = Array.from(document.querySelectorAll('.js-split'));
    splitTargets.forEach((el) => {
      const node = el as HTMLElement;
      const words = node.textContent?.trim().split(/\s+/) ?? [];
      node.innerHTML = words.map(w => `<span class="split-word">${w}&nbsp;</span>`).join('');
      const spans = node.querySelectorAll<HTMLElement>('.split-word');
      spans.forEach((s, i) => {
        s.animate(
          [
            { transform: 'translateY(120%)', opacity: 0 },
            { transform: 'translateY(0%)', opacity: 1 }
          ],
          { duration: 1100, delay: i * 35, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'both' }
        );
      });
    });

    // Fade-up for other elements
    const reveals = Array.from(document.querySelectorAll('.intro-hero .will-reveal:not(.js-split)'));
    reveals.forEach((el, i) => {
      (el as HTMLElement).animate(
        [
          { transform: 'translateY(14px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ],
        { duration: 900, delay: 200 + i * 80, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'both' }
      );
    });

    // IntersectionObserver to toggle header style
    this.zone.runOutsideAngular(() => {
      const sentinel = document.getElementById('hero-sentinel');
      const headerState = (over: boolean) => {
        window.dispatchEvent(new CustomEvent('heroState', { detail: { over } }));
      };

      if ('IntersectionObserver' in window && sentinel) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            // when sentinel is visible => user is at (or near) hero bottom
            headerState(!entry.isIntersecting);
          });
        }, { threshold: 0.01 });
        io.observe(sentinel);
      } else {
        // fallback: use scroll position
        const onScroll = () => {
          const over = (window.scrollY || document.documentElement.scrollTop) > (window.innerHeight * 0.75);
          headerState(over);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      }
    });
  }
}
