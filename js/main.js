/**
 * JTR Autoglass Inc. - Mobile-First Main Application Controller
 */

// Google Places API configuration (Enter your details here to load live reviews)
const GOOGLE_PLACES_CONFIG = {
  apiKey: "AIzaSyCSPLaGvXD2c-o2gjTnOJN8RpcbZNXYt38",       // Enter Google Maps API key here (e.g. AIzaSy...)
  placeId: "ChIJ6ZsUw27pKogReDWcimQSljg"       // Enter Place ID of JTR Autoglass (e.g. ChIJ...)
};


document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initBeforeAfterSlider();
  initAccordions();
  initTestimonialCarousel();
  initFloatingContact();
});

/**
 * Scroll Reveal Animations using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

/**
 * Before/After Image Comparison Slider with Touch Sync Support
 */
function initBeforeAfterSlider() {
  const slider = document.querySelector('.ba-slider-wrapper');
  if (!slider) return;

  const handle = slider.querySelector('.ba-slider-handle');
  const beforeImg = slider.querySelector('.ba-before');
  const beforeImgTag = beforeImg.querySelector('img');
  let isDragging = false;

  // Keep image aligned perfectly on mobile resize events
  const syncImageSize = () => {
    if (beforeImgTag && slider) {
      beforeImgTag.style.width = `${slider.offsetWidth}px`;
    }
  };

  syncImageSize();
  window.addEventListener('resize', syncImageSize);

  const moveSlider = (clientX) => {
    const rect = slider.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;

    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    handle.style.left = `${percentage}%`;
    beforeImg.style.width = `${percentage}%`;
  };

  // Mouse drag handlers
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    moveSlider(e.clientX);
  });

  // Touch drag handlers (Mobile)
  handle.addEventListener('touchstart', (e) => {
    isDragging = true;
  });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      moveSlider(e.touches[0].clientX);
    }
  });

  // Handle jumps on wrapper click
  slider.addEventListener('click', (e) => {
    if (e.target !== handle && !handle.contains(e.target)) {
      moveSlider(e.clientX);
    }
  });
}

/**
 * Collapsible Accordions (Services, About details)
 */
function initAccordions() {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isActive = item.classList.contains('active');

      // Close all other active items (keeps view minimalist and tidy)
      const activeItems = document.querySelectorAll('.accordion-item.active');
      activeItems.forEach(activeItem => {
        if (activeItem !== item) {
          activeItem.classList.remove('active');
          activeItem.querySelector('.accordion-body').style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        body.style.maxHeight = null;
      } else {
        item.classList.add('active');
        body.style.maxHeight = `${body.scrollHeight}px`;
      }
    });
  });
}

/**
 * Testimonial Carousel sliding system
 */
function initTestimonialCarousel() {
  const track = document.querySelector('.carousel-track');
  const dotsContainer = document.querySelector('.carousel-dots');
  if (!track || !dotsContainer) return;

  // Set write review button href dynamically
  const writeBtn = document.getElementById('writeReviewBtn');
  if (writeBtn) {
    writeBtn.href = `https://www.google.com/maps/search/?api=1&query=JTR+Autoglass+Inc+Alliston+Ontario`;
  }

  let slides = Array.from(track.children);
  let currentIndex = 0;
  let autoplayInterval;

  const initCarouselControls = () => {
    // Clear previous dots
    dotsContainer.innerHTML = '';
    slides = Array.from(track.children);
    
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel-dot');
      if (idx === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to testimonial slide ${idx + 1}`);
      dotsContainer.appendChild(dot);

      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoplay();
      });
    });
    
    resetAutoplay();
  };

  const dots = () => Array.from(dotsContainer.children);

  const goToSlide = (index) => {
    currentIndex = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    
    dots().forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      goToSlide(nextIndex);
    }, 5000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };

  // Live reviews fetcher
  if (GOOGLE_PLACES_CONFIG.apiKey && GOOGLE_PLACES_CONFIG.placeId) {
    const scriptId = 'google-maps-places-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_CONFIG.apiKey}&libraries=places&callback=onGoogleMapsApiLoaded`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      window.onGoogleMapsApiLoaded = () => {
        fetchLiveGoogleReviews();
      };
    } else if (window.google) {
      fetchLiveGoogleReviews();
    }
  } else {
    initCarouselControls();
  }

  function fetchLiveGoogleReviews() {
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails({
        placeId: GOOGLE_PLACES_CONFIG.placeId,
        fields: ['reviews', 'rating', 'user_ratings_total', 'name']
      }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          
          // --- Update rating summary card dynamically ---
          const ratingEl = document.getElementById('googleRatingNumber');
          const starsEl = document.getElementById('googleRatingStars');
          const countEl = document.getElementById('googleReviewCount');

          if (ratingEl && place.rating !== undefined) {
            ratingEl.textContent = place.rating.toFixed(1);
          }

          if (starsEl && place.rating !== undefined) {
            let starsHtml = '';
            const fullStars = Math.floor(place.rating);
            const hasHalf = (place.rating - fullStars) >= 0.3;
            for (let i = 0; i < 5; i++) {
              if (i < fullStars) {
                starsHtml += '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">star</span>';
              } else if (i === fullStars && hasHalf) {
                starsHtml += '<span class="material-symbols-outlined" style="font-variation-settings: \'FILL\' 1;">star_half</span>';
              } else {
                starsHtml += '<span class="material-symbols-outlined">star_border</span>';
              }
            }
            starsEl.innerHTML = starsHtml;
          }

          if (countEl && place.user_ratings_total !== undefined) {
            countEl.textContent = `${place.user_ratings_total} Verified Google Reviews`;
          }

          // --- Populate review slides ---
          if (place.reviews && place.reviews.length > 0) {
            // Sort reviews: Newest (highest timestamp) first
            const sortedReviews = place.reviews.sort((a, b) => b.time - a.time);
            
            // Clear current pre-seeded slides
            track.innerHTML = '';
            
            sortedReviews.forEach(review => {
              const slide = document.createElement('div');
              slide.classList.add('carousel-slide');
              
              // Build stars html based on rating
              let reviewStarsHtml = '';
              for (let i = 0; i < 5; i++) {
                reviewStarsHtml += `<span class="material-symbols-outlined">${i < review.rating ? 'star' : 'star_border'}</span>`;
              }

              // Format review date
              const reviewDate = new Date(review.time * 1000);
              const dateStr = reviewDate.toLocaleDateString('en-CA');

              // Profile photo or initial avatar
              const initial = review.author_name ? review.author_name.charAt(0).toUpperCase() : '?';
              const profilePhoto = review.profile_photo_url 
                ? `<img src="${review.profile_photo_url}" alt="${review.author_name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">`
                : `<div style="width: 48px; height: 48px; border-radius: 50%; background-color: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700;">${initial}</div>`;

              // Review text or placeholder
              const reviewText = review.text 
                ? `"${review.text.length > 140 ? review.text.substring(0, 140) + '..."' : review.text + '"'}`
                : 'This customer did not write a review.';
              
              // Read full review link
              const readMoreHtml = review.text && review.text.length > 140 && review.author_url
                ? `<a href="${review.author_url}" target="_blank" style="color: var(--color-primary); font-size: 12px; text-decoration: none; font-weight: 600; display: block; margin-top: 6px;">Read full review ▸</a>`
                : '';

              // Verification link
              const verificationUrl = review.author_url || `https://www.google.com/maps/search/?api=1&query=JTR+Autoglass+Inc+Alliston+Ontario`;

              slide.innerHTML = `
                <div class="testimonial-card" style="text-align: center;">
                  ${profilePhoto}
                  <div class="stars" style="margin-top: 10px;">${reviewStarsHtml}</div>
                  <p class="testimonial-text" style="margin-top: 8px; font-size: 13px;">${reviewText}</p>
                  ${readMoreHtml}
                  <div class="testimonial-author" style="margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path fill="#4285F4" d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h-.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0c2.2 0 4.093.808 5.61 2.324l-2.514 2.514C10.093 3.824 9.176 3.4 8 3.4c-2.484 0-4.5 2.016-4.5 4.5S5.516 12.4 8 12.4c2.887 0 4.598-1.921 4.598-4.7 0-.311-.023-.622-.068-.92h-4.53V6.558h7.545z"/></svg>
                    <span style="font-weight: 700; font-size: 13px;">${review.author_name}</span>
                    <span style="font-size: 11px; color: var(--color-slate-gray);"> - ${dateStr}</span>
                  </div>
                </div>
              `;
              track.appendChild(slide);
            });

            initCarouselControls();
          } else {
            console.warn('Google Places details returned no reviews, falling back to local list.');
            showFallbackRating();
            initCarouselControls();
          }
        } else {
          console.warn('Google Places API error:', status);
          showFallbackRating();
          initCarouselControls();
        }
      });
    } catch (e) {
      console.error('Error fetching reviews from Google Places API:', e);
      showFallbackRating();
      initCarouselControls();
    }
  }

  function showFallbackRating() {
    const ratingEl = document.getElementById('googleRatingNumber');
    const starsEl = document.getElementById('googleRatingStars');
    const countEl = document.getElementById('googleReviewCount');
    
    if (ratingEl) ratingEl.textContent = '5.0';
    if (starsEl) {
      starsEl.innerHTML = `
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
      `;
    }
    if (countEl) countEl.textContent = '148 Verified Google Reviews';
  }
}

/**
 * Bottom contact form toggle & submission redirection setup
 */
function initFloatingContact() {
  const contactBtn = document.querySelector('.floating-contact-btn');
  const contactPanel = document.querySelector('.floating-contact-panel');
  const closeBtn = document.querySelector('.close-panel-btn');
  const actionTriggers = document.querySelectorAll('[data-action="contact-jtr"]');

  // Open overlay triggers
  const openPanel = (e) => {
    if (e) e.stopPropagation();
    if (contactPanel) contactPanel.classList.add('open');
  };

  if (contactBtn) contactBtn.addEventListener('click', openPanel);
  actionTriggers.forEach(btn => btn.addEventListener('click', openPanel));

  // Close triggers
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (contactPanel) contactPanel.classList.remove('open');
    });
  }

  // Dismiss on clicking outside panel bounds
  document.addEventListener('click', (e) => {
    if (contactPanel && contactPanel.classList.contains('open')) {
      if (!contactPanel.contains(e.target) && (!contactBtn || !contactBtn.contains(e.target))) {
        contactPanel.classList.remove('open');
      }
    }
  });

  // Automatically parse FormSubmit target configuration parameters
  const contactForms = document.querySelectorAll('form[action*="formsubmit.co"]');
  contactForms.forEach(form => {
    const nextField = form.querySelector('input[name="_next"]');
    if (nextField) {
      const currentHost = window.location.href.split('/').slice(0, -1).join('/');
      nextField.value = `${currentHost}/thank-you.html`;
    }

    form.addEventListener('submit', () => {
      alert("📧 Inquiry Sent! Your auto glass request has been submitted to JTR Autoglass Inc. We will contact you shortly.");
      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput) {
        localStorage.setItem('lastSubmissionName', nameInput.value);
      }
    });
  });
}
