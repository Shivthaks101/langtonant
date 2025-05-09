class LangtonsAnt {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 4; // Size of each cell in pixels
        this.grid = [];
        this.ants = [
            {
                x: Math.floor(canvas.width / (3 * this.cellSize)),
                y: Math.floor(canvas.height / (3 * this.cellSize)),
                direction: 0,
                color: '#ff0000' // Red
            },
            {
                x: Math.floor(canvas.width * 2 / (3 * this.cellSize)),
                y: Math.floor(canvas.height / (3 * this.cellSize)),
                direction: 1,
                color: '#0000ff' // Blue
            },
            {
                x: Math.floor(canvas.width / (3 * this.cellSize)),
                y: Math.floor(canvas.height * 2 / (3 * this.cellSize)),
                direction: 2,
                color: '#00ff00' // Green
            },
            {
                x: Math.floor(canvas.width * 2 / (3 * this.cellSize)),
                y: Math.floor(canvas.height * 2 / (3 * this.cellSize)),
                direction: 3,
                color: '#ff00ff' // Magenta
            }
        ];
        this.isRunning = false;
        this.animationId = null;
        this.speed = 50;
        this.bgMusic = document.getElementById('bgMusic');
        this.musicToggle = document.getElementById('musicToggle');
        this.isMusicPlaying = false;
        this.antCountDisplay = document.getElementById('antCount');
        this.modal = document.getElementById('placementModal');
        this.manualControls = document.getElementById('manualPlacementControls');
        this.isManualPlacement = false;

        this.initializeGrid();
        this.setupEventListeners();
        this.updateAntCount();
        this.setupAudioHandling();
    }

    setupAudioHandling() {
        const audio = document.getElementById('bgMusic');
        const musicBtn = document.getElementById('musicToggle');
        
        // Set audio properties
        audio.loop = true;
        audio.volume = 0.5;
        
        // Handle audio loading
        audio.addEventListener('canplaythrough', () => {
            musicBtn.style.display = 'block';
            musicBtn.textContent = '🎵 Play Music';
        });

        audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            musicBtn.style.display = 'none';
            alert('Audio playback is not available. This might be due to browser settings or extensions.');
        });

        // Handle play/pause
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            musicBtn.textContent = '🎵 Pause Music';
                        })
                        .catch(error => {
                            console.error('Playback failed:', error);
                            musicBtn.style.display = 'none';
                            alert('Audio playback was blocked. Please check your browser settings or disable ad blockers.');
                        });
                }
            } else {
                audio.pause();
                musicBtn.textContent = '🎵 Play Music';
            }
        });
    }

    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }

    showPlacementModal() {
        this.modal.classList.add('active');
        this.manualControls.style.display = 'none';
    }

    hidePlacementModal() {
        this.modal.classList.remove('active');
        this.canvas.classList.remove('placement-mode');
        this.isManualPlacement = false;
        this.manualControls.style.display = 'none';
    }

    addAnt(x, y, direction) {
        const newAnt = {
            x: x,
            y: y,
            direction: direction,
            color: this.generateRandomColor()
        };
        
        this.ants.push(newAnt);
        this.updateAntCount();
    }

    addRandomAnt() {
        const cols = Math.floor(this.canvas.width / this.cellSize);
        const rows = Math.floor(this.canvas.height / this.cellSize);
        
        this.addAnt(
            Math.floor(Math.random() * cols),
            Math.floor(Math.random() * rows),
            Math.floor(Math.random() * 4)
        );
    }

    startManualPlacement() {
        this.manualControls.style.display = 'block';
        this.canvas.classList.add('placement-mode');
        this.isManualPlacement = true;
        this.modal.classList.remove('active');
    }

    handleCanvasClick(event) {
        if (!this.isManualPlacement) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const x = Math.floor(((event.clientX - rect.left) * scaleX) / this.cellSize);
        const y = Math.floor(((event.clientY - rect.top) * scaleY) / this.cellSize);
        const direction = parseInt(document.getElementById('antDirection').value);

        if (x >= 0 && x < Math.floor(this.canvas.width / this.cellSize) &&
            y >= 0 && y < Math.floor(this.canvas.height / this.cellSize)) {
            this.addAnt(x, y, direction);
            this.hidePlacementModal();
        }
    }

    updateAntCount() {
        this.antCountDisplay.textContent = `Current Ants: ${this.ants.length}`;
    }

    initializeGrid() {
        const cols = Math.floor(this.canvas.width / this.cellSize);
        const rows = Math.floor(this.canvas.height / this.cellSize);
        
        this.grid = Array(rows).fill().map(() => Array(cols).fill(0));
    }

    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');
        const speedSlider = document.getElementById('speed');
        const addAntBtn = document.getElementById('addAntBtn');
        const randomPlacementBtn = document.getElementById('randomPlacement');
        const manualPlacementBtn = document.getElementById('manualPlacement');
        const cancelPlacementBtn = document.getElementById('cancelPlacement');

        startBtn.addEventListener('click', () => this.start());
        stopBtn.addEventListener('click', () => this.stop());
        resetBtn.addEventListener('click', () => this.reset());
        speedSlider.addEventListener('input', (e) => {
            this.speed = e.target.value;
        });
        addAntBtn.addEventListener('click', () => this.showPlacementModal());
        randomPlacementBtn.addEventListener('click', () => {
            this.addRandomAnt();
            this.hidePlacementModal();
        });
        manualPlacementBtn.addEventListener('click', () => this.startManualPlacement());
        cancelPlacementBtn.addEventListener('click', () => this.hidePlacementModal());
        
        this.canvas.removeEventListener('click', this.handleCanvasClick);
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

        // Music controls
        this.musicToggle.addEventListener('click', () => this.toggleMusic());

        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = 500;
            this.initializeGrid();
            this.draw();
        });

        // Set initial canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = 500;
    }

    toggleMusic() {
        try {
            if (this.isMusicPlaying) {
                this.bgMusic.pause();
            } else {
                const playPromise = this.bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log('Playback failed:', error);
                        this.musicToggle.style.display = 'none';
                    });
                }
            }
        } catch (error) {
            console.log('Music toggle error:', error);
            this.musicToggle.style.display = 'none';
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.stop();
        this.initializeGrid();
        this.ants = [
            {
                x: Math.floor(this.canvas.width / (3 * this.cellSize)),
                y: Math.floor(this.canvas.height / (3 * this.cellSize)),
                direction: 0,
                color: '#ff0000'
            },
            {
                x: Math.floor(this.canvas.width * 2 / (3 * this.cellSize)),
                y: Math.floor(this.canvas.height / (3 * this.cellSize)),
                direction: 1,
                color: '#0000ff'
            },
            {
                x: Math.floor(this.canvas.width / (3 * this.cellSize)),
                y: Math.floor(this.canvas.height * 2 / (3 * this.cellSize)),
                direction: 2,
                color: '#00ff00'
            },
            {
                x: Math.floor(this.canvas.width * 2 / (3 * this.cellSize)),
                y: Math.floor(this.canvas.height * 2 / (3 * this.cellSize)),
                direction: 3,
                color: '#ff00ff'
            }
        ];
        this.updateAntCount();
        this.draw();
    }

    animate() {
        if (!this.isRunning) return;

        // Move ant multiple times based on speed
        const steps = Math.floor(this.speed / 10) + 1;
        for (let i = 0; i < steps; i++) {
            this.moveAnts();
        }

        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    moveAnts() {
        this.ants.forEach(ant => {
            const currentCell = this.grid[ant.y][ant.x];
            
            // Turn based on current cell color
            if (currentCell === 0) { // White cell
                ant.direction = (ant.direction + 1) % 4; // Turn right
            } else { // Black cell
                ant.direction = (ant.direction + 3) % 4; // Turn left
            }

            // Flip the color
            this.grid[ant.y][ant.x] = 1 - currentCell;

            // Move forward
            switch (ant.direction) {
                case 0: // Up
                    ant.y = (ant.y - 1 + this.grid.length) % this.grid.length;
                    break;
                case 1: // Right
                    ant.x = (ant.x + 1) % this.grid[0].length;
                    break;
                case 2: // Down
                    ant.y = (ant.y + 1) % this.grid.length;
                    break;
                case 3: // Left
                    ant.x = (ant.x - 1 + this.grid[0].length) % this.grid[0].length;
                    break;
            }
        });
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === 1) {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }

        // Draw ants
        this.ants.forEach(ant => {
            this.ctx.fillStyle = ant.color;
            this.ctx.fillRect(
                ant.x * this.cellSize,
                ant.y * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        });
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('antCanvas');
    const simulation = new LangtonsAnt(canvas);
}); 
