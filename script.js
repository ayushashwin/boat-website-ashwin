const canvas = document.getElementById('animation-canvas');
const context = canvas.getContext('2d');

const frameCount = 220; // Reduced from 240 to hide text at the end
const currentFrame = index => (
    `ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

const images = [];

const setCanvasSize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
};

// Set canvas dimensions
setCanvasSize();

// Update canvas dimensions on resize
window.addEventListener('resize', () => {
    setCanvasSize();
    drawFrame(lastDrawnIndex);
});

const preloadImages = () => {
    for (let i = 1; i <= frameCount; i++) {
        images[i] = new Image();
        images[i].src = currentFrame(i);
    }
};

let lastDrawnIndex = 1;
let targetFrame = 1;
let currentFrameFloat = 1;

const drawFrame = (index) => {
    const img = images[index];
    if (!img) return;

    const render = () => {
        // Calculate scale to cover canvas (like object-fit: cover)
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
        lastDrawnIndex = index;
    };

    if(img.complete && img.naturalWidth !== 0) {
        render();
    } else {
        img.onload = render;
    }
};

preloadImages();

// Draw the first frame when it loads
if (images[1].complete) {
    drawFrame(1);
} else {
    images[1].onload = () => drawFrame(1);
}

let scrollTimeout;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {  
    const scrollTop = document.documentElement.scrollTop;
    const scrollContainer = document.querySelector('.scroll-container');
    const maxScrollTop = scrollContainer.offsetHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScrollTop;
    
    // Set target frame based on scroll position
    targetFrame = Math.min(frameCount, Math.max(1, Math.floor(scrollFraction * frameCount)));
    
    // Dynamic Navbar Transparency on active scroll
    if (navbar) {
        navbar.classList.remove('bg-black/40', 'backdrop-blur-md', 'border-white/5');
        navbar.classList.add('bg-transparent', 'border-transparent');
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            navbar.classList.remove('bg-transparent', 'border-transparent');
            navbar.classList.add('bg-black/40', 'backdrop-blur-md', 'border-white/5');
        }, 200);
    }
});

// Render loop for smooth LERP animation
const renderLoop = () => {
    // Linear Interpolation: move current frame towards target frame by 10% each tick
    currentFrameFloat += (targetFrame - currentFrameFloat) * 0.1;
    const frameToDraw = Math.round(currentFrameFloat);
    
    if (frameToDraw !== lastDrawnIndex) {
        drawFrame(frameToDraw);
    }
    
    requestAnimationFrame(renderLoop);
};

// Start the loop
renderLoop();
