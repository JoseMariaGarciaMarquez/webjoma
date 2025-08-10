/* ===================================
   MICROFORGE - RTS TRAINING APP
   JavaScript Core System
   =================================== */

class MicroForge {
    constructor() {
        // Estado del juego
        this.gameState = {
            isActive: false,
            isPaused: false,
            currentModule: null,
            startTime: null,
            duration: 60,
            stats: {
                score: 0,
                apm: 0,
                accuracy: 0,
                clicks: 0,
                hits: 0,
                misses: 0,
                totalActions: 0
            },
            timer: null,
            intervals: []
        };
        
        // Configuración de módulos
        this.modules = {
            boarHunt: {
                name: 'Cacería de Jabalís',
                type: 'clicking',
                duration: 60,
                targetCount: 30,
                config: {
                    targetSize: 40,
                    spawnRate: 2000,
                    targetLifetime: 3000,
                    points: 10
                }
            },
            scoutMicro: {
                name: 'Micro de Explorador',
                type: 'movement',
                duration: 90,
                config: {
                    commands: ['patrol', 'stop', 'move', 'stand'],
                    commandInterval: 3000,
                    points: 15
                }
            },
            hotkeyMaster: {
                name: 'Maestro de Hotkeys',
                type: 'hotkeys',
                duration: 120,
                config: {
                    sequences: [
                        ['h', 'a'],  // casa + aldeano
                        ['h', 'h'],  // casa + casa
                        ['b', 'b'],  // cuartel + cuartel
                        ['h', 'e'],  // casa + tecnología
                        ['a', 's']   // aldeano + parar
                    ],
                    timeLimit: 2000,
                    points: 20
                }
            },
            multitask: {
                name: 'Multitarea Avanzada',
                type: 'combined',
                duration: 180,
                config: {
                    mixedChallenges: true,
                    difficulty: 'hard',
                    points: 25
                }
            },
            apmTest: {
                name: 'Test APM Extremo',
                type: 'speed',
                duration: 30,
                config: {
                    rapidFire: true,
                    targetAPM: 200,
                    points: 30
                }
            }
        };
        
        // Elementos DOM
        this.elements = {
            // Stats
            scoreValue: document.getElementById('score-value'),
            apmValue: document.getElementById('apm-value'),
            accuracyValue: document.getElementById('accuracy-value'),
            timerValue: document.getElementById('timer-value'),
            
            // Controles
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            
            // Zonas de entrenamiento
            actionZone: document.getElementById('action-zone'),
            commandZone: document.getElementById('command-zone'),
            eventsZone: document.getElementById('events-zone'),
            
            // Panel de resultados
            resultsPanel: document.getElementById('results-panel'),
            resultsContent: document.querySelector('.results-content'),
            
            // Hotkeys
            hotkeyDisplay: document.getElementById('hotkey-display'),
            hotkeyFeedback: document.getElementById('hotkey-feedback'),
            eventsList: document.getElementById('eventsList'),
            
            // Módulos
            moduleButtons: document.querySelectorAll('.module-btn:not(:disabled)')
        };
        
        this.init();
    }
    
    init() {
        console.log('🔥 MicroForge iniciando...');
        
        // Verificar que los elementos existen
        this.verifyElements();
        
        // Event listeners
        this.setupEventListeners();
        
        // Inicializar display
        this.updateDisplay();
        
        // Cargar progreso guardado
        this.loadProgress();
        
        console.log('⚔️ MicroForge listo para entrenar!');
    }
    
    verifyElements() {
        console.log('🔍 Verificando elementos DOM...');
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                console.warn(`⚠️ Elemento no encontrado: ${key}`);
            } else {
                console.log(`✅ ${key}: encontrado`);
            }
        });
        
        // Verificar botones de módulos específicamente
        const moduleButtons = document.querySelectorAll('.module-btn');
        console.log(`📦 Botones de módulos encontrados: ${moduleButtons.length}`);
        moduleButtons.forEach((btn, index) => {
            console.log(`🔘 Botón ${index + 1}:`, btn.dataset.module || 'sin data-module');
        });
    }
    
    setupEventListeners() {
        console.log('🎮 Configurando event listeners...');
        
        // Controles principales
        this.elements.startBtn?.addEventListener('click', () => {
            console.log('🚀 Botón iniciar clickeado');
            this.startTraining();
        });
        this.elements.pauseBtn?.addEventListener('click', () => {
            console.log('⏸️ Botón pausa clickeado');
            this.pauseTraining();
        });
        this.elements.resetBtn?.addEventListener('click', () => {
            console.log('🔄 Botón reset clickeado');
            this.resetTraining();
        });
        
        // Módulos - usar event delegation más robusto
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('module-btn') && !e.target.disabled) {
                const moduleId = e.target.dataset.module;
                console.log('📦 Módulo seleccionado:', moduleId);
                if (moduleId) {
                    this.selectModule(moduleId);
                } else {
                    console.error('❌ Botón de módulo sin data-module');
                }
            }
        });
        
        // Zona de acción (clicks)
        this.elements.actionZone?.addEventListener('click', (e) => {
            if (this.gameState.isActive && !this.gameState.isPaused) {
                this.handleActionClick(e);
            }
        });
        
        // Hotkeys globales
        document.addEventListener('keydown', (e) => {
            if (this.gameState.isActive && !this.gameState.isPaused) {
                this.handleKeyPress(e);
            }
        });
        
        // Cerrar resultados
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-results')) {
                this.closeResults();
            }
        });
        
        // Compartir resultados
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('share-btn')) {
                this.shareResults();
            }
        });
        
        console.log('✅ Event listeners configurados');
    }
    
    selectModule(moduleId) {
        console.log('🎯 Intentando seleccionar módulo:', moduleId);
        
        if (!this.modules[moduleId]) {
            console.error('❌ Módulo no encontrado:', moduleId);
            console.log('📋 Módulos disponibles:', Object.keys(this.modules));
            return;
        }
        
        this.gameState.currentModule = moduleId;
        this.gameState.duration = this.modules[moduleId].duration;
        
        // Actualizar UI
        this.addEvent('📋', `Módulo seleccionado: ${this.modules[moduleId].name}`);
        if (this.elements.startBtn) {
            this.elements.startBtn.disabled = false;
        }
        
        // Preparar interfaz según el tipo de módulo
        this.prepareModuleInterface(moduleId);
        
        console.log(`✅ Módulo seleccionado: ${this.modules[moduleId].name}`);
    }
    
    prepareModuleInterface(moduleId) {
        const module = this.modules[moduleId];
        const actionZone = this.elements.actionZone;
        
        if (!actionZone) {
            console.error('❌ Zona de acción no encontrada');
            return;
        }
        
        const actionArea = actionZone.querySelector('.action-area') || actionZone;
        
        // Limpiar zona de acción
        actionArea.innerHTML = '';
        
        console.log('🎨 Preparando interfaz para módulo:', module.type);
        
        switch (module.type) {
            case 'clicking':
                actionArea.innerHTML = '<div class="current-challenge">🎯 Haz clic en los jabalíes que aparezcan</div>';
                break;
                
            case 'hotkeys':
                this.setupHotkeyChallenge();
                break;
                
            case 'movement':
                actionArea.innerHTML = '<div class="current-challenge">🏃 Sigue las instrucciones de movimiento</div>';
                break;
                
            case 'combined':
                actionArea.innerHTML = '<div class="current-challenge">⚡ Prepárate para múltiples desafíos</div>';
                break;
                
            case 'speed':
                actionArea.innerHTML = '<div class="current-challenge">💨 Máxima velocidad de clicks</div>';
                break;
                
            default:
                actionArea.innerHTML = '<div class="current-challenge">🎮 Módulo preparado</div>';
        }
    }
    
    startTraining() {
        if (!this.gameState.currentModule) {
            this.addEvent('⚠️', 'Selecciona un módulo primero');
            return;
        }
        
        this.gameState.isActive = true;
        this.gameState.isPaused = false;
        this.gameState.startTime = Date.now();
        
        // Reiniciar stats
        this.resetStats();
        
        // Actualizar controles
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.resetBtn.disabled = false;
        
        // Iniciar timer
        this.startTimer();
        
        // Iniciar módulo específico
        this.startModule(this.gameState.currentModule);
        
        this.addEvent('🚀', 'Entrenamiento iniciado');
        console.log('🔥 Entrenamiento iniciado!');
    }
    
    startModule(moduleId) {
        const module = this.modules[moduleId];
        
        switch (module.type) {
            case 'clicking':
                this.startClickingModule(module);
                break;
                
            case 'hotkeys':
                this.startHotkeyModule(module);
                break;
                
            case 'movement':
                this.startMovementModule(module);
                break;
                
            case 'combined':
                this.startCombinedModule(module);
                break;
                
            case 'speed':
                this.startSpeedModule(module);
                break;
        }
    }
    
    startClickingModule(module) {
        const spawnTarget = () => {
            if (!this.gameState.isActive || this.gameState.isPaused) return;
            
            const target = this.createTarget();
            this.elements.actionZone.appendChild(target);
            
            // Auto-remove después del lifetime
            setTimeout(() => {
                if (target.parentNode) {
                    target.remove();
                    this.gameState.stats.misses++;
                    this.addEvent('❌', 'Objetivo perdido');
                }
            }, module.config.targetLifetime);
        };
        
        // Spawn inicial
        spawnTarget();
        
        // Interval para spawns regulares
        const spawnInterval = setInterval(spawnTarget, module.config.spawnRate);
        this.gameState.intervals.push(spawnInterval);
    }
    
    createTarget() {
        const target = document.createElement('div');
        target.className = 'target';
        target.innerHTML = '🐗'; // Emoji de jabalí
        
        // Posición aleatoria
        const zoneRect = this.elements.actionZone.getBoundingClientRect();
        const maxX = zoneRect.width - 40;
        const maxY = zoneRect.height - 40;
        
        target.style.left = Math.random() * maxX + 'px';
        target.style.top = Math.random() * maxY + 'px';
        
        // Event listener para click
        target.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hitTarget(target);
        });
        
        return target;
    }
    
    hitTarget(target) {
        target.classList.add('hit');
        this.gameState.stats.hits++;
        this.gameState.stats.score += 10;
        
        // Efecto visual
        setTimeout(() => target.remove(), 300);
        
        this.addEvent('🎯', '+10 puntos');
        this.updateDisplay();
    }
    
    startHotkeyModule(module) {
        this.currentSequence = [];
        this.sequenceIndex = 0;
        this.generateNewSequence();
    }
    
    generateNewSequence() {
        const sequences = this.modules[this.gameState.currentModule].config.sequences;
        this.currentSequence = sequences[Math.floor(Math.random() * sequences.length)];
        this.sequenceIndex = 0;
        this.displayCurrentHotkey();
    }
    
    displayCurrentHotkey() {
        const hotkeySpan = this.elements.hotkeyDisplay?.querySelector('.hotkey');
        if (hotkeySpan && this.currentSequence[this.sequenceIndex]) {
            hotkeySpan.textContent = this.currentSequence[this.sequenceIndex].toUpperCase();
        }
    }
    
    setupHotkeyChallenge() {
        const actionArea = this.elements.actionZone.querySelector('.action-area');
        actionArea.innerHTML = `
            <div class="hotkey-display">
                <div class="hotkey-instruction">Presiona la tecla:</div>
                <span class="hotkey" id="current-hotkey">-</span>
                <div class="hotkey-feedback" id="hotkey-feedback"></div>
            </div>
        `;
    }
    
    handleKeyPress(e) {
        if (!this.gameState.isActive || this.gameState.isPaused) return;
        
        const key = e.key.toLowerCase();
        this.gameState.stats.totalActions++;
        
        if (this.gameState.currentModule && this.modules[this.gameState.currentModule].type === 'hotkeys') {
            this.handleHotkeyPress(key);
        }
        
        // Calcular APM
        this.calculateAPM();
    }
    
    handleHotkeyPress(key) {
        const expectedKey = this.currentSequence[this.sequenceIndex];
        const feedback = document.getElementById('hotkey-feedback');
        
        if (key === expectedKey) {
            this.gameState.stats.hits++;
            this.gameState.stats.score += 20;
            
            if (feedback) {
                feedback.textContent = '✅ ¡Correcto!';
                feedback.style.color = 'var(--text-success)';
            }
            
            this.sequenceIndex++;
            
            // Secuencia completada
            if (this.sequenceIndex >= this.currentSequence.length) {
                this.addEvent('🔥', 'Secuencia completada +50 bonus');
                this.gameState.stats.score += 50;
                setTimeout(() => this.generateNewSequence(), 1000);
            } else {
                this.displayCurrentHotkey();
            }
            
        } else {
            this.gameState.stats.misses++;
            
            if (feedback) {
                feedback.textContent = `❌ Esperaba: ${expectedKey.toUpperCase()}`;
                feedback.style.color = 'var(--text-danger)';
            }
            
            this.addEvent('💥', `Error: esperaba ${expectedKey.toUpperCase()}`);
        }
        
        this.updateDisplay();
    }
    
    handleActionClick(e) {
        this.gameState.stats.clicks++;
        this.gameState.stats.totalActions++;
        
        // Si no hay target, es un miss
        if (!e.target.classList.contains('target')) {
            this.gameState.stats.misses++;
            this.showMissIndicator(e.clientX - this.elements.actionZone.getBoundingClientRect().left,
                                  e.clientY - this.elements.actionZone.getBoundingClientRect().top);
        }
        
        this.calculateAPM();
        this.updateDisplay();
    }
    
    showMissIndicator(x, y) {
        const indicator = document.createElement('div');
        indicator.className = 'miss-indicator';
        indicator.textContent = 'MISS';
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        
        this.elements.actionZone.appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 1000);
    }
    
    calculateAPM() {
        const elapsedMinutes = (Date.now() - this.gameState.startTime) / 60000;
        if (elapsedMinutes > 0) {
            this.gameState.stats.apm = Math.round(this.gameState.stats.totalActions / elapsedMinutes);
        }
    }
    
    pauseTraining() {
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.elements.pauseBtn.textContent = 'Reanudar';
            this.addEvent('⏸️', 'Entrenamiento pausado');
        } else {
            this.elements.pauseBtn.textContent = 'Pausar';
            this.addEvent('▶️', 'Entrenamiento reanudado');
        }
    }
    
    resetTraining() {
        this.endTraining();
        this.resetStats();
        this.updateDisplay();
        this.addEvent('🔄', 'Entrenamiento reiniciado');
        
        // Limpiar zona de acción
        const actionArea = this.elements.actionZone.querySelector('.action-area');
        actionArea.innerHTML = '<div class="current-challenge">Selecciona un módulo para comenzar</div>';
    }
    
    endTraining() {
        this.gameState.isActive = false;
        this.gameState.isPaused = false;
        
        // Limpiar intervals
        this.gameState.intervals.forEach(interval => clearInterval(interval));
        this.gameState.intervals = [];
        
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
        
        // Actualizar controles
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.resetBtn.disabled = true;
        this.elements.pauseBtn.textContent = 'Pausar';
        
        // Limpiar targets
        this.elements.actionZone.querySelectorAll('.target').forEach(target => target.remove());
    }
    
    startTimer() {
        let remainingTime = this.gameState.duration;
        
        this.gameState.timer = setInterval(() => {
            if (this.gameState.isPaused) return;
            
            remainingTime--;
            this.elements.timerValue.textContent = remainingTime;
            
            if (remainingTime <= 0) {
                this.finishTraining();
            }
        }, 1000);
    }
    
    finishTraining() {
        this.endTraining();
        this.calculateFinalStats();
        this.showResults();
        this.saveProgress();
        
        this.addEvent('🏁', 'Entrenamiento completado');
    }
    
    calculateFinalStats() {
        const total = this.gameState.stats.hits + this.gameState.stats.misses;
        this.gameState.stats.accuracy = total > 0 ? Math.round((this.gameState.stats.hits / total) * 100) : 0;
    }
    
    showResults() {
        const resultsHTML = `
            <h2 class="results-title">🏆 Resultados del Entrenamiento</h2>
            <div class="results-stats">
                <div class="result-stat">
                    <div class="result-label">Puntuación</div>
                    <div class="result-value">${this.gameState.stats.score}</div>
                </div>
                <div class="result-stat">
                    <div class="result-label">APM</div>
                    <div class="result-value">${this.gameState.stats.apm}</div>
                </div>
                <div class="result-stat">
                    <div class="result-label">Precisión</div>
                    <div class="result-value">${this.gameState.stats.accuracy}%</div>
                </div>
                <div class="result-stat">
                    <div class="result-label">Aciertos</div>
                    <div class="result-value">${this.gameState.stats.hits}</div>
                </div>
            </div>
            <div class="performance-feedback">
                <h3>📊 Análisis de Rendimiento</h3>
                ${this.generatePerformanceFeedback()}
            </div>
            <div class="results-actions">
                <button class="control-btn close-results">Cerrar</button>
                <button class="control-btn share-btn">Compartir</button>
                <button class="control-btn" onclick="forge.resetTraining()">Entrenar de Nuevo</button>
            </div>
        `;
        
        this.elements.resultsContent.innerHTML = resultsHTML;
        this.elements.resultsPanel.classList.remove('hidden');
    }
    
    generatePerformanceFeedback() {
        const { score, apm, accuracy } = this.gameState.stats;
        let feedback = [];
        
        // Análisis de puntuación
        if (score >= 1000) {
            feedback.push('🔥 <strong>Puntuación Excelente:</strong> Tu micro está en nivel profesional!');
        } else if (score >= 500) {
            feedback.push('⭐ <strong>Buena Puntuación:</strong> Estás progresando muy bien.');
        } else {
            feedback.push('💪 <strong>Sigue Practicando:</strong> La constancia es clave para mejorar.');
        }
        
        // Análisis de APM
        if (apm >= 150) {
            feedback.push('⚡ <strong>APM Impresionante:</strong> Tienes la velocidad de un pro player!');
        } else if (apm >= 100) {
            feedback.push('🚀 <strong>APM Sólido:</strong> Tu velocidad está por encima del promedio.');
        } else if (apm >= 60) {
            feedback.push('📈 <strong>APM en Desarrollo:</strong> Practica más para aumentar tu velocidad.');
        } else {
            feedback.push('🎯 <strong>Enfócate en Velocidad:</strong> Intenta ser más rápido en tus acciones.');
        }
        
        // Análisis de precisión
        if (accuracy >= 90) {
            feedback.push('🎯 <strong>Precisión Perfecta:</strong> Tu control es excepcional!');
        } else if (accuracy >= 75) {
            feedback.push('👌 <strong>Buena Precisión:</strong> Mantienes un buen control.');
        } else {
            feedback.push('🎮 <strong>Mejora la Precisión:</strong> Tómate tu tiempo para ser más exacto.');
        }
        
        return '<ul><li>' + feedback.join('</li><li>') + '</li></ul>';
    }
    
    closeResults() {
        this.elements.resultsPanel.classList.add('hidden');
    }
    
    shareResults() {
        const { score, apm, accuracy } = this.gameState.stats;
        const moduleName = this.modules[this.gameState.currentModule]?.name || 'Entrenamiento';
        
        const shareText = `🔥 MicroForge - ${moduleName}
🏆 Puntuación: ${score}
⚡ APM: ${apm}
🎯 Precisión: ${accuracy}%

¡Forja tu micro en webjoma.com! ⚔️`;
        
        if (navigator.share) {
            navigator.share({
                title: 'MicroForge - Resultados',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.addEvent('📋', 'Resultados copiados al portapapeles');
            });
        }
    }
    
    resetStats() {
        this.gameState.stats = {
            score: 0,
            apm: 0,
            accuracy: 0,
            clicks: 0,
            hits: 0,
            misses: 0,
            totalActions: 0
        };
    }
    
    updateDisplay() {
        if (this.elements.scoreValue) this.elements.scoreValue.textContent = this.gameState.stats.score;
        if (this.elements.apmValue) this.elements.apmValue.textContent = this.gameState.stats.apm;
        if (this.elements.accuracyValue) {
            const total = this.gameState.stats.hits + this.gameState.stats.misses;
            const accuracy = total > 0 ? Math.round((this.gameState.stats.hits / total) * 100) : 0;
            this.elements.accuracyValue.textContent = accuracy + '%';
        }
        if (this.elements.timerValue) this.elements.timerValue.textContent = this.gameState.duration;
    }
    
    addEvent(icon, text) {
        if (!this.elements.eventsList) return;
        
        const event = document.createElement('div');
        event.className = 'event-item';
        event.innerHTML = `
            <span class="event-icon">${icon}</span>
            <span class="event-text">${text}</span>
        `;
        
        this.elements.eventsList.insertBefore(event, this.elements.eventsList.firstChild);
        
        // Limitar a 10 eventos
        while (this.elements.eventsList.children.length > 10) {
            this.elements.eventsList.removeChild(this.elements.eventsList.lastChild);
        }
    }
    
    saveProgress() {
        const progress = {
            totalSessions: parseInt(localStorage.getItem('microforge_sessions') || 0) + 1,
            bestScore: Math.max(this.gameState.stats.score, parseInt(localStorage.getItem('microforge_best_score') || 0)),
            bestAPM: Math.max(this.gameState.stats.apm, parseInt(localStorage.getItem('microforge_best_apm') || 0)),
            bestAccuracy: Math.max(this.gameState.stats.accuracy, parseInt(localStorage.getItem('microforge_best_accuracy') || 0))
        };
        
        localStorage.setItem('microforge_sessions', progress.totalSessions);
        localStorage.setItem('microforge_best_score', progress.bestScore);
        localStorage.setItem('microforge_best_apm', progress.bestAPM);
        localStorage.setItem('microforge_best_accuracy', progress.bestAccuracy);
        
        console.log('💾 Progreso guardado:', progress);
    }
    
    loadProgress() {
        const sessions = localStorage.getItem('microforge_sessions');
        if (sessions) {
            this.addEvent('📊', `Sesiones completadas: ${sessions}`);
        }
    }
}

// Módulos adicionales para expandir funcionalidad
class ModuleManager {
    static startMovementModule(module) {
        // Implementar comandos de movimiento
        console.log('🏃 Módulo de movimiento iniciado');
    }
    
    static startCombinedModule(module) {
        // Implementar desafíos combinados
        console.log('⚡ Módulo combinado iniciado');
    }
    
    static startSpeedModule(module) {
        // Implementar test de velocidad
        console.log('💨 Módulo de velocidad iniciado');
    }
}

// Efectos visuales adicionales
class VisualEffects {
    static createExplosion(x, y, element) {
        const explosion = document.createElement('div');
        explosion.style.position = 'absolute';
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';
        explosion.style.fontSize = '2rem';
        explosion.innerHTML = '💥';
        explosion.style.animation = 'explosion 0.5s ease forwards';
        
        element.appendChild(explosion);
        setTimeout(() => explosion.remove(), 500);
    }
    
    static createScoreFloat(score, x, y, element) {
        const scoreFloat = document.createElement('div');
        scoreFloat.style.position = 'absolute';
        scoreFloat.style.left = x + 'px';
        scoreFloat.style.top = y + 'px';
        scoreFloat.style.color = 'var(--forge-gold)';
        scoreFloat.style.fontWeight = 'bold';
        scoreFloat.style.fontSize = '1.2rem';
        scoreFloat.textContent = `+${score}`;
        scoreFloat.style.animation = 'scoreFloat 1s ease forwards';
        
        element.appendChild(scoreFloat);
        setTimeout(() => scoreFloat.remove(), 1000);
    }
}

// CSS animations para efectos
const additionalCSS = `
@keyframes explosion {
    0% { transform: scale(0) rotate(0deg); opacity: 1; }
    100% { transform: scale(2) rotate(180deg); opacity: 0; }
}

@keyframes scoreFloat {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
}
`;

// Inyectar CSS adicional
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Inicializar MicroForge cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.forge = new MicroForge();
    console.log('⚔️ MicroForge cargado y listo para la batalla!');
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MicroForge, ModuleManager, VisualEffects };
}
