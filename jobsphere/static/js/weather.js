// Global weather system for the entire website
class WeatherSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.animationId = null;
        this.currentWeather = 'none';
        this.isRunning = false;
        this.audioContext = null;
        this.audioGain = null;
        this.resizeHandler = this.resize.bind(this);
        this.loop = this.loop.bind(this);
        this.menuExpanded = false;
    }

    init() {
        if (window.weatherSystem) {
            return;
        }

        this.createCanvas();
        this.setupEventListeners();
        this.setupThemeListener();
        window.weatherSystem = this;
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'weather-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '5';
        this.canvas.style.pointerEvents = 'none';
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', this.resizeHandler);
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
    }

    setupThemeListener() {
        // Listen for theme changes
        const observer = new MutationObserver(() => {
            this.updateMenuVisibility();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    updateMenuVisibility() {
        const theme = document.documentElement.getAttribute('data-theme');
        const panel = document.querySelector('.weather-control-panel');
        if (panel) {
            if (theme === 'dark') {
                panel.style.display = 'none';
            } else {
                panel.style.display = 'flex';
            }
        }
    }

    setupEventListeners() {
        // Hamburger menu toggle
        const menuToggle = document.getElementById('weather-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Weather buttons
        document.querySelectorAll('.weather-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const weather = btn.dataset.weather;
                this.toggleWeather(weather);
                this.updateActiveButton(weather);
                this.closeMenu();
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            const panel = document.querySelector('.weather-control-panel');
            if (panel && !panel.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Set default active button
        this.updateActiveButton('none');
    }

    toggleMenu() {
        this.menuExpanded = !this.menuExpanded;
        const menu = document.getElementById('weather-menu');
        if (menu) {
            menu.classList.toggle('expanded');
        }
    }

    closeMenu() {
        this.menuExpanded = false;
        const menu = document.getElementById('weather-menu');
        if (menu) {
            menu.classList.remove('expanded');
        }
    }

    toggleWeather(weather) {
        if (this.currentWeather === weather) {
            weather = 'none';
        }

        this.currentWeather = weather;

        if (weather === 'none') {
            this.stopAnimation();
        } else {
            this.startAnimation(weather);
        }
    }

    updateActiveButton(weather) {
        document.querySelectorAll('.weather-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.weather === weather) {
                btn.classList.add('active');
            }
        });
    }

    startAnimation(weather) {
        if (this.isRunning) {
            this.particles = [];
        }

        this.generateParticles(weather);
        this.isRunning = true;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.animationId = requestAnimationFrame(this.loop);
        this.playWeatherAudio(weather);
    }

    stopAnimation() {
        this.isRunning = false;
        this.particles = [];
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    loop(timestamp) {
        if (!this.isRunning) {
            return;
        }

        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }

    generateParticles(weather) {
        this.particles = [];
        const count = Math.max(25, Math.floor(this.width / 35));

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(weather));
        }
    }

    createParticle(weather) {
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        const baseMult = isLightTheme ? 1.8 : 1;

        const base = {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            speed: 1 + Math.random() * 2,
            size: 2 + Math.random() * 5,
            alpha: (0.12 + Math.random() * 0.14) * baseMult,
            drift: -0.5 + Math.random() * 1,
        };

        switch (weather) {
            case 'rain':
                return {
                    ...base,
                    length: 20 + Math.random() * 32,
                    speed: 12 + Math.random() * 16,
                    hue: 200 + Math.random() * 30,
                    alpha: (0.1 + Math.random() * 0.12) * baseMult,
                };
            case 'snow':
                return {
                    ...base,
                    size: 2.5 + Math.random() * 3.5,
                    speed: 0.8 + Math.random() * 1.2,
                    drift: -0.3 + Math.random() * 0.6,
                    hue: 190,
                    alpha: (0.1 + Math.random() * 0.12) * baseMult,
                };
            case 'pollen':
                return {
                    ...base,
                    size: 3 + Math.random() * 4,
                    speed: 0.3 + Math.random() * 0.6,
                    drift: -0.3 + Math.random() * 0.6,
                    hue: 50 + Math.random() * 20,
                    alpha: (0.08 + Math.random() * 0.1) * baseMult,
                };
            case 'sun':
            default:
                return {
                    ...base,
                    size: 4 + Math.random() * 3,
                    speed: 0.3 + Math.random() * 0.5,
                    drift: -0.2 + Math.random() * 0.4,
                    hue: 40 + Math.random() * 30,
                    alpha: (0.08 + Math.random() * 0.1) * baseMult,
                };
        }
    }

    update() {
        this.particles.forEach((particle) => {
            switch (this.currentWeather) {
                case 'rain':
                    particle.x += particle.drift * 0.8;
                    particle.y += particle.speed;
                    break;
                case 'snow':
                    particle.x += particle.drift * 0.3;
                    particle.y += particle.speed * 0.8;
                    break;
                case 'pollen':
                    particle.x += particle.drift * 0.4;
                    particle.y -= particle.speed * 0.15;
                    break;
                case 'sun':
                    particle.x += particle.drift * 0.15;
                    particle.y -= particle.speed * 0.08;
                    break;
            }

            if (particle.y > this.height + 30 || particle.y < -30 || particle.x < -50 || particle.x > this.width + 50) {
                Object.assign(particle, this.createParticle(this.currentWeather), {
                    y: this.currentWeather === 'snow' ? -20 : Math.random() * this.height,
                    x: Math.random() * this.width,
                });
            }
        });

        if (Math.random() < 0.015) {
            this.particles.push(this.createParticle(this.currentWeather));
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw subtle background tint
        const tint = this.getWeatherTint();
        this.ctx.fillStyle = tint;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw particles
        this.particles.forEach((particle) => {
            this.ctx.globalAlpha = particle.alpha;

            if (this.currentWeather === 'rain') {
                this.ctx.strokeStyle = `hsla(${particle.hue}, 80%, 70%, ${particle.alpha})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x + particle.drift * 3, particle.y + particle.length);
                this.ctx.stroke();
            } else {
                this.ctx.fillStyle = `hsla(${particle.hue}, 90%, 75%, ${particle.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        if (this.currentWeather === 'sun') {
            this.drawSun();
        }

        this.ctx.globalAlpha = 1;
    }

    getWeatherTint() {
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        const mult = isLightTheme ? 1.8 : 1;

        switch (this.currentWeather) {
            case 'rain':
                return `rgba(100, 130, 160, ${0.05 * mult})`;
            case 'snow':
                return `rgba(230, 245, 255, ${0.04 * mult})`;
            case 'pollen':
                return `rgba(255, 240, 200, ${0.04 * mult})`;
            case 'sun':
                return `rgba(255, 250, 220, ${0.04 * mult})`;
            default:
                return 'transparent';
        }
    }

    drawSun() {
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        const opacityMult = isLightTheme ? 1.8 : 1;

        const radius = Math.min(this.width, this.height) * 0.12;
        const x = this.width * 0.85;
        const y = this.height * 0.15;
        const gradient = this.ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 200, ${0.2 * opacityMult})`);
        gradient.addColorStop(1, `rgba(255, 200, 100, ${0.03 * opacityMult})`);
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    playWeatherAudio(weather) {
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
            this.audioGain.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.8);
            this.audioGain.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 4.5);
            this.audioGain.connect(this.audioContext.destination);

            const melody = this.getWeatherMelody(weather);
            melody.forEach((tone) => {
                const osc = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                osc.type = tone.wave;
                osc.frequency.setValueAtTime(tone.frequency, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(tone.volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 4);
                osc.connect(gainNode).connect(this.audioGain);
                osc.start(this.audioContext.currentTime);
                osc.stop(this.audioContext.currentTime + 4);
            });
        } catch (error) {
            console.warn('Weather audio failed:', error);
        }
    }

    getWeatherMelody(weather) {
        switch (weather) {
            case 'rain':
                return [
                    { frequency: 330, volume: 0.06, wave: 'triangle' },
                    { frequency: 262, volume: 0.04, wave: 'sine' },
                ];
            case 'snow':
                return [
                    { frequency: 440, volume: 0.05, wave: 'sine' },
                    { frequency: 523.25, volume: 0.03, wave: 'triangle' },
                ];
            case 'pollen':
                return [
                    { frequency: 392, volume: 0.06, wave: 'triangle' },
                    { frequency: 349.23, volume: 0.04, wave: 'sine' },
                ];
            case 'sun':
            default:
                return [
                    { frequency: 262, volume: 0.07, wave: 'sine' },
                    { frequency: 330, volume: 0.04, wave: 'triangle' },
                ];
        }
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.resizeHandler);

        if (this.canvas && this.canvas.parentNode) {
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

        window.weatherSystem = null;
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherSystem().init();
    });
} else {
    new WeatherSystem().init();
}
