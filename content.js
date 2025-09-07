// LinkedIn post logger - minimal code to log author name and post text
// Store logged post IDs to avoid duplicates
let loggedPostIds = new Set();
let hiringPosts = [];

function checkFalsePromoted(postText) {
    // Define keywords that might indicate a hidden promotional post
    const promotionalKeywords = [
        // Direct sales/promotion terms
        'sponsored', 'ad', 'advertisement', 'promotion', 'promo', 'deal', 'offer',
        'buy now', 'click here', 'limited time', 'exclusive offer', 'special deal',
        'discount', 'sale', 'free trial', 'sign up now', 'register now',
        
        // Business/service promotion
        'my company', 'our service', 'we help', 'we offer', 'we provide',
        'consulting', 'freelance', 'hire me', 'available for', 'looking for clients',
        'book me', 'my services', 'partnership opportunity', 'collaboration',
        
        // Lead generation tactics
        'free download', 'free resource', 'checklist', 'template', 'guide',
        'ebook', 'webinar', 'masterclass', 'workshop', 'course',
        
        // Event promotion
        'upcoming event', 'join us', 'register for', 'save the date',
        'tickets available', 'speaking at', 'hosting',
        
        // Social proof manipulation
        'clients love', 'testimonial', 'success story', 'case study',
        'results speak', 'proven method', 'guaranteed',
        
        // Urgency/scarcity tactics
        'hurry', 'don\'t miss', 'act fast', 'while supplies last',
        'ending soon', 'final days', 'last chance'
    ];
    
    const lowerText = postText.toLowerCase();
    // Check for direct keyword matches in words and phrases
    for (const keyword of promotionalKeywords) {
        const regex = new RegExp(`\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(postText)) {
            return keyword;
        }
    }
    return null;
}

function addWarning(postId, hasPromotionalKeywords) {
    const postElement = document.querySelector(`[data-urn="${postId}"]`);
    if (postElement && !postElement.querySelector('.linkedout-warning')) {
        const warningBanner = document.createElement('div');
        warningBanner.className = 'linkedout-warning';
        warningBanner.style.backgroundColor = '#ffcccc';
        warningBanner.style.padding = '10px';
        warningBanner.style.marginBottom = '10px';
        warningBanner.style.border = '1px solid red';
        warningBanner.textContent = 'Warning: This post may contain hidden promotional content. Detected keyword: "' + hasPromotionalKeywords + '"';
        postElement.prepend(warningBanner);
    }
}

function checkIfHiring(postText) {
    // Define keywords that indicate hiring intent
    const hiringKeywords = [
        'hiring', 'we are hiring', 'join our team', 'job opening', 'career opportunity',
        'looking for', 'now hiring', 'apply now', 'job alert', 'vacancy',
        'position available', 'recruiting', 'talent acquisition', 'work with us',
        'employment opportunity', 'job opportunity', 'internship available',
        'full-time position', 'part-time position'
    ];
    
    const lowerText = postText.toLowerCase();
    // Check for direct keyword matches in words and phrases
    for (const keyword of hiringKeywords) {
        const regex = new RegExp(`\\b${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(postText)) {
            return true;
        }
    }
    return false;
}

function addHiringBanner(postId) {
    const postElement = document.querySelector(`[data-urn="${postId}"]`);
    if (postElement && !postElement.querySelector('.linkedout-hiring')) {
        const hiringBanner = document.createElement('div');
        hiringBanner.className = 'linkedout-hiring';
        hiringBanner.style.backgroundColor = '#ccffcc';
        hiringBanner.style.padding = '10px';
        hiringBanner.style.marginBottom = '10px';
        hiringBanner.style.border = '1px solid green';
        hiringBanner.textContent = 'This post indicates a hiring opportunity!';
        postElement.prepend(hiringBanner);
    }
}

function logLinkedInPosts() {
  const posts = document.querySelectorAll('[data-urn*="urn:li:activity:"]');
  
  posts.forEach(post => {
    const postId = post.getAttribute('data-urn') || 'Unknown ID';
    
    if (loggedPostIds.has(postId)) {
      return;
    }
    
    loggedPostIds.add(postId);

    // Get author name
    const authorElement = post.querySelector('.update-components-actor__single-line-truncate .visually-hidden');
    const authorName = authorElement ? authorElement.textContent.trim() : 'Unknown Author';

    // Get post text
    const postTextElement = post.querySelector('.feed-shared-text span[dir="ltr"]') ||
                           post.querySelector('.update-components-text span[dir="ltr"]') ||
                           post.querySelector('.feed-shared-text') ||
                           post.querySelector('.update-components-text');
    const postText = postTextElement ? postTextElement.textContent.trim() : 'No text content';
    
    // Check if the post is promoted
    const actorDescpElement = post.querySelector('.update-components-actor__sub-description');
    const actorDescp = actorDescpElement ? actorDescpElement.textContent.trim() : '';
    const isPromoted = actorDescp.toLowerCase().includes('promoted');
    const hasPromotionalKeywords = checkFalsePromoted(postText);
    
    // Check if the post indicates hiring intent
    const isHiring = checkIfHiring(postText);

    if (isPromoted) {
        console.log(`Hiding promoted post by ${authorName}`);
        post.style.display = 'none';
    } else if (hasPromotionalKeywords) {
        addWarning(postId, hasPromotionalKeywords);
    } else if(isHiring) {
        addHiringBanner(postId);
        const newPost = { id: postId, author: authorName, text: postText };
        console.log('Hiring post detected:', newPost);
        hiringPosts.push(newPost);
    }
  });
}

document.addEventListener('DOMContentLoaded', logLinkedInPosts);

const observer = new MutationObserver(() => {
  logLinkedInPosts();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

logLinkedInPosts();