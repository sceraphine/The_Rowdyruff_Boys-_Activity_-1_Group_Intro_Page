document.addEventListener('DOMContentLoaded', () => {
    const chips = document.querySelectorAll('.floating-chip');

    chips.forEach(chip => {
        const boundary = chip.closest('.chip-boundary');
        
        // Randomly place chip coordinates initially within its section bounds
        let posX = Math.random() * (window.innerWidth - 100) + 20;
        let posY = Math.random() * (window.innerHeight - 100) + 20;
        
        // Get primary velocity speeds set via data-attributes
        let velX = parseFloat(chip.dataset.speedX) || 2;
        let velY = parseFloat(chip.dataset.speedY) || 2;
        
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        // Apply random initial position
        chip.style.left = `${posX}px`;
        chip.style.top = `${posY}px`;

        // --- MOUSE/TOUCH DRAG HANDLERS ---
        chip.addEventListener('mousedown', (e) => {
            isDragging = true;
            chip.style.cursor = 'grabbing';
            // Capture offsets relative to chip box boundaries
            dragOffsetX = e.clientX - chip.offsetLeft;
            dragOffsetY = e.clientY - chip.offsetTop;
            e.stopPropagation();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const bounds = boundary.getBoundingClientRect();
            
            // Map cursor movement relative to the page section container frame
            let targetX = e.clientX - dragOffsetX;
            let targetY = (e.clientY + window.scrollY) - bounds.top - dragOffsetY;

            // Restrict dragging outside page edges
            posX = Math.max(0, Math.min(targetX, bounds.width - chip.offsetWidth));
            posY = Math.max(0, Math.min(targetY, bounds.height - chip.offsetHeight));

            chip.style.left = `${posX}px`;
            chip.style.top = `${posY}px`;
            
            // Recalculate subtle momentum on release
            velX = (e.movementX || 0) * 0.3;
            velY = (e.movementY || 0) * 0.3;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                chip.style.cursor = 'grab';
                // Enforce minimum residual velocity baseline so it doesn't stay dead completely
                if (Math.abs(velX) < 0.5) velX = (Math.random() > 0.5 ? 1 : -1) * 1.5;
                if (Math.abs(velY) < 0.5) velY = (Math.random() > 0.5 ? 1 : -1) * 1.5;
            }
        });

        // --- REAL-TIME ENGINE LOOP ROUTINE ---
        function updatePhysics() {
            if (!isDragging) {
                const bounds = boundary.getBoundingClientRect();
                const chipWidth = chip.offsetWidth;
                const chipHeight = chip.offsetHeight;

                // 🌌 CANVAS RIPPLE INTERACTION CHECK
                // Pull active ripple waves moving through the central script.js framework array
                if (window.ripplesArray && window.ripplesArray.length > 0) {
                    // Absolute document vertical position of the chip node center
                    const globalChipX = posX + (chipWidth / 2);
                    const globalChipY = bounds.top + window.scrollY + posY + (chipHeight / 2);

                    window.ripplesArray.forEach(ripple => {
                        const dx = globalChipX - ripple.x;
                        const dy = globalChipY - ripple.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // If ripple edge hits the chip boundary node position
                        if (Math.abs(distance - ripple.radius) < 30) {
                            const angle = Math.atan2(dy, dx);
                            const shockIntensity = ripple.isModeWave ? 12 : 6; // Mode switches hit harder!
                            
                            // Accelerate chip outward matching blast propagation wave angle
                            velX += Math.cos(angle) * shockIntensity;
                            velY += Math.sin(angle) * shockIntensity;
                        }
                    });
                }

                // Apply deceleration damping friction over time so it returns to steady state velocity
                velX *= 0.98;
                velY *= 0.98;

                // Clamp extreme acceleration forces to prevent clipping out of bounds
                const speedCap = 18;
                velX = Math.max(-speedCap, Math.min(velX, speedCap));
                velY = Math.max(-speedCap, Math.min(velY, speedCap));

                // Apply velocities to coordinates
                posX += velX;
                posY += velY;

                // 🛑 SECTION BOUNDARY REFLECTION MECHANICAL CHECKS (Bounces off Page Edges)
                if (posX <= 0) {
                    posX = 0;
                    velX = Math.abs(velX) * 0.85; // Reverse and slightly damp momentum
                } else if (posX >= bounds.width - chipWidth) {
                    posX = bounds.width - chipWidth;
                    velX = -Math.abs(velX) * 0.85;
                }

                if (posY <= 0) {
                    posY = 0;
                    velY = Math.abs(velY) * 0.85;
                } else if (posY >= bounds.height - chipHeight) {
                    posY = bounds.height - chipHeight;
                    velY = -Math.abs(velY) * 0.85;
                }

                // Render styles onto element layout coordinate matrix positions
                chip.style.left = `${posX}px`;
                chip.style.top = `${posY}px`;
            }

            requestAnimationFrame(updatePhysics);
        }

        // Initialize engine ticks for this node asset element
        requestAnimationFrame(updatePhysics);
    });
});