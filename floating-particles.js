document.addEventListener('DOMContentLoaded', () => {
    const bubbles = document.querySelectorAll('.floating-bubble');
    const allBubblesArray = [];

    // CONFIG MATRIX: Radius & Mass configurations
    const sizeProfiles = [
        { class: 'size-lg', radius: 100, mass: 0.8 }, // Large (Lightweight)
        { class: 'size-md', radius: 75,  mass: 1.5 }, // Medium (Balanced)
        { class: 'size-sm', radius: 50,  mass: 3.0 }  // Small (Heavy/Dense)
    ];

    // --- INITIALIZATION ---
    bubbles.forEach((bubble, index) => {
        const boundary = bubble.closest('.chip-boundary');
        
        const profile = sizeProfiles[index % sizeProfiles.length];
        bubble.classList.add(profile.class);
        
        const radius = profile.radius;
        const mass = profile.mass;

        let posX = Math.random() * (window.innerWidth - radius * 2 - 60) + 30;
        let posY = Math.random() * (window.innerHeight - radius * 2 - 60) + 30;
        
        let velX = parseFloat(bubble.dataset.speedX) || 1;
        let velY = parseFloat(bubble.dataset.speedY) || 1;
        
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        bubble.style.left = `${posX}px`;
        bubble.style.top = `${posY}px`;

        const bubbleObject = {
            el: bubble,
            boundary: boundary,
            radius: radius,
            mass: mass,
            hitRipples: new Set(), // Trackers for ripples
            get posX() { return posX; },
            set posX(v) { posX = v; bubble.style.left = `${v}px`; },
            get posY() { return posY; },
            set posY(v) { posY = v; bubble.style.top = `${v}px`; },
            get velX() { return velX; },
            set velX(v) { velX = v; },
            get velY() { return velY; },
            set velY(v) { velY = v; },
            get isDragging() { return isDragging; },
            set isDragging(v) { isDragging = v; }
        };

        // --- DRAG INTERFACES ---
        bubble.addEventListener('mousedown', (e) => {
            isDragging = true;
            bubble.style.cursor = 'grabbing';
            
            const bounds = boundary.getBoundingClientRect();
            const mousePageX = e.clientX;
            const mousePageY = e.clientY + window.scrollY - bounds.top;
            
            dragOffsetX = mousePageX - posX;
            dragOffsetY = mousePageY - posY;
            
            e.stopPropagation();
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const bounds = boundary.getBoundingClientRect();
            let targetX = e.clientX - dragOffsetX;
            let targetY = (e.clientY + window.scrollY) - bounds.top - dragOffsetY;

            posX = Math.max(0, Math.min(targetX, bounds.width - radius * 2));
            posY = Math.max(0, Math.min(targetY, bounds.height - radius * 2));

            bubble.style.left = `${posX}px`;
            bubble.style.top = `${posY}px`;
            
            velX = (e.movementX || 0) * 0.25;
            velY = (e.movementY || 0) * 0.25;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                bubble.style.cursor = 'grab';
                if (Math.abs(velX) < 0.3) velX = (Math.random() > 0.5 ? 1 : -1) * 1.2;
                if (Math.abs(velY) < 0.3) velY = (Math.random() > 0.5 ? 1 : -1) * 1.2;
            }
        });

        allBubblesArray.push(bubbleObject);
    });

    // --- CIRCLE-TO-CIRCLE COLLISION SOLVER ---
    function resolveCollisions() {
        for (let i = 0; i < allBubblesArray.length; i++) {
            for (let j = i + 1; j < allBubblesArray.length; j++) {
                const b1 = allBubblesArray[i];
                const b2 = allBubblesArray[j];

                if (b1.boundary !== b2.boundary) continue;

                const c1x = b1.posX + b1.radius;
                const c1y = b1.posY + b1.radius;
                const c2x = b2.posX + b2.radius;
                const c2y = b2.posY + b2.radius;

                const dx = c2x - c1x;
                const dy = c2y - c1y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDist = b1.radius + b2.radius;

                if (distance < minDist) {
                    const overlap = minDist - distance;
                    const nx = dx / (distance || 1);
                    const ny = dy / (distance || 1);

                    const totalMass = b1.mass + b2.mass;
                    
                    if (!b1.isDragging) {
                        b1.posX -= nx * overlap * (b2.mass / totalMass);
                        b1.posY -= ny * overlap * (b2.mass / totalMass);
                    }
                    if (!b2.isDragging) {
                        b2.posX += nx * overlap * (b1.mass / totalMass);
                        b2.posY += ny * overlap * (b1.mass / totalMass);
                    }

                    const kx = b1.velX - b2.velX;
                    const ky = b1.velY - b2.velY;
                    const p = 2 * (nx * kx + ny * ky) / totalMass;

                    if (!b1.isDragging) {
                        b1.velX -= p * b2.mass * nx;
                        b1.velY -= p * b2.mass * ny;
                    }
                    if (!b2.isDragging) {
                        b2.velX += p * b1.mass * nx;
                        b2.velY += p * b1.mass * ny;
                    }
                }
            }
        }
    }

    // --- GLOBAL TICK EXECUTION LOOP ---
    function masterPhysicsLoop() {
        allBubblesArray.forEach(b => {
            if (!b.isDragging) {
                const bounds = b.boundary.getBoundingClientRect();
                const diameter = b.radius * 2;

                // 🌊 POLISHED: LOW-FORCE ORGANIC RIPPLE IMPULSE SYSTEM
                if (window.ripplesArray && window.ripplesArray.length > 0) {
                    const globalBubbleX = b.posX + b.radius;
                    const globalBubbleY = bounds.top + window.scrollY + b.posY + b.radius;

                    window.ripplesArray.forEach(ripple => {
                        const dx = globalBubbleX - ripple.x;
                        const dy = globalBubbleY - ripple.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        const rippleId = `${ripple.x}_${ripple.y}_${ripple.maxRadius}`;

                        // Trigger when wavefront rolls through the bubble zone
                        if (distance <= ripple.radius + b.radius) {
                            if (!b.hitRipples.has(rippleId)) {
                                b.hitRipples.add(rippleId); 

                                const angle = Math.atan2(dy, dx);
                                
                                // ✨ FIX: Substantially reduced raw forces for a velvet-smooth response
                                const rawForce = ripple.isModeWave ? 4.5 : 1.5; 
                                const massImpulse = rawForce / b.mass;

                                b.velX += Math.cos(angle) * massImpulse;
                                b.velY += Math.sin(angle) * massImpulse;
                            }
                        }
                    });
                }

                // Clean up expired ripple references
                if (window.ripplesArray.length === 0 && b.hitRipples.size > 0) {
                    b.hitRipples.clear();
                }

                // Drag friction
                b.velX *= 0.98;
                b.velY *= 0.98;

                // ✨ FIX: Reduced the maximum speed limit so things never go chaotic
                const speedCap = 8; 
                b.velX = Math.max(-speedCap, Math.min(b.velX, speedCap));
                b.velY = Math.max(-speedCap, Math.min(b.velY, speedCap));

                b.posX += b.velX;
                b.posY += b.velY;

                if (b.posX <= 0) { b.posX = 0; b.velX = Math.abs(b.velX); }
                else if (b.posX >= bounds.width - diameter) { b.posX = bounds.width - diameter; b.velX = -Math.abs(b.velX); }

                if (b.posY <= 0) { b.posY = 0; b.velY = Math.abs(b.velY); }
                else if (b.posY >= bounds.height - diameter) { b.posY = bounds.height - diameter; b.velY = -Math.abs(b.velY); }
            }
        });

        resolveCollisions();
        requestAnimationFrame(masterPhysicsLoop);
    }

    requestAnimationFrame(masterPhysicsLoop);
});