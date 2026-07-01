const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const mouse = { x: null, y: null, radius: 120 };
let ripplesArray = [];
window.ripplesArray = ripplesArray;

let particlesArray = [];
const gap = 30; 
const dotSize = 2; 

let currentTheme = 'default';
let currentMode = 'dark'; 

const themeColors = {
    dark: {
        default: { r: 100, g: 255, b: 218 }, // #64ffda
        brick:   { r: 255, g: 77,  b: 77 },  // #ff4d4d
        boomer:  { r: 82,  g: 148, b: 255 }, // #5294ff
        butch:   { r: 57,  g: 211, b: 83 }   // #39d353
    },
    light: {
        default: { r: 0,   g: 130, b: 114 }, // #008272
        brick:   { r: 189, g: 36,  b: 35 },  // #bd2423
        boomer:  { r: 58,  g: 100, b: 164 }, // #3a64a4
        butch:   { r: 39,  g: 124, b: 71 }   // #277c47
    }
};

const modeColors = {
    dark:  { r: 22,  g: 22,  b: 29 },  // #16161d
    light: { r: 250, g: 249, b: 246 }  // #faf9f6
};

function init() {
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight; 
    particlesArray = [];

    const vGap = gap * Math.sqrt(3) / 2; 
    let rowCount = 0;

    for (let y = gap / 2; y < canvas.height + gap; y += vGap) {
        const xOffset = (rowCount % 2 === 0) ? 0 : gap / 2;
        for (let x = (gap / 2) - gap; x < canvas.width + gap; x += gap) {
            particlesArray.push(new Particle(x + xOffset, y));
        }
        rowCount++;
    }
}

window.addEventListener('resize', init);
window.addEventListener('mousemove', (event) => { 
    mouse.x = event.clientX; 
    mouse.y = event.pageY;
});
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (mouse.y !== null) {
        const deltaY = window.scrollY - lastScrollY;
        mouse.y += deltaY; 
    lastScrollY = window.scrollY;
    }
});

window.addEventListener('click', (event) => {
    if (event.target.closest('.theme-panel') || event.target.closest('.card') || event.target.closest('.card-btn')) return;

    ripplesArray.push({
        x: event.clientX, 
        y: event.pageY, 
        radius: 0,
        maxRadius: Math.max(canvas.width, canvas.height) * 1.5, 
        speed: 15, thickness: 40, isModeWave: false
    });
});

class Particle {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.homeX = x; this.homeY = y;
        this.size = dotSize; 
        this.opacity = 0.05; 
        this.vx = 0; this.vy = 0; 
        this.ease = 0.06; 
        this.myMode = 'dark'; 
    }

        draw() {
            if (this.opacity > 0.01) {
            const rgb = themeColors[this.myMode][currentTheme];
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            
            if (this.myMode === 'light') {
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity * 0.85})`;
            } else {
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity})`;
            }
            ctx.fill();
        }
    }

    update() {
        let isInfluenced = false;

        for (let i = 0; i < ripplesArray.length; i++) {
            let ripple = ripplesArray[i];
            let rx = ripple.x - this.x; let ry = ripple.y - this.y;
            let rDistance = Math.sqrt(rx * rx + ry * ry);

            if (ripple.isModeWave && rDistance < ripple.radius) {
                this.myMode = ripple.targetMode;
            }

            if (rDistance > ripple.radius - ripple.thickness && rDistance < ripple.radius) {
                isInfluenced = true;
                this.opacity = 1.0; 
                
                if (ripple.isModeWave) {
                    this.myMode = ripple.targetMode;
                }

                let force = (ripple.thickness - (ripple.radius - rDistance)) / ripple.thickness;
                this.vx -= (rx / rDistance) * force * 5; 
                this.vy -= (ry / rDistance) * force * 5;
                break; 
            }
        }

        if (!isInfluenced && mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x; let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                isInfluenced = true;
                this.opacity = 0.05 + (1 - 0.05) * ((mouse.radius - distance) / mouse.radius);
                let force = (mouse.radius - distance) / mouse.radius;
                this.vx += (dx / distance) * force * 0.8;
                this.vy += (dy / distance) * force * 0.8;
            }
        }

        if (!isInfluenced) {
            this.opacity += (0.05 - this.opacity) * 0.1; 
        }

        this.vx *= 0.88; this.vy *= 0.88;
        this.x += this.vx; this.y += this.vy;
        this.x += (this.homeX - this.x) * this.ease;
        this.y += (this.homeY - this.y) * this.ease;
    }
}

const modeToggleBtn = document.getElementById('mode-toggle');
let isToggling = false; 

modeToggleBtn.addEventListener('click', (e) => {
    if (isToggling) return; 
    
    isToggling = true; 

    const oldMode = currentMode;
    currentMode = currentMode === 'dark' ? 'light' : 'dark';
    
    modeToggleBtn.textContent = currentMode === 'dark' ? '🌙' : '☀️';
    document.body.setAttribute('data-mode', currentMode);

    const rect = e.target.getBoundingClientRect();

    ripplesArray.push({
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2) + window.scrollY, 
        radius: 0,
        maxRadius: Math.max(canvas.width, canvas.height) * 1.5, 
        speed: 28,         
        thickness: 40, 
        isModeWave: true,
        targetMode: currentMode, 
        oldMode: oldMode
    });

    setTimeout(() => {
        isToggling = false;
    }, 800); 
});

const scrollSections = document.querySelectorAll('.scroll-page');
const observerOptions = {
    root: null,
    threshold: 0.6
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const targetedTheme = entry.target.getAttribute('data-scroll-theme');
            
            if (targetedTheme !== currentTheme) {
                currentTheme = targetedTheme;
                document.body.setAttribute('data-theme', currentTheme);
            }
        }
    });
}, observerOptions);

scrollSections.forEach(section => sectionObserver.observe(section));

init();

function animate() {
    const activeModeWave = ripplesArray.find(r => r.isModeWave);

    if (activeModeWave) {
        const oldRGB = modeColors[activeModeWave.oldMode];
        const newRGB = modeColors[activeModeWave.targetMode];

        ctx.fillStyle = `rgb(${oldRGB.r}, ${oldRGB.g}, ${oldRGB.b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = `rgb(${newRGB.r}, ${newRGB.g}, ${newRGB.b})`;
        ctx.beginPath();
        ctx.arc(activeModeWave.x, activeModeWave.y, activeModeWave.radius, 0, Math.PI * 2);
        ctx.fill();

    } else {
        const bg = modeColors[currentMode];
        ctx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    for (let i = ripplesArray.length - 1; i >= 0; i--) {
        ripplesArray[i].radius += ripplesArray[i].speed;
        if (ripplesArray[i].radius > ripplesArray[i].maxRadius) {
            ripplesArray.splice(i, 1);
        }
    }

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
}

document.querySelectorAll('.card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('href');
        
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const jumpGalleryBtn = document.querySelector('.jump-gallery-btn');
    if (jumpGalleryBtn) {
        jumpGalleryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const gallerySection = document.querySelector('#gallery-target');
            if (gallerySection) {
                gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    const topScrollBtn = document.querySelector('.back-to-top-btn');
    if (topScrollBtn) {
        topScrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const introSection = document.querySelector('main.content-container > section:first-of-type');
            if (introSection) {
                introSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});

animate();