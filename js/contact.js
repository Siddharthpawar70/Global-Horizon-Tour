// Contact Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Contact Form Interaction (if form exists)
    // Currently contact.html only has static info, but we can add a simple response simulation

    const contactLinks = document.querySelectorAll('.contact p strong');
    contactLinks.forEach(link => {
        link.parentElement.addEventListener('mouseenter', () => {
            link.style.color = '#f39c12';
        });
        link.parentElement.addEventListener('mouseleave', () => {
            link.style.color = 'inherit';
        });
    });

    // 2. Click to copy functionality for phone/email
    const contactInfo = document.querySelectorAll('.contact-info p');
    contactInfo.forEach(p => {
        p.style.cursor = 'pointer';
        p.title = 'Click to copy';
        p.addEventListener('click', () => {
            const text = p.innerText.split(':')[1]?.trim() || p.innerText;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = p.innerHTML;
                p.innerHTML = `<strong>Coppied!</strong> ${text}`;
                setTimeout(() => { p.innerHTML = originalText; }, 2000);
            });
        });
    });

    // 3. Feedback Form Logic
    const feedbackForm = document.getElementById('mainFeedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Thank you for your feedback! We appreciate your time.');
            this.reset();
            resetStars();
        });
    }

    // 4. Star Rating Logic
    const stars = document.querySelectorAll('.star-rating i');
    const ratingInput = document.getElementById('fb-rating');

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const rating = star.getAttribute('data-rating');
            highlightStars(rating);
        });

        star.addEventListener('mouseout', () => {
            highlightStars(ratingInput.value);
        });

        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            ratingInput.value = rating;
            highlightStars(rating);
        });
    });

    function highlightStars(rating) {
        stars.forEach(star => {
            if (star.getAttribute('data-rating') <= rating) {
                star.style.color = '#f39c12';
            } else {
                star.style.color = '#ddd';
            }
        });
    }

    function resetStars() {
        ratingInput.value = 5;
        highlightStars(5);
    }

    // Initialize stars
    if (ratingInput) highlightStars(ratingInput.value);
});
