/*!
 *  Custom enhancements for the Stack theme.
 *  Auto-built (esbuild) and included with `defer` by
 *  layouts/_partials/footer/components/script.html when this file exists.
 *
 *  Slider: progressively enhances every `.slider` produced by the `slider`
 *  shortcode with prev/next arrows, dot indicators and keyboard support.
 *  The underlying `.slider__track` is a CSS scroll-snap container, so
 *  swipe / trackpad scrolling keeps working even if this script never runs.
 */

const arrowIcon = (dir: 'prev' | 'next'): string => {
    const points = dir === 'prev' ? '15 18 9 12 15 6' : '9 18 15 12 9 6';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="${points}"></polyline></svg>`;
};

function setupSlider(slider: HTMLElement): void {
    const track = slider.querySelector<HTMLElement>('.slider__track');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll<HTMLElement>('.slider__slide'));
    if (slides.length <= 1) return; // nothing to navigate

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';

    const indexFromScroll = (): number =>
        track.clientWidth ? Math.round(track.scrollLeft / track.clientWidth) : 0;

    const goTo = (i: number): void => {
        const clamped = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: clamped * track.clientWidth, behavior });
    };

    // --- Arrows ---
    const makeNav = (dir: 'prev' | 'next'): HTMLButtonElement => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slider__nav slider__nav--${dir}`;
        btn.setAttribute('aria-label', dir === 'prev' ? 'Previous image' : 'Next image');
        btn.innerHTML = arrowIcon(dir);
        btn.addEventListener('click', () => goTo(indexFromScroll() + (dir === 'prev' ? -1 : 1)));
        return btn;
    };
    const prevBtn = makeNav('prev');
    const nextBtn = makeNav('next');

    // --- Dots ---
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'slider__dots';
    const dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', `Go to image ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    const update = (): void => {
        const idx = indexFromScroll();
        dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        prevBtn.disabled = idx <= 0;
        nextBtn.disabled = idx >= slides.length - 1;
    };

    slider.append(prevBtn, nextBtn, dotsWrap);

    // Keyboard support when the slider region is focused
    slider.tabIndex = 0;
    slider.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(indexFromScroll() - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(indexFromScroll() + 1);
        }
    });

    let ticking = false;
    track.addEventListener(
        'scroll',
        () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                update();
                ticking = false;
            });
        },
        { passive: true }
    );
    window.addEventListener('resize', update);

    update();
}

function initSliders(): void {
    document.querySelectorAll<HTMLElement>('.slider').forEach(setupSlider);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
} else {
    initSliders();
}
