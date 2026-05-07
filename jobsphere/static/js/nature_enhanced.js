// Enhanced Nature theme animations for light mode with weather effects and music
class NatureTheme {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.seasons = ['spring', 'summer', 'autumn', 'winter'];
        this.currentSeason = 0;
        this.seasonStartTime = Date.now();
        this.seasonDuration = 28000; // 28 seconds total (7 seconds per season)
        this.seasonDisplayDuration = 7000; // 7 seconds per season
        this.animationId = null;
        this.lastSeason = -1;
        this.audioContext = null;
        this.currentAudio = null;
        this.audioBuffers = {};
        this.isPlaying = false;

        this.init();
    }

    init() {
        this.createCanvas();
        this.initAudio();
        this.startSeasonCycle();
    }

    createCanvas() {
        let canvas = document.getElementById('nature-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'nature-canvas';
            canvas.className = 'nature-canvas';
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

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Create ambient nature sounds programmatically
            this.createAmbientSounds();
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }

    createAmbientSounds() {
        // Create simple ambient sounds using oscillators
        this.seasonSounds = {
            spring: () => this.createSpringSound(),
            summer: () => this.createSummerSound(),
            autumn: () => this.createAutumnSound(),
            winter: () => this.createWinterSound()
        };
    }

    createSpringSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 6);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 6);

        this.currentAudio = { oscillator, gainNode };
    }

    createSummerSound() {
        if (!this.audioContext) return;

        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659, this.audioContext.currentTime); // E5

        oscillator1.type = 'triangle';
        oscillator2.type = 'triangle';

        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 6);

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator1.start();
        oscillator2.start();
        oscillator1.stop(this.audioContext.currentTime + 6);
        oscillator2.stop(this.audioContext.currentTime + 6);

        this.currentAudio = { oscillator1, oscillator2, gainNode };
    }

    createAutumnSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
        oscillator.type = 'sawtooth';

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 6);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 6);

        this.currentAudio = { oscillator, gainNode, filter };
    }

    createWinterSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.frequency.setValueAtTime(146, this.audioContext.currentTime); // D3
        oscillator.type = 'sine';

        // Add some vibrato
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();

        vibrato.frequency.setValueAtTime(5, this.audioContext.currentTime);
        vibratoGain.gain.setValueAtTime(10, this.audioContext.currentTime);

        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);

        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 6);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();
        vibrato.start();
        oscillator.stop(this.audioContext.currentTime + 6);
        vibrato.stop(this.audioContext.currentTime + 6);

        this.currentAudio = { oscillator, gainNode, vibrato, vibratoGain };
    }

    startSeasonCycle() {
        this.animate();
        this.startAudioCycle();
    }

    startAudioCycle() {
        setInterval(() => {
            const season = this.getCurrentSeason();
            if (season !== this.lastSeason) {
                this.playSeasonAudio(this.seasons[season]);
            }
        }, 1000);
    }

    getCurrentSeason() {
        const elapsed = (Date.now() - this.seasonStartTime) % this.seasonDuration;
        return Math.floor(elapsed / this.seasonDisplayDuration) % 4;
    }

    playSeasonAudio(season) {
        if (this.currentAudio) {
            // Stop previous audio
            if (this.currentAudio.oscillator) this.currentAudio.oscillator.stop();
            if (this.currentAudio.oscillator1) this.currentAudio.oscillator1.stop();
            if (this.currentAudio.oscillator2) this.currentAudio.oscillator2.stop();
            if (this.currentAudio.vibrato) this.currentAudio.vibrato.stop();
        }

        if (this.seasonSounds[season]) {
            this.seasonSounds[season]();
        }
    }

    spawnSpring() {
        // Flowers blooming and butterflies
        if (this.particles.length < 25) {
            for (let i = 0; i < 3; i++) {
                // Flowers
                this.particles.push({
                    type: 'flower',
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height - Math.random() * 100,
                    petals: Math.floor(Math.random() * 3) + 5,
                    radius: Math.random() * 8 + 5,
                    growth: 0,
                    maxGrowth: 1,
                    color: ['#FFB6C1', '#FFA07A', '#98FB98', '#DDA0DD', '#F0E68C'][Math.floor(Math.random() * 5)],
                    opacity: 0
                });

                // Butterflies
                this.particles.push({
                    type: 'butterfly',
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height * 0.6,
                    wingSpan: Math.random() * 20 + 15,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.3,
                    wingPhase: Math.random() * Math.PI * 2,
                    color: ['#FF69B4', '#4169E1', '#32CD32', '#FFD700', '#FF6347'][Math.floor(Math.random() * 5)],
                    opacity: Math.random() * 0.7 + 0.3
                });
            }
        }
    }

    spawnSummer() {
        // Sunshine rays and pollen
        if (this.particles.length < 30) {
            for (let i = 0; i < 4; i++) {
                // Sunshine rays
                this.particles.push({
                    type: 'sunray',
                    x: Math.random() * this.canvas.width,
                    y: 0,
                    length: Math.random() * 100 + 50,
                    angle: Math.random() * Math.PI / 4 - Math.PI / 8, // From top
                    opacity: Math.random() * 0.3 + 0.1,
                    pulse: Math.random() * Math.PI * 2
                });

                // Pollen
                this.particles.push({
                    type: 'pollen',
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height,
                    radius: Math.random() * 1.5 + 0.5,
                    speedY: -(Math.random() * 0.3 + 0.1),
                    speedX: (Math.random() - 0.5) * 0.1,
                    opacity: Math.random() * 0.5 + 0.2,
                    drift: Math.random() * Math.PI * 2
                });
            }
        }
    }

    spawnAutumn() {
        // Falling leaves
        if (this.particles.length < 20) {
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    type: 'leaf',
                    x: Math.random() * this.canvas.width,
                    y: -20,
                    width: Math.random() * 20 + 15,
                    height: Math.random() * 15 + 10,
                    speedX: (Math.random() - 0.5) * 1.5,
                    speedY: Math.random() * 0.8 + 0.3,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: Math.random() * 0.1 + 0.05,
                    color: ['#FF6B35', '#F7931E', '#FFD23F', '#8B4513'][Math.floor(Math.random() * 4)],
                    opacity: Math.random() * 0.8 + 0.2
                });
            }
        }
    }

    spawnWinter() {
        // Snowflakes and frost
        if (this.particles.length < 40) {
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    type: 'snowflake',
                    x: Math.random() * this.canvas.width,
                    y: -20,
                    radius: Math.random() * 3 + 2,
                    speedY: Math.random() * 0.2 + 0.1,
                    speedX: (Math.random() - 0.5) * 0.1,
                    swayAmount: Math.random() * 3 + 1,
                    swayPhase: Math.random() * Math.PI * 2,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: Math.random() * 0.02,
                    opacity: Math.random() * 0.8 + 0.2,
                    sparkle: Math.random() > 0.7
                });
            }
        }
    }

    drawFlower(particle) {
        if (particle.growth < particle.maxGrowth) {
            particle.growth += 0.02;
            particle.opacity = Math.min(particle.opacity + 0.02, 0.8);
        }

        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity * particle.growth;

        // Stem
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(particle.x, particle.y - particle.radius * 2);
        this.ctx.stroke();

        // Petals
        this.ctx.fillStyle = particle.color;
        for (let i = 0; i < particle.petals; i++) {
            const angle = (i / particle.petals) * Math.PI * 2;
            const petalX = particle.x + Math.cos(angle) * particle.radius * particle.growth;
            const petalY = particle.y - particle.radius * 2 + Math.sin(angle) * particle.radius * particle.growth;

            this.ctx.beginPath();
            this.ctx.arc(petalX, petalY, particle.radius * 0.3 * particle.growth, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Center
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y - particle.radius * 2, particle.radius * 0.2 * particle.growth, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
        return true;
    }

    drawButterfly(particle) {
        particle.wingPhase += 0.2;
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height * 0.7) particle.speedY *= -1;

        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;

        const wingOffset = Math.sin(particle.wingPhase) * 3;

        // Left wing
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.ellipse(particle.x - particle.wingSpan/4, particle.y, particle.wingSpan/3, particle.wingSpan/2 + wingOffset, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Right wing
        this.ctx.beginPath();
        this.ctx.ellipse(particle.x + particle.wingSpan/4, particle.y, particle.wingSpan/3, particle.wingSpan/2 + wingOffset, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Body
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(particle.x - 2, particle.y - particle.wingSpan/4, 4, particle.wingSpan/2);

        this.ctx.restore();
        return true;
    }

    drawSunray(particle) {
        particle.pulse += 0.05;
        const intensity = Math.sin(particle.pulse) * 0.5 + 0.5;

        const gradient = this.ctx.createLinearGradient(
            particle.x, particle.y,
            particle.x + Math.cos(particle.angle) * particle.length,
            particle.y + Math.sin(particle.angle) * particle.length
        );
        gradient.addColorStop(0, `rgba(255, 215, 0, 0)`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${particle.opacity * intensity})`);
        gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(
            particle.x + Math.cos(particle.angle) * particle.length,
            particle.y + Math.sin(particle.angle) * particle.length
        );
        this.ctx.stroke();

        return true;
    }

    drawPollen(particle) {
        particle.drift += 0.02;
        particle.x += particle.speedX + Math.sin(particle.drift) * 0.1;
        particle.y += particle.speedY;

        this.ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();

        if (particle.y < -20) return false;
        return true;
    }

    drawLeaf(particle) {
        particle.rotation += particle.rotationSpeed;
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = particle.color;

        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);

        // Leaf shape
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, particle.width/2, particle.height/2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Stem
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -particle.height/2);
        this.ctx.lineTo(0, particle.height/2);
        this.ctx.stroke();

        this.ctx.restore();

        if (particle.y > this.canvas.height + 20) return false;
        return true;
    }

    drawSnowflake(particle) {
        particle.swayPhase += 0.02;
        particle.x += Math.sin(particle.swayPhase) * particle.swayAmount * 0.1 + particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = '#FFFFFF';

        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);

        // Snowflake pattern
        for (let i = 0; i < 6; i++) {
            this.ctx.rotate(Math.PI / 3);
            this.ctx.fillRect(-1, 0, 2, particle.radius);
            this.ctx.fillRect(-1, -particle.radius * 0.3, 2, particle.radius * 0.6);
        }

        // Center
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.radius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Sparkle effect
        if (particle.sparkle) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(Date.now() * 0.01) * 0.5 + 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();

        if (particle.y > this.canvas.height + 20) return false;
        return true;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const season = this.getCurrentSeason();

        if (season !== this.lastSeason) {
            this.particles = [];
            this.lastSeason = season;
        }

        // Spawn particles for current season
        switch (season) {
            case 0: this.spawnSpring(); break;
            case 1: this.spawnSummer(); break;
            case 2: this.spawnAutumn(); break;
            case 3: this.spawnWinter(); break;
        }

        // Draw and update particles
        this.particles = this.particles.filter(particle => {
            switch (particle.type) {
                case 'flower': return this.drawFlower(particle);
                case 'butterfly': return this.drawButterfly(particle);
                case 'sunray': return this.drawSunray(particle);
                case 'pollen': return this.drawPollen(particle);
                case 'leaf': return this.drawLeaf(particle);
                case 'snowflake': return this.drawSnowflake(particle);
                default: return true;
            }
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.currentAudio) {
            if (this.currentAudio.oscillator) this.currentAudio.oscillator.stop();
            if (this.currentAudio.oscillator1) this.currentAudio.oscillator1.stop();
            if (this.currentAudio.oscillator2) this.currentAudio.oscillator2.stop();
            if (this.currentAudio.vibrato) this.currentAudio.vibrato.stop();
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NatureTheme };
}