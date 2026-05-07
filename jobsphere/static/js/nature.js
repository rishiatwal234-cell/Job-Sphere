const themeCanvas = document.createElement('canvas');
const seasons = ['rain', 'pollen', 'sun', 'snow'];

class NatureTheme {
    constructor() {
        this.canvas = themeCanvas;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.seasonIndex = 0;
        this.season = seasons[this.seasonIndex];
        this.particles = [];
        this.animationId = null;
        this.audioContext = null;
        this.audioGain = null;
        this.seasonStart = 0;
        this.resizeHandler = this.resize.bind(this);
        this.loop = this.loop.bind(this);
    }

    init() {
        if (window.natureTheme) {
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'nature-canvas';
        document.body.appendChild(this.canvas);
        this.resize();
        this.changeSeason(true);
        window.addEventListener('resize', this.resizeHandler);
        this.animationId = requestAnimationFrame(this.loop);
        this.playSeasonAudio();
        this.audioInterval = setInterval(() => this.playSeasonAudio(), 6500);

        window.natureTheme = this;
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        const ratio = window.devicePixelRatio || 1;
        this.canvas.width = this.width * ratio;
        this.canvas.height = this.height * ratio;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.generateParticles();
    }

    loop(timestamp) {
        const elapsed = timestamp - this.seasonStart;
        if (elapsed > 6500) {
            this.changeSeason();
        }

        this.update(elapsed);
        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }

    changeSeason(initial = false) {
        if (!initial) {
            this.seasonIndex = (this.seasonIndex + 1) % seasons.length;
        }

        this.season = seasons[this.seasonIndex];
        this.seasonStart = performance.now();
        this.generateParticles();
    }

    generateParticles() {
        this.particles.length = 0;
        const count = Math.max(18, Math.floor(this.width / 36));

        for (let i = 0; i < count; i += 1) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const base = {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            speed: 1 + Math.random() * 2,
            size: 2 + Math.random() * 5,
            alpha: 0.1 + Math.random() * 0.3,
            drift: -0.5 + Math.random() * 1,
        };

        switch (this.season) {
            case 'rain':
                return {
                    ...base,
                    length: 18 + Math.random() * 28,
                    speed: 10 + Math.random() * 14,
                    hue: 200 + Math.random() * 30,
                    alpha: 0.08 + Math.random() * 0.12,
                };
            case 'snow':
                return {
                    ...base,
                    size: 2 + Math.random() * 3,
                    speed: 1 + Math.random() * 1.4,
                    drift: -0.3 + Math.random() * 0.6,
                    hue: 190,
                    alpha: 0.08 + Math.random() * 0.12,
                };
            case 'pollen':
                return {
                    ...base,
                    size: 4 + Math.random() * 5,
                    speed: 0.4 + Math.random() * 0.8,
                    drift: -0.4 + Math.random() * 0.8,
                    hue: 50 + Math.random() * 20,
                    alpha: 0.08 + Math.random() * 0.12,
                };
            case 'sun':
            default:
                return {
                    ...base,
                    size: 5 + Math.random() * 4,
                    speed: 0.5 + Math.random() * 0.7,
                    drift: -0.3 + Math.random() * 0.6,
                    hue: 40 + Math.random() * 30,
                    alpha: 0.08 + Math.random() * 0.12,
                };
        }
    }

    update() {
        this.particles.forEach((particle) => {
            if (this.season === 'rain') {
                particle.x += particle.drift * 0.8;
                particle.y += particle.speed;
            } else if (this.season === 'snow') {
                particle.x += particle.drift * 0.4;
                particle.y += particle.speed * 0.9;
            } else if (this.season === 'pollen') {
                particle.x += particle.drift * 0.5;
                particle.y -= particle.speed * 0.2;
            } else {
                particle.x += particle.drift * 0.2;
                particle.y -= particle.speed * 0.1;
            }

            if (particle.y > this.height + 30 || particle.y < -30 || particle.x < -50 || particle.x > this.width + 50) {
                Object.assign(particle, this.createParticle(), {
                    y: this.season === 'snow' ? -20 : Math.random() * this.height,
                    x: Math.random() * this.width,
                });
            }
        });

        if (Math.random() < 0.02) {
            this.particles.push(this.createParticle());
        }
    }

    draw() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        const seasonColor = this.getSeasonColors();
        gradient.addColorStop(0, seasonColor.top);
        gradient.addColorStop(1, seasonColor.bottom);

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.season === 'sun') {
            this.drawSun();
        }

        if (this.season === 'pollen') {
            this.drawLightBeams();
        }

        this.particles.forEach((particle) => {
            this.ctx.globalAlpha = particle.alpha;
            if (this.season === 'rain') {
                this.ctx.strokeStyle = `hsla(${particle.hue}, 80%, 75%, ${particle.alpha})`;
                this.ctx.lineWidth = 1.8;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x + particle.drift * 4, particle.y + particle.length);
                this.ctx.stroke();
            } else {
                this.ctx.fillStyle = `hsla(${particle.hue}, 90%, 80%, ${particle.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        this.ctx.globalAlpha = 1;
    }

    getSeasonColors() {
        switch (this.season) {
            case 'rain':
                return { top: 'rgba(58, 90, 125, 0.3)', bottom: 'rgba(14, 24, 40, 0.4)' };
            case 'snow':
                return { top: 'rgba(235, 245, 255, 0.3)', bottom: 'rgba(218, 232, 242, 0.4)' };
            case 'pollen':
                return { top: 'rgba(252, 234, 187, 0.3)', bottom: 'rgba(214, 231, 168, 0.4)' };
            case 'sun':
            default:
                return { top: 'rgba(255, 243, 204, 0.3)', bottom: 'rgba(210, 236, 217, 0.4)' };
        }
    }

    drawSun() {
        const radius = Math.min(this.width, this.height) * 0.14;
        const x = this.width * 0.82;
        const y = this.height * 0.18;
        const gradient = this.ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 210, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 214, 115, 0.02)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLightBeams() {
        const beamCount = 3;
        for (let i = 0; i < beamCount; i += 1) {
            const x = this.width * (0.15 + i * 0.22);
            const beamWidth = 120 + i * 30;
            this.ctx.fillStyle = 'rgba(255, 255, 212, 0.04)';
            this.ctx.beginPath();
            this.ctx.moveTo(x - beamWidth, 0);
            this.ctx.lineTo(x + beamWidth, 0);
            this.ctx.lineTo(x + beamWidth * 0.4, this.height);
            this.ctx.lineTo(x - beamWidth * 0.4, this.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    playSeasonAudio() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        try {
            if (!this.audioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            }

            if (this.audioGain) {
                this.audioGain.gain.cancelScheduledValues(this.audioContext.currentTime);
            }

            this.audioGain = this.audioContext.createGain();
            this.audioGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.audioGain.gain.linearRampToValueAtTime(0.12, this.audioContext.currentTime + 0.9);
            this.audioGain.gain.linearRampToValueAtTime(0.0, this.audioContext.currentTime + 5.8);
            this.audioGain.connect(this.audioContext.destination);

            const harmony = this.getSeasonMelody();
            harmony.forEach((tone) => {
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                osc.type = tone.wave;
                osc.frequency.setValueAtTime(tone.frequency, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(tone.volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 5.5);
                osc.connect(gainNode).connect(this.audioGain);
                osc.start(this.audioContext.currentTime);
                osc.stop(this.audioContext.currentTime + 5.5);
            });
        } catch (error) {
            console.warn('Nature audio failed to start:', error);
        }
    }

    getSeasonMelody() {
        switch (this.season) {
            case 'rain':
                return [
                    { frequency: 330, volume: 0.08, wave: 'triangle' },
                    { frequency: 262, volume: 0.05, wave: 'sine' },
                ];
            case 'snow':
                return [
                    { frequency: 440, volume: 0.06, wave: 'sine' },
                    { frequency: 523.25, volume: 0.04, wave: 'triangle' },
                ];
            case 'pollen':
                return [
                    { frequency: 392, volume: 0.08, wave: 'triangle' },
                    { frequency: 349.23, volume: 0.05, wave: 'sine' },
                ];
            case 'sun':
            default:
                return [
                    { frequency: 262, volume: 0.09, wave: 'sine' },
                    { frequency: 330, volume: 0.05, wave: 'triangle' },
                ];
        }
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        clearInterval(this.audioInterval);
        window.removeEventListener('resize', this.resizeHandler);

        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }

        if (this.audioGain) {
            this.audioGain.disconnect();
        }

        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (error) {
                // ignore
            }
        }

        window.natureTheme = null;
    }
}

new NatureTheme().init();