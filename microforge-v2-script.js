/* ===================================
   MICROFORGE ARENA V2 - CANVAS ENGINE
   "Cada clic cuenta, como en el campo de batalla"
   =================================== */

class MicroForgeArena {
    constructor() {
        // Estado de la arena
        this.arenaState = {
            isActive: false,
            isPaused: false,
            isFullscreen: false,
            currentMode: null,
            startTime: null,
            duration: 60,
            gameObjects: [],
            stats: {
                score: 0,
                cpm: 0,
                accuracy: 100,
                clicks: 0,
                hits: 0,
                misses: 0,
                totalActions: 0,
                reactionTimes: [],
                comboCount: 0,
                maxCombo: 0
            },
            intervals: [],
            animationFrame: null
        };

        // Configuración de modos
        this.modes = {
            precision: {
                name: 'Caza de Precisión',
                targetSize: { min: 25, max: 35 },
                spawnRate: 2000,
                targetLifetime: 2500,
                points: 20,
                penalty: 10,
                maxTargets: 3,
                speedMultiplier: 1.2
            },
            speed: {
                name: 'Caza Veloz',
                targetSize: { min: 45, max: 65 },
                spawnRate: 800,
                targetLifetime: 3000,
                points: 10,
                penalty: 5,
                maxTargets: 6,
                speedMultiplier: 0.8
            },
            strategy: {
                name: 'Caza Estratégica',
                targetSize: { min: 30, max: 40 },
                spawnRate: 1500,
                targetLifetime: 2000,
                points: 30,
                penalty: 15,
                maxTargets: 4,
                speedMultiplier: 1.5,
                obstacles: true
            },
            combo: {
                name: 'Caza + Construcción',
                targetSize: { min: 35, max: 45 },
                spawnRate: 1200,
                targetLifetime: 2500,
                points: 50,
                penalty: 20,
                maxTargets: 5,
                speedMultiplier: 1.3,
                buildings: true
            }
        };

        // Configuración personalizable
        this.config = {
            duration: 60,
            targetSize: 'medium',
            spawnRate: 'normal',
            theme: 'forest',
            soundEnabled: true,
            showReactionTime: true
        };

        // Canvas y contexto
        this.canvas = null;
        this.ctx = null;

        // Elementos DOM
        this.elements = {
            // Interfaces
            forgeInterface: document.getElementById('forgeInterface'),
            trainingArena: document.getElementById('trainingArena'),
            
            // Arena HUD
            arenaScore: document.getElementById('arena-score'),
            arenaCpm: document.getElementById('arena-cpm'),
            arenaAccuracy: document.getElementById('arena-accuracy'),
            arenaTimer: document.getElementById('arena-timer'),
            
            // Controles
            arenaPause: document.getElementById('arena-pause'),
            arenaExit: document.getElementById('arena-exit'),
            
            // Displays
            reactionDisplay: document.getElementById('reactionDisplay'),
            comboDisplay: document.getElementById('comboDisplay'),
            penaltyDisplay: document.getElementById('penaltyDisplay'),
            
            // Overlays
            pauseOverlay: document.getElementById('pauseOverlay'),
            resumeBtn: document.getElementById('resume-btn'),
            exitPauseBtn: document.getElementById('exit-pause-btn'),
            
            // Resultados
            arenaResults: document.getElementById('arenaResults'),
            arenaNotifications: document.getElementById('arenaNotifications'),
            
            // Configuración
            durationSelect: document.getElementById('duration'),
            targetSizeSelect: document.getElementById('targetSize'),
            spawnRateSelect: document.getElementById('spawnRate'),
            themeSelect: document.getElementById('theme'),
            soundCheckbox: document.getElementById('soundEnabled'),
            reactionCheckbox: document.getElementById('showReactionTime'),
            
            // Estadísticas
            bestScore: document.getElementById('best-score'),
            bestCpm: document.getElementById('best-cpm'),
            bestAccuracy: document.getElementById('best-accuracy'),
            totalSessions: document.getElementById('total-sessions')
        };

        this.init();
    }

    init() {
        console.log('🏹 MicroForge Arena iniciando...');
        
        // Configurar canvas
        this.setupCanvas();
        
        // Event listeners
        this.setupEventListeners();
        
        // Cargar configuración y estadísticas
        this.loadConfig();
        this.loadStats();
        
        // Actualizar display
        this.updateHUD();
        
        console.log('⚔️ Arena lista para la batalla!');
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('❌ Canvas no encontrado');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar canvas responsivo
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Aplicar tema
        this.applyTheme();
    }

    applyTheme() {
        if (!this.ctx) return;
        
        const themes = {
            forest: {
                primary: '#1a2e1a',
                secondary: '#0f1a0f',
                accent: '#228b22'
            },
            desert: {
                primary: '#2d1b0e',
                secondary: '#1a0f08',
                accent: '#daa520'
            },
            plains: {
                primary: '#1e2a1e',
                secondary: '#0e1a0e',
                accent: '#9acd32'
            },
            winter: {
                primary: '#1a1f2e',
                secondary: '#0f1419',
                accent: '#b0c4de'
            }
        };

        const theme = themes[this.config.theme] || themes.forest;
        
        // Crear gradiente de fondo
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, theme.primary);
        gradient.addColorStop(0.5, theme.secondary);
        gradient.addColorStop(1, theme.primary);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Agregar elementos decorativos del tema
        this.drawThemeElements(theme);
    }

    drawThemeElements(theme) {
        if (this.config.theme === 'forest') {
            this.drawTrees();
        } else if (this.config.theme === 'desert') {
            this.drawDunes();
        } else if (this.config.theme === 'plains') {
            this.drawGrass();
        } else if (this.config.theme === 'winter') {
            this.drawSnow();
        }
    }

    drawTrees() {
        const treeCount = 8;
        for (let i = 0; i < treeCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = 20 + Math.random() * 30;
            
            this.ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawDunes() {
        const duneCount = 5;
        for (let i = 0; i < duneCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = this.canvas.height - Math.random() * 200;
            const width = 100 + Math.random() * 200;
            const height = 50 + Math.random() * 100;
            
            this.ctx.fillStyle = 'rgba(218, 165, 32, 0.2)';
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawGrass() {
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            
            this.ctx.strokeStyle = 'rgba(124, 252, 0, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.random() * 10 - 5, y - 10 - Math.random() * 10);
            this.ctx.stroke();
        }
    }

    drawSnow() {
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = 1 + Math.random() * 3;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    setupEventListeners() {
        console.log('🎮 Configurando event listeners de arena...');
        
        // Botones de modo de entrenamiento
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('launch-btn')) {
                const card = e.target.closest('.training-card');
                const mode = card?.dataset.mode;
                if (mode) {
                    this.startArena(mode);
                }
            }
            
            if (e.target.classList.contains('quick-btn')) {
                const mode = e.target.dataset.mode;
                if (mode) {
                    this.startArena(mode);
                }
            }
        });
        
        // Controles de arena
        this.elements.arenaPause?.addEventListener('click', () => this.togglePause());
        this.elements.arenaExit?.addEventListener('click', () => this.exitArena());
        
        // Controles de pausa
        this.elements.resumeBtn?.addEventListener('click', () => this.togglePause());
        this.elements.exitPauseBtn?.addEventListener('click', () => this.exitArena());
        
        // Canvas clicks
        this.canvas?.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Configuración
        this.elements.durationSelect?.addEventListener('change', (e) => {
            this.config.duration = parseInt(e.target.value);
            this.saveConfig();
        });
        
        this.elements.targetSizeSelect?.addEventListener('change', (e) => {
            this.config.targetSize = e.target.value;
            this.saveConfig();
        });
        
        this.elements.spawnRateSelect?.addEventListener('change', (e) => {
            this.config.spawnRate = e.target.value;
            this.saveConfig();
        });
        
        this.elements.themeSelect?.addEventListener('change', (e) => {
            this.config.theme = e.target.value;
            this.saveConfig();
            if (this.arenaState.isActive) {
                this.applyTheme();
            }
        });
        
        this.elements.soundCheckbox?.addEventListener('change', (e) => {
            this.config.soundEnabled = e.checked;
            this.saveConfig();
        });
        
        this.elements.reactionCheckbox?.addEventListener('change', (e) => {
            this.config.showReactionTime = e.checked;
            this.saveConfig();
        });
        
        // Teclado
        document.addEventListener('keydown', (e) => {
            if (this.arenaState.isActive) {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.togglePause();
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    this.exitArena();
                }
            }
        });
        
        // Fullscreen API
        document.addEventListener('fullscreenchange', () => {
            this.arenaState.isFullscreen = !!document.fullscreenElement;
            if (!this.arenaState.isFullscreen && this.arenaState.isActive) {
                this.showNotification('⚠️ Se recomienda pantalla completa para mejor experiencia');
            }
        });
    }

    async startArena(mode) {
        console.log(`🏹 Iniciando arena en modo: ${mode}`);
        
        if (!this.modes[mode]) {
            console.error('❌ Modo no válido:', mode);
            return;
        }
        
        // Configurar estado
        this.arenaState.currentMode = mode;
        this.arenaState.isActive = true;
        this.arenaState.isPaused = false;
        this.arenaState.startTime = Date.now();
        this.arenaState.duration = this.config.duration;
        
        // Resetear estadísticas
        this.resetStats();
        
        // Entrar en pantalla completa
        try {
            await this.enterFullscreen();
        } catch (error) {
            console.warn('⚠️ No se pudo entrar en pantalla completa:', error);
        }
        
        // Mostrar arena
        this.elements.forgeInterface.style.display = 'none';
        this.elements.trainingArena.classList.remove('hidden');
        
        // Aplicar tema y redimensionar
        this.resizeCanvas();
        this.applyTheme();
        
        // Iniciar game loop
        this.startGameLoop();
        
        // Mostrar notificación de inicio
        this.showNotification(`🏹 ${this.modes[mode].name} iniciado! ¡Buena caza!`);
        
        // Comenzar spawn de objetivos
        this.startTargetSpawning();
    }

    async enterFullscreen() {
        if (this.elements.trainingArena.requestFullscreen) {
            await this.elements.trainingArena.requestFullscreen();
        } else if (this.elements.trainingArena.webkitRequestFullscreen) {
            await this.elements.trainingArena.webkitRequestFullscreen();
        } else if (this.elements.trainingArena.msRequestFullscreen) {
            await this.elements.trainingArena.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    startGameLoop() {
        const gameLoop = () => {
            if (!this.arenaState.isActive) return;
            
            if (!this.arenaState.isPaused) {
                this.updateGame();
                this.renderGame();
                this.updateHUD();
                
                // Verificar tiempo
                if (this.config.duration > 0) {
                    const elapsed = (Date.now() - this.arenaState.startTime) / 1000;
                    const remaining = Math.max(0, this.config.duration - elapsed);
                    
                    if (remaining <= 0) {
                        this.endArena();
                        return;
                    }
                    
                    this.elements.arenaTimer.textContent = Math.ceil(remaining);
                }
            }
            
            this.arenaState.animationFrame = requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }

    updateGame() {
        // Actualizar objetos del juego
        for (let i = this.arenaState.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.arenaState.gameObjects[i];
            
            // Actualizar posición si tiene movimiento
            if (obj.vx !== undefined) obj.x += obj.vx;
            if (obj.vy !== undefined) obj.y += obj.vy;
            
            // Verificar tiempo de vida
            if (Date.now() - obj.spawnTime > obj.lifetime) {
                // Objetivo expirado - penalizar
                if (obj.type === 'boar') {
                    this.arenaState.stats.misses++;
                    this.showPenalty('HUIDA', 5);
                }
                this.arenaState.gameObjects.splice(i, 1);
            }
        }
        
        // Calcular CPM
        this.calculateCPM();
        
        // Calcular precisión
        this.calculateAccuracy();
    }

    renderGame() {
        // Limpiar canvas
        this.applyTheme();
        
        // Renderizar objetos del juego
        this.arenaState.gameObjects.forEach(obj => {
            this.renderGameObject(obj);
        });
        
        // Renderizar obstáculos si es modo estratégico
        if (this.arenaState.currentMode === 'strategy') {
            this.renderObstacles();
        }
    }

    renderGameObject(obj) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(obj.x, obj.y);
        
        if (obj.type === 'boar') {
            // Jabalí
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(0, 0, obj.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Contorno dorado
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Emoji jabalí
            ctx.font = `${obj.size * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText('🐗', 0, 0);
            
        } else if (obj.type === 'building') {
            // Edificio para construir
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(-obj.size / 2, -obj.size / 2, obj.size, obj.size);
            
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(-obj.size / 2, -obj.size / 2, obj.size, obj.size);
            
            // Emoji edificio
            ctx.font = `${obj.size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText('🏘️', 0, 0);
        }
        
        // Indicador de tiempo restante
        const timeRatio = 1 - (Date.now() - obj.spawnTime) / obj.lifetime;
        if (timeRatio < 0.3) {
            ctx.strokeStyle = '#FF4444';
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, obj.size / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }

    renderObstacles() {
        // Renderizar árboles/obstáculos fijos para modo estratégico
        const ctx = this.ctx;
        const obstacleCount = 6;
        
        for (let i = 0; i < obstacleCount; i++) {
            const x = (i + 1) * (this.canvas.width / (obstacleCount + 1));
            const y = 100 + (i % 2) * (this.canvas.height - 200);
            
            ctx.fillStyle = 'rgba(34, 139, 34, 0.4)';
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌳', x, y);
        }
    }

    startTargetSpawning() {
        const mode = this.modes[this.arenaState.currentMode];
        let spawnRate = mode.spawnRate;
        
        // Ajustar según configuración
        const rateMultipliers = {
            slow: 1.5,
            normal: 1,
            fast: 0.7,
            extreme: 0.4
        };
        
        spawnRate *= rateMultipliers[this.config.spawnRate] || 1;
        
        const spawnInterval = setInterval(() => {
            if (!this.arenaState.isActive || this.arenaState.isPaused) return;
            
            // Verificar límite de objetivos
            const currentTargets = this.arenaState.gameObjects.filter(obj => obj.type === 'boar').length;
            if (currentTargets >= mode.maxTargets) return;
            
            this.spawnTarget();
            
            // Spawn edificio para modo combo
            if (this.arenaState.currentMode === 'combo' && Math.random() < 0.3) {
                setTimeout(() => this.spawnBuilding(), 500);
            }
            
        }, spawnRate);
        
        this.arenaState.intervals.push(spawnInterval);
    }

    spawnTarget() {
        const mode = this.modes[this.arenaState.currentMode];
        const padding = 80;
        
        // Calcular tamaño
        let size = (mode.targetSize.min + mode.targetSize.max) / 2;
        
        const sizeMultipliers = {
            small: 0.7,
            medium: 1,
            large: 1.4
        };
        
        size *= sizeMultipliers[this.config.targetSize] || 1;
        
        // Posición aleatoria (evitando bordes)
        const x = padding + Math.random() * (this.canvas.width - padding * 2);
        const y = padding + Math.random() * (this.canvas.height - padding * 2);
        
        const target = {
            type: 'boar',
            x: x,
            y: y,
            size: size,
            spawnTime: Date.now(),
            lifetime: mode.targetLifetime,
            clickTime: null,
            points: mode.points
        };
        
        // Movimiento para algunos modos
        if (this.arenaState.currentMode === 'strategy') {
            target.vx = (Math.random() - 0.5) * 0.5;
            target.vy = (Math.random() - 0.5) * 0.5;
        }
        
        this.arenaState.gameObjects.push(target);
        
        // Sonido de aparición
        if (this.config.soundEnabled) {
            this.playSound('spawn');
        }
    }

    spawnBuilding() {
        const padding = 100;
        const size = 60;
        
        const x = padding + Math.random() * (this.canvas.width - padding * 2);
        const y = padding + Math.random() * (this.canvas.height - padding * 2);
        
        const building = {
            type: 'building',
            x: x,
            y: y,
            size: size,
            spawnTime: Date.now(),
            lifetime: 4000,
            points: 30
        };
        
        this.arenaState.gameObjects.push(building);
    }

    handleCanvasClick(e) {
        if (!this.arenaState.isActive || this.arenaState.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Ajustar para escala del canvas
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const gameX = clickX * scaleX;
        const gameY = clickY * scaleY;
        
        this.arenaState.stats.clicks++;
        this.arenaState.stats.totalActions++;
        
        // Buscar objetivo clickeado
        let hit = false;
        for (let i = this.arenaState.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.arenaState.gameObjects[i];
            const distance = Math.sqrt((gameX - obj.x) ** 2 + (gameY - obj.y) ** 2);
            
            if (distance <= obj.size / 2) {
                // ¡Hit!
                hit = true;
                this.handleTargetHit(obj, i);
                break;
            }
        }
        
        if (!hit) {
            // Miss
            this.handleMiss(gameX, gameY);
        }
    }

    handleTargetHit(target, index) {
        const clickTime = Date.now();
        const reactionTime = clickTime - target.spawnTime;
        
        // Actualizar estadísticas
        this.arenaState.stats.hits++;
        this.arenaState.stats.reactionTimes.push(reactionTime);
        
        // Calcular puntos con combo
        let points = target.points;
        this.arenaState.stats.comboCount++;
        
        if (this.arenaState.stats.comboCount > 1) {
            const comboMultiplier = Math.min(this.arenaState.stats.comboCount, 5);
            points *= comboMultiplier;
            this.showCombo(this.arenaState.stats.comboCount);
        }
        
        this.arenaState.stats.score += points;
        this.arenaState.stats.maxCombo = Math.max(this.arenaState.stats.maxCombo, this.arenaState.stats.comboCount);
        
        // Remover objetivo
        this.arenaState.gameObjects.splice(index, 1);
        
        // Mostrar tiempo de reacción
        if (this.config.showReactionTime) {
            this.showReactionTime(reactionTime);
        }
        
        // Efectos visuales
        this.createHitEffect(target.x, target.y, points);
        
        // Sonido
        if (this.config.soundEnabled) {
            this.playSound('hit');
        }
        
        console.log(`🎯 Hit! Reacción: ${reactionTime}ms, Puntos: ${points}`);
    }

    handleMiss(x, y) {
        const mode = this.modes[this.arenaState.currentMode];
        
        this.arenaState.stats.misses++;
        this.arenaState.stats.comboCount = 0; // Romper combo
        
        // Penalización
        this.arenaState.stats.score = Math.max(0, this.arenaState.stats.score - mode.penalty);
        
        // Efectos visuales
        this.createMissEffect(x, y);
        this.showPenalty('MISS', mode.penalty);
        
        // Sonido
        if (this.config.soundEnabled) {
            this.playSound('miss');
        }
    }

    createHitEffect(x, y, points) {
        // Crear partículas doradas
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 3 + Math.random() * 2;
            
            const particle = {
                type: 'particle',
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30,
                color: '#FFD700',
                size: 3 + Math.random() * 2
            };
            
            this.arenaState.gameObjects.push(particle);
        }
        
        // Mostrar puntos flotantes
        this.showFloatingPoints(x, y, points);
    }

    createMissEffect(x, y) {
        // Ondas rojas
        const ripple = {
            type: 'ripple',
            x: x,
            y: y,
            radius: 0,
            maxRadius: 40,
            life: 20,
            color: '#FF4444'
        };
        
        this.arenaState.gameObjects.push(ripple);
    }

    showReactionTime(reactionTime) {
        if (!this.elements.reactionDisplay) return;
        
        const reactionElement = this.elements.reactionDisplay.querySelector('#reactionTime');
        if (reactionElement) {
            reactionElement.textContent = `${reactionTime}ms`;
        }
        
        this.elements.reactionDisplay.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.reactionDisplay.classList.add('hidden');
        }, 1500);
    }

    showCombo(count) {
        if (!this.elements.comboDisplay) return;
        
        const comboCountElement = this.elements.comboDisplay.querySelector('#comboCount');
        if (comboCountElement) {
            comboCountElement.textContent = count;
        }
        
        this.elements.comboDisplay.classList.remove('hidden');
        
        // Auto-hide después de 2 segundos
        setTimeout(() => {
            this.elements.comboDisplay.classList.add('hidden');
        }, 2000);
    }

    showPenalty(text, value) {
        if (!this.elements.penaltyDisplay) return;
        
        const penaltyTextElement = this.elements.penaltyDisplay.querySelector('.penalty-text');
        const penaltyValueElement = this.elements.penaltyDisplay.querySelector('#penaltyValue');
        
        if (penaltyTextElement) penaltyTextElement.textContent = text;
        if (penaltyValueElement) penaltyValueElement.textContent = `-${value}`;
        
        this.elements.penaltyDisplay.classList.remove('hidden');
        
        setTimeout(() => {
            this.elements.penaltyDisplay.classList.add('hidden');
        }, 1000);
    }

    showFloatingPoints(x, y, points) {
        // Crear elemento flotante temporal
        const floatingPoints = document.createElement('div');
        floatingPoints.textContent = `+${points}`;
        floatingPoints.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            color: #FFD700;
            font-weight: bold;
            font-size: 1.5rem;
            pointer-events: none;
            z-index: 1250;
            animation: floatUp 1.5s ease forwards;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        `;
        
        document.body.appendChild(floatingPoints);
        
        setTimeout(() => {
            document.body.removeChild(floatingPoints);
        }, 1500);
    }

    showNotification(message) {
        if (!this.elements.arenaNotifications) return;
        
        const notification = document.createElement('div');
        notification.className = 'arena-notification';
        notification.textContent = message;
        
        this.elements.arenaNotifications.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    playSound(type) {
        // Implementar sonidos con Web Audio API o Audio elements
        // Por simplicidad, usar sonidos del sistema por ahora
        const sounds = {
            hit: '🎯',
            miss: '💥',
            spawn: '🐗'
        };
        
        // En una implementación completa, aquí se reproducirían archivos de audio
        console.log(`🔊 Sonido: ${sounds[type] || type}`);
    }

    togglePause() {
        this.arenaState.isPaused = !this.arenaState.isPaused;
        
        if (this.arenaState.isPaused) {
            this.elements.pauseOverlay?.classList.remove('hidden');
        } else {
            this.elements.pauseOverlay?.classList.add('hidden');
        }
        
        console.log(this.arenaState.isPaused ? '⏸️ Arena pausada' : '▶️ Arena reanudada');
    }

    endArena() {
        console.log('🏁 Arena terminada');
        
        this.arenaState.isActive = false;
        
        // Limpiar intervals
        this.arenaState.intervals.forEach(interval => clearInterval(interval));
        this.arenaState.intervals = [];
        
        // Cancelar animation frame
        if (this.arenaState.animationFrame) {
            cancelAnimationFrame(this.arenaState.animationFrame);
        }
        
        // Mostrar resultados
        this.showResults();
        
        // Guardar estadísticas
        this.saveStats();
    }

    exitArena() {
        console.log('🚪 Saliendo de arena');
        
        if (this.arenaState.isActive) {
            this.endArena();
        }
        
        // Salir de pantalla completa
        this.exitFullscreen();
        
        // Volver a interfaz principal
        setTimeout(() => {
            this.elements.trainingArena?.classList.add('hidden');
            this.elements.forgeInterface.style.display = 'block';
            
            // Ocultar overlays
            this.elements.pauseOverlay?.classList.add('hidden');
            this.elements.arenaResults?.classList.add('hidden');
        }, 100);
    }

    showResults() {
        // Calcular estadísticas finales
        const averageReaction = this.arenaState.stats.reactionTimes.length > 0 
            ? Math.round(this.arenaState.stats.reactionTimes.reduce((a, b) => a + b) / this.arenaState.stats.reactionTimes.length)
            : 0;
        
        // Actualizar elementos de resultados
        const elements = {
            'final-hits': this.arenaState.stats.hits,
            'final-cpm': this.arenaState.stats.cpm,
            'final-precision': Math.round(this.arenaState.stats.accuracy),
            'final-reaction': averageReaction
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = id === 'final-precision' ? `${value}%` : 
                                   id === 'final-reaction' ? `${value}ms` : value;
            }
        });
        
        // Generar análisis de rendimiento
        this.generatePerformanceAnalysis();
        
        // Mostrar modal de resultados
        this.elements.arenaResults?.classList.remove('hidden');
    }

    generatePerformanceAnalysis() {
        const stats = this.arenaState.stats;
        const analysis = [];
        
        // Análisis de puntuación
        if (stats.score >= 1000) {
            analysis.push('🏆 <strong>Puntuación Épica:</strong> ¡Eres un maestro cazador!');
        } else if (stats.score >= 500) {
            analysis.push('⭐ <strong>Buena Caza:</strong> Tu puntería está mejorando notablemente.');
        } else {
            analysis.push('💪 <strong>Sigue Entrenando:</strong> La práctica hace al maestro.');
        }
        
        // Análisis de CPM
        if (stats.cpm >= 120) {
            analysis.push('⚡ <strong>CPM Impresionante:</strong> Velocidad de pro player!');
        } else if (stats.cpm >= 80) {
            analysis.push('🚀 <strong>CPM Sólido:</strong> Velocidad por encima del promedio.');
        } else {
            analysis.push('📈 <strong>Mejora tu Velocidad:</strong> Practica clicks más rápidos.');
        }
        
        // Análisis de precisión
        if (stats.accuracy >= 90) {
            analysis.push('🎯 <strong>Precisión Perfecta:</strong> ¡Control excepcional!');
        } else if (stats.accuracy >= 75) {
            analysis.push('👌 <strong>Buena Precisión:</strong> Mantén el control.');
        } else {
            analysis.push('🎮 <strong>Enfócate en Precisión:</strong> Calidad sobre cantidad.');
        }
        
        // Análisis de combos
        if (stats.maxCombo >= 10) {
            analysis.push('🔥 <strong>Combo Master:</strong> ¡Cadenas impresionantes!');
        } else if (stats.maxCombo >= 5) {
            analysis.push('⚡ <strong>Buenos Combos:</strong> Consistencia mejorable.');
        }
        
        const analysisElement = document.getElementById('performanceAnalysis');
        if (analysisElement) {
            analysisElement.innerHTML = `
                <h3>📊 Análisis de Rendimiento</h3>
                <ul><li>${analysis.join('</li><li>')}</li></ul>
            `;
        }
    }

    // Métodos auxiliares
    resetStats() {
        this.arenaState.stats = {
            score: 0,
            cpm: 0,
            accuracy: 100,
            clicks: 0,
            hits: 0,
            misses: 0,
            totalActions: 0,
            reactionTimes: [],
            comboCount: 0,
            maxCombo: 0
        };
        this.arenaState.gameObjects = [];
    }

    calculateCPM() {
        const elapsedMinutes = (Date.now() - this.arenaState.startTime) / 60000;
        if (elapsedMinutes > 0) {
            this.arenaState.stats.cpm = Math.round(this.arenaState.stats.clicks / elapsedMinutes);
        }
    }

    calculateAccuracy() {
        const total = this.arenaState.stats.hits + this.arenaState.stats.misses;
        if (total > 0) {
            this.arenaState.stats.accuracy = (this.arenaState.stats.hits / total) * 100;
        }
    }

    updateHUD() {
        if (!this.arenaState.isActive) return;
        
        const elements = {
            arenaScore: this.arenaState.stats.score,
            arenaCpm: this.arenaState.stats.cpm,
            arenaAccuracy: Math.round(this.arenaState.stats.accuracy) + '%'
        };
        
        Object.entries(elements).forEach(([key, value]) => {
            if (this.elements[key]) {
                this.elements[key].textContent = value;
            }
        });
    }

    // Persistencia
    saveConfig() {
        localStorage.setItem('microforge_arena_config', JSON.stringify(this.config));
    }

    loadConfig() {
        const saved = localStorage.getItem('microforge_arena_config');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
            
            // Aplicar configuración a elementos
            if (this.elements.durationSelect) this.elements.durationSelect.value = this.config.duration;
            if (this.elements.targetSizeSelect) this.elements.targetSizeSelect.value = this.config.targetSize;
            if (this.elements.spawnRateSelect) this.elements.spawnRateSelect.value = this.config.spawnRate;
            if (this.elements.themeSelect) this.elements.themeSelect.value = this.config.theme;
            if (this.elements.soundCheckbox) this.elements.soundCheckbox.checked = this.config.soundEnabled;
            if (this.elements.reactionCheckbox) this.elements.reactionCheckbox.checked = this.config.showReactionTime;
        }
    }

    saveStats() {
        const stats = this.arenaState.stats;
        const currentBest = {
            score: parseInt(localStorage.getItem('microforge_best_score') || 0),
            cpm: parseInt(localStorage.getItem('microforge_best_cpm') || 0),
            accuracy: parseInt(localStorage.getItem('microforge_best_accuracy') || 0),
            sessions: parseInt(localStorage.getItem('microforge_total_sessions') || 0)
        };
        
        // Actualizar récords
        if (stats.score > currentBest.score) {
            localStorage.setItem('microforge_best_score', stats.score);
        }
        if (stats.cpm > currentBest.cpm) {
            localStorage.setItem('microforge_best_cpm', stats.cpm);
        }
        if (stats.accuracy > currentBest.accuracy) {
            localStorage.setItem('microforge_best_accuracy', Math.round(stats.accuracy));
        }
        
        // Incrementar sesiones
        localStorage.setItem('microforge_total_sessions', currentBest.sessions + 1);
        
        // Actualizar display
        this.loadStats();
    }

    loadStats() {
        const stats = {
            bestScore: localStorage.getItem('microforge_best_score') || 0,
            bestCpm: localStorage.getItem('microforge_best_cpm') || 0,
            bestAccuracy: localStorage.getItem('microforge_best_accuracy') || 0,
            totalSessions: localStorage.getItem('microforge_total_sessions') || 0
        };
        
        Object.entries(stats).forEach(([key, value]) => {
            const element = this.elements[key.replace(/([A-Z])/g, '-$1').toLowerCase()];
            if (element) {
                element.textContent = key === 'bestAccuracy' ? `${value}%` : value;
            }
        });
    }

    // API pública para botones de resultados
    restart() {
        this.elements.arenaResults?.classList.add('hidden');
        this.startArena(this.arenaState.currentMode);
    }

    exitToMenu() {
        this.exitArena();
    }

    shareResults() {
        const stats = this.arenaState.stats;
        const mode = this.modes[this.arenaState.currentMode]?.name || 'Entrenamiento';
        
        const shareText = `🏹 MicroForge Arena - ${mode}
🎯 Puntuación: ${stats.score}
⚡ CPM: ${stats.cpm}
🎪 Precisión: ${Math.round(stats.accuracy)}%
🔥 Combo máximo: ${stats.maxCombo}

¡Forja tu micro en la arena! ⚔️`;
        
        if (navigator.share) {
            navigator.share({
                title: 'MicroForge Arena - Resultados',
                text: shareText
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('📋 Resultados copiados al portapapeles');
            });
        }
    }

    shareBest() {
        const bestScore = localStorage.getItem('microforge_best_score') || 0;
        const bestCpm = localStorage.getItem('microforge_best_cpm') || 0;
        const bestAccuracy = localStorage.getItem('microforge_best_accuracy') || 0;
        
        const shareText = `🏆 MicroForge Arena - Mis Récords
🎯 Mejor Puntuación: ${bestScore}
⚡ Mejor CPM: ${bestCpm}
🎪 Mejor Precisión: ${bestAccuracy}%

¡Ven a probar tu micro! ⚔️`;
        
        if (navigator.share) {
            navigator.share({
                title: 'MicroForge Arena - Mis Récords',
                text: shareText
            });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Récords copiados al portapapeles');
            });
        }
    }
}

// CSS adicional para animaciones
const additionalCSS = `
@keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-60px); }
}

@keyframes particleSpread {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0); }
}
`;

// Inyectar CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.arena = new MicroForgeArena();
    console.log('🏹 MicroForge Arena cargada y lista para la batalla!');
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroForgeArena;
}
