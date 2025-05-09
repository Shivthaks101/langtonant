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

        this.initializeGrid();
        this.setupEventListeners();
        this.updateAntCount();
    }

    generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    }

    addAnt() {
        const cols = Math.floor(this.canvas.width / this.cellSize);
        const rows = Math.floor(this.canvas.height / this.cellSize);
        
        const newAnt = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows),
            direction: Math.floor(Math.random() * 4),
            color: this.generateRandomColor()
        };
        
        this.ants.push(newAnt);
        this.updateAntCount();
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

        startBtn.addEventListener('click', () => this.start());
        stopBtn.addEventListener('click', () => this.stop());
        resetBtn.addEventListener('click', () => this.reset());
        speedSlider.addEventListener('input', (e) => {
            this.speed = e.target.value;
        });
        addAntBtn.addEventListener('click', () => this.addAnt());

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
        if (this.isMusicPlaying) {
            this.bgMusic.pause();
            this.musicToggle.textContent = '🎵 Play Music';
            this.musicToggle.classList.remove('playing');
        } else {
            this.bgMusic.play();
            this.musicToggle.textContent = '🎵 Pause Music';
            this.musicToggle.classList.add('playing');
        }
        this.isMusicPlaying = !this.isMusicPlaying;
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