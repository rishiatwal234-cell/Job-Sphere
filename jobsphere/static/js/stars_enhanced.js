// Enhanced Space theme animations for dark mode with planets, stars, and celestial effects
class StarField {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.planets = [];
        this.nebulae = [];
        this.comets = [];
        this.moon = null;
        this.shootingStarInterval = null;
        this.animationId = null;
        this.shootingStars = [];
        this.time = 0;

        this.init();
    }

    init() {
        this.createCanvas();
        this.createStars();
        this.createPlanets();
        this.createNebulae();
        this.createMoon();
        this.animate();
        this.startShootingStars();
        this.startComets();

        window.addEventListener('resize', () => this.resize());
    }

    createCanvas() {
        let canvas = document.getElementById('stars-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'stars-canvas';
            canvas.className = 'stars-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.zIndex = '-1';
            canvas.style.pointerEvents = 'none';
            document.body.insertBefore(canvas, document.body.firstChild);
        }

        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        this.stars = [];
        const starCount = 300;

        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                brightness: Math.random(),
                color: this.getStarColor(),
                size: Math.random() * 1.5 + 0.5
            });
        }
    }

    getStarColor() {
        const colors = [
            '#FFFFFF', // White
            '#FFE4B5', // Moccasin (warm white)
            '#E6E6FA', // Lavender (cool white)
            '#F0F8FF', // Alice blue
            '#FFFACD', // Lemon chiffon (yellowish)
            '#FFEFD5', // Papaya whip
            '#F5F5DC', // Beige
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createPlanets() {
        this.planets = [];

        // Create 3-5 planets
        const planetCount = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < planetCount; i++) {
            const planet = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.2,
                radius: Math.random() * 40 + 20,
                color: this.getPlanetColor(),
                rings: Math.random() > 0.7, // 30% chance of rings
                moons: Math.floor(Math.random() * 3), // 0-2 moons
                orbitRadius: Math.random() * 100 + 50,
                orbitSpeed: (Math.random() - 0.5) * 0.01,
                orbitCenterX: Math.random() * this.canvas.width,
                orbitCenterY: Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.2,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                atmosphere: Math.random() > 0.5,
                craters: Math.floor(Math.random() * 8) + 3
            };

            // Create moons
            planet.moonData = [];
            for (let j = 0; j < planet.moons; j++) {
                planet.moonData.push({
                    distance: Math.random() * 80 + 40,
                    angle: Math.random() * Math.PI * 2,
                    speed: (Math.random() - 0.5) * 0.05,
                    size: Math.random() * 6 + 3,
                    color: '#C0C0C0'
                });
            }

            this.planets.push(planet);
        }
    }

    getPlanetColor() {
        const colors = [
            '#CD853F', // Sandy brown (Mars-like)
            '#4169E1', // Royal blue (Earth-like)
            '#FFD700', // Gold (Venus-like)
            '#FF6347', // Tomato (volcanic)
            '#9370DB', // Medium purple (gas giant)
            '#32CD32', // Lime green (alien)
            '#FF69B4', // Hot pink (exotic)
            '#8B4513', // Saddle brown (rocky)
            '#00CED1', // Dark turquoise (icy)
            '#DC143C', // Crimson (bloody)
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createNebulae() {
        this.nebulae = [];

        // Create 2-4 nebulae
        const nebulaCount = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < nebulaCount; i++) {
            const nebula = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: Math.random() * 300 + 200,
                height: Math.random() * 200 + 100,
                colors: this.getNebulaColors(),
                opacity: Math.random() * 0.3 + 0.1,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.01 + 0.005,
                driftX: (Math.random() - 0.5) * 0.2,
                driftY: (Math.random() - 0.5) * 0.2
            };

            this.nebulae.push(nebula);
        }
    }

    getNebulaColors() {
        const colorSchemes = [
            ['#FF6B6B', '#4ECDC4', '#45B7D1'], // Red, teal, blue
            ['#9B59B6', '#3498DB', '#E74C3C'], // Purple, blue, red
            ['#F39C12', '#E67E22', '#D35400'], // Orange variations
            ['#1ABC9C', '#16A085', '#27AE60'], // Green variations
            ['#9B59B6', '#8E44AD', '#6C3483'], // Purple variations
            ['#E91E63', '#F06292', '#AD1457'], // Pink variations
        ];

        return colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    }

    createMoon() {
        this.moon = {
            baseX: this.canvas.width - 120,
            x: this.canvas.width - 120,
            y: 80,
            radius: 60,
            craters: [],
            glow: true,
            phase: Math.random() * Math.PI * 2
        };

        // Create craters
        for (let i = 0; i < 8; i++) {
            this.moon.craters.push({
                x: (Math.random() - 0.5) * this.moon.radius * 1.5,
                y: (Math.random() - 0.5) * this.moon.radius * 1.5,
                radius: Math.random() * 8 + 3,
                depth: Math.random() * 0.7 + 0.3
            });
        }
    }

    drawStars() {
        this.stars.forEach((star) => {
            this.time += 0.01;
            star.twinklePhase += star.twinkleSpeed;
            star.brightness = Math.sin(star.twinklePhase) * 0.3 + 0.7;
            star.opacity = star.brightness * (Math.random() * 0.3 + 0.7);

            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.opacity;

            // Draw star with slight glow
            this.ctx.shadowColor = star.color;
            this.ctx.shadowBlur = star.size * 2;

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius * star.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Reset shadow
            this.ctx.shadowBlur = 0;
        });
    }

    drawPlanets() {
        this.planets.forEach(planet => {
            // Update orbit
            planet.rotation += planet.orbitSpeed;

            const orbitX = planet.orbitCenterX + Math.cos(planet.rotation) * planet.orbitRadius;
            const orbitY = planet.orbitCenterY + Math.sin(planet.rotation) * planet.orbitRadius;

            planet.x = orbitX;
            planet.y = orbitY;

            this.ctx.save();
            this.ctx.translate(planet.x, planet.y);

            // Planet shadow/glow
            if (planet.atmosphere) {
                const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, planet.radius * 1.3);
                gradient.addColorStop(0, planet.color + '40');
                gradient.addColorStop(1, 'transparent');

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, planet.radius * 1.3, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Main planet body
            this.ctx.fillStyle = planet.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Craters
            this.ctx.fillStyle = this.adjustColor(planet.color, -30);
            planet.craters.forEach(crater => {
                const distance = Math.sqrt(crater.x * crater.x + crater.y * crater.y);
                if (distance < planet.radius) {
                    this.ctx.beginPath();
                    this.ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });

            // Rings (if applicable)
            if (planet.rings) {
                this.ctx.strokeStyle = this.adjustColor(planet.color, -20);
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, planet.radius * 1.5, planet.radius * 0.3, 0, 0, Math.PI * 2);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, planet.radius * 1.8, planet.radius * 0.4, 0, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            // Moons
            planet.moonData.forEach(moon => {
                moon.angle += moon.speed;
                const moonX = Math.cos(moon.angle) * moon.distance;
                const moonY = Math.sin(moon.angle) * moon.distance;

                this.ctx.fillStyle = moon.color;
                this.ctx.beginPath();
                this.ctx.arc(moonX, moonY, moon.size, 0, Math.PI * 2);
                this.ctx.fill();
            });

            this.ctx.restore();
        });
    }

    drawNebulae() {
        this.nebulae.forEach(nebula => {
            nebula.pulse += nebula.pulseSpeed;
            nebula.x += nebula.driftX;
            nebula.y += nebula.driftY;

            // Wrap around screen
            if (nebula.x > this.canvas.width + nebula.width) nebula.x = -nebula.width;
            if (nebula.x < -nebula.width) nebula.x = this.canvas.width + nebula.width;
            if (nebula.y > this.canvas.height + nebula.height) nebula.y = -nebula.height;
            if (nebula.y < -nebula.height) nebula.y = this.canvas.height + nebula.height;

            const intensity = Math.sin(nebula.pulse) * 0.3 + 0.7;

            // Create nebula effect with multiple overlapping circles
            for (let i = 0; i < 8; i++) {
                const x = nebula.x + Math.random() * nebula.width;
                const y = nebula.y + Math.random() * nebula.height;
                const radius = Math.random() * 50 + 20;

                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, nebula.colors[i % nebula.colors.length] + Math.floor(nebula.opacity * intensity * 255).toString(16).padStart(2, '0'));
                gradient.addColorStop(1, 'transparent');

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawMoon() {
        const moon = this.moon;

        // Gentle drift and phase
        moon.phase += 0.002;
        const driftAmount = Math.sin(Date.now() / 25000) * 40;
        moon.x = moon.baseX + driftAmount;

        this.ctx.save();

        // Moon glow
        if (moon.glow) {
            const glowGradient = this.ctx.createRadialGradient(moon.x, moon.y, 0, moon.x, moon.y, moon.radius * 2);
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            glowGradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(moon.x, moon.y, moon.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Main moon circle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.beginPath();
        this.ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Lunar phase (crescent effect)
        const phaseOffset = Math.sin(moon.phase) * moon.radius * 0.3;
        this.ctx.fillStyle = 'rgba(8, 8, 24, 0.9)';
        this.ctx.beginPath();
        this.ctx.arc(moon.x + phaseOffset, moon.y + phaseOffset * 0.5, moon.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Craters
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        moon.craters.forEach(crater => {
            const distance = Math.sqrt(crater.x * crater.x + crater.y * crater.y);
            if (distance < moon.radius) {
                this.ctx.beginPath();
                this.ctx.arc(moon.x + crater.x, moon.y + crater.y, crater.radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        this.ctx.restore();
    }

    drawShootingStar(shootingStar) {
        if (!shootingStar.active) return;

        const now = Date.now();
        const elapsed = now - shootingStar.startTime;
        const progress = elapsed / shootingStar.duration;

        if (progress > 1) {
            shootingStar.active = false;
            return;
        }

        const x = shootingStar.startX + (shootingStar.endX - shootingStar.startX) * progress;
        const y = shootingStar.startY + (shootingStar.endY - shootingStar.startY) * progress;

        // Create gradient for shooting star trail
        const gradient = this.ctx.createLinearGradient(
            shootingStar.startX, shootingStar.startY,
            x, y
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.7, 'rgba(173, 216, 230, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(shootingStar.startX, shootingStar.startY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        // Sparkle particles along the trail
        for (let i = 0; i < 5; i++) {
            const particleProgress = progress - i * 0.1;
            if (particleProgress > 0 && particleProgress < 1) {
                const px = shootingStar.startX + (shootingStar.endX - shootingStar.startX) * particleProgress;
                const py = shootingStar.startY + (shootingStar.endY - shootingStar.startY) * particleProgress;

                this.ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - particleProgress) * 0.8 + ')';
                this.ctx.beginPath();
                this.ctx.arc(px, py, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    createShootingStar() {
        const startX = Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1;
        const startY = Math.random() * this.canvas.height * 0.5;

        return {
            startX: startX,
            startY: startY,
            endX: startX - 400,
            endY: startY + 400,
            duration: 1800,
            startTime: Date.now(),
            active: true
        };
    }

    startShootingStars() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this.shootingStars = [];
        this.shootingStarInterval = setInterval(() => {
            if (this.shootingStars.length < 4) {
                this.shootingStars.push(this.createShootingStar());
            }
        }, 6000);
    }

    startComets() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this.comets = [];
        setInterval(() => {
            if (this.comets.length < 2) {
                this.comets.push(this.createComet());
            }
        }, 15000);
    }

    createComet() {
        return {
            x: -50,
            y: Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.2,
            speedX: Math.random() * 3 + 2,
            speedY: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 4 + 2,
            tailLength: Math.random() * 50 + 30,
            opacity: Math.random() * 0.6 + 0.4,
            color: ['#FFFFFF', '#E6E6FA', '#F0F8FF'][Math.floor(Math.random() * 3)]
        };
    }

    drawComets() {
        this.comets.forEach((comet, index) => {
            comet.x += comet.speedX;
            comet.y += comet.speedY;

            // Remove if off screen
            if (comet.x > this.canvas.width + 100) {
                this.comets.splice(index, 1);
                return;
            }

            this.ctx.save();

            // Draw comet tail
            const tailGradient = this.ctx.createLinearGradient(
                comet.x, comet.y,
                comet.x - comet.tailLength, comet.y - comet.tailLength * 0.3
            );
            tailGradient.addColorStop(0, comet.color + Math.floor(comet.opacity * 255).toString(16).padStart(2, '0'));
            tailGradient.addColorStop(1, 'transparent');

            this.ctx.strokeStyle = tailGradient;
            this.ctx.lineWidth = comet.size * 2;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(comet.x, comet.y);
            this.ctx.lineTo(comet.x - comet.tailLength, comet.y - comet.tailLength * 0.3);
            this.ctx.stroke();

            // Draw comet head
            this.ctx.fillStyle = comet.color;
            this.ctx.globalAlpha = comet.opacity;
            this.ctx.beginPath();
            this.ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow effect
            this.ctx.shadowColor = comet.color;
            this.ctx.shadowBlur = comet.size * 3;
            this.ctx.beginPath();
            this.ctx.arc(comet.x, comet.y, comet.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    adjustColor(color, amount) {
        // Simple color adjustment function
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;

        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;

        return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16);
    }

    animate() {
        this.time += 0.016; // ~60fps

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw elements in order (background to foreground)
        this.drawNebulae();
        this.drawStars();
        this.drawPlanets();
        this.drawMoon();
        this.drawComets();

        if (this.shootingStars) {
            this.shootingStars.forEach(star => this.drawShootingStar(star));
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.shootingStarInterval) {
            clearInterval(this.shootingStarInterval);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StarField };
}