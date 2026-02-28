// Mobile Navigation Toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    });
});

// Smooth scroll with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar style change on scroll
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    } else {
        nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.exp-card, .pcard, .blog-card, .achievement-card, .video-card, .featured-video').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// ── YouTube Live Stats (cached 24 h in localStorage) ───────────────────────
// Paste your YouTube Data API v3 key below (restrict it to pratikphadte.github.io)
const YT_API_KEY    = '';                        // <-- add your key here
const YT_CHANNEL_ID = 'UCnBW5MXKhvQDfcmhcx0RqOQ';

async function fetchYouTubeStats() {
    if (!YT_API_KEY) return;
    const CACHE_KEY = 'yt_stats';
    const TTL = 24 * 60 * 60 * 1000;
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < TTL) { applyYouTubeStats(data); return; }
    }
    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${YT_CHANNEL_ID}&key=${YT_API_KEY}`
        );
        if (!res.ok) return;
        const json = await res.json();
        const stats = json.items?.[0]?.statistics;
        if (!stats) return;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: stats, ts: Date.now() }));
        applyYouTubeStats(stats);
    } catch (_) { /* keep static fallback on error */ }
}

function applyYouTubeStats(stats) {
    const subsEl  = document.getElementById('yt-subs');
    const viewsEl = document.getElementById('yt-views');
    if (subsEl && stats.subscriberCount) {
        const n = parseInt(stats.subscriberCount);
        subsEl.textContent = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(n);
    }
    if (viewsEl && stats.viewCount) {
        const n = parseInt(stats.viewCount);
        viewsEl.textContent = n >= 1_000_000
            ? Math.floor(n / 1_000_000) + 'M+'
            : Math.floor(n / 1000) + 'K+';
    }
}

fetchYouTubeStats();

// Fetch live GitHub star counts (cached 1 h in localStorage)
async function fetchGitHubStars() {
    const TTL = 60 * 60 * 1000; // 1 hour
    const elements = document.querySelectorAll('.gh-stars[data-repo]');
    for (const el of elements) {
        const repo = el.getAttribute('data-repo');
        const cacheKey = `gh_stars_${repo}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { stars, ts } = JSON.parse(cached);
            if (Date.now() - ts < TTL) {
                el.textContent = stars;
                continue;
            }
        }
        try {
            const res = await fetch(`https://api.github.com/repos/${repo}`);
            if (res.ok) {
                const data = await res.json();
                const stars = data.stargazers_count.toLocaleString();
                el.textContent = stars;
                localStorage.setItem(cacheKey, JSON.stringify({ stars, ts: Date.now() }));
            }
        } catch (_) {
            // keep the dash on failure
        }
    }
}
fetchGitHubStars();

// Active nav link highlighting
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.style.color = '#0a0a0a';
            } else {
                navLink.style.color = '';
            }
        }
    });
});
