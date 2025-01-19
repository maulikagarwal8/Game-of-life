import React from 'react';
import './Game.css';

const CELL_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 600;

// // According to Wikipedia, the Game of Life has four rules:
// // Any live cell with fewer than two live neighbors dies, as if caused by under population.
// // Any live cell with two or three live neighbors lives on to the next generation.
// // Any live cell with more than three live neighbors dies, as if by overpopulation.
// // Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

class Game extends React.Component {  
    constructor() {    
        super();    
        this.rows = HEIGHT / CELL_SIZE;    
        this.cols = WIDTH / CELL_SIZE;    
        this.board = this.makeEmptyBoard();  
    }
    state = {    
        cells: [],    
        interval: 100,    
        isRunning: false, 
        theme: 'light', 
        allpreset:[],
    }
    toggleTheme = () => {
        this.setState((prevState) => ({
            theme: prevState.theme === 'light' ? 'dark' : 'light',
        }));
    }
    runGame = () => {    
        this.setState({ isRunning: true });    
        this.runIteration();  
    }
    stopGame = () => {    
        this.setState({ isRunning: false });    
        if (this.timeoutHandler) {      
            window.clearTimeout(this.timeoutHandler);      
            this.timeoutHandler = null;    
        }  
    }
    handleIntervalChange = (event) => {    
        this.setState({ interval: event.target.value });  
    }
    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.setState({ cells: this.makeCells() });
    }
    handleRandom = () => {
        for (let x = 0; x < this.rows; x++) {
            for (let y = 0; y < this.cols; y++) {
                this.board[x][y] = (Math.random() >= 0.5);
            }
        }

        this.setState({ cells: this.makeCells() });
    }
    handlePreset = () => {
        this.setState(prevState => ({
            allpreset: [...prevState.allpreset, this.board],
        }));
    }
    handleLoad_Preset=()=>{
        if (this.state.allpreset.length === 0) {
            alert("No presets available!");
            return;
        }
        this.board = this.state.allpreset[Math.floor(Math.random() * this.state.allpreset.length)];
        this.setState({ cells: this.makeCells() });
    }
    handleClick = (event) => {    
        const elemOffset = this.getElementOffset();    
        const offsetX = event.clientX - elemOffset.x;    
        const offsetY = event.clientY - elemOffset.y;        
        const x = Math.floor(offsetX / CELL_SIZE);    
        const y = Math.floor(offsetY / CELL_SIZE);
        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }
        this.setState({ cells: this.makeCells() });  
    }
    runIteration() {    
        let newBoard = this.makeEmptyBoard();
        for (let y = 0; y < this.rows; y++) {  
            for (let x = 0; x < this.cols; x++) {    
                let neighbors = this.calculateNeighbors(this.board, x, y);    
                if (this.board[y][x]) {  
                    if (neighbors === 2 || neighbors === 3) {        
                        newBoard[y][x] = true;      
                    } 
                    else {        
                        newBoard[y][x] = false;      
                    }    
                } 
                else {      
                    if (!this.board[y][x] && neighbors === 3) {        
                        newBoard[y][x] = true;      
                    }    
                }  
            }
        }
        this.board = newBoard;    
        this.setState({ cells: this.makeCells() });
        this.timeoutHandler = window.setTimeout(() => {this.runIteration();},this.state.interval);  
    }
    calculateNeighbors(board, x, y) {
        let neighbors = 0;
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let y1 = y + dir[0];
            let x1 = x + dir[1];
            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;
            }
        }
        return neighbors;
    }
    makeEmptyBoard() {    
        let board = [];    
        for (let y = 0; y < this.rows; y++) {      
            board[y] = [];      
            for (let x = 0; x < this.cols; x++) {        
                board[y][x] = false;     
            }    
        }    
        return board;  
    }
    makeCells() {    
        let cells = [];    
        for (let y = 0; y < this.rows; y++) {      
            for (let x = 0; x < this.cols; x++) {        
                if (this.board[y][x]) {          
                    cells.push({ x, y });        
                }      
            }    
        }    
        return cells;  
    }
    getElementOffset() {    
        const rect = this.boardRef.getBoundingClientRect();    
        return {
            x: rect.left,
            y: rect.top,
        };
    }
    render() {    
        const { cells,isRunning,theme } = this.state;    
        return ( 
            <>
                <div className={`Screen ${theme}`}>  
                    <h1>Game of life</h1> 
                    <div className={`Game ${theme}`}>        
                        <div className={`Board ${theme}`} style={{ width:WIDTH, height:HEIGHT,backgroundSize:`${CELL_SIZE}px ${CELL_SIZE}px`}}          
                                        onClick={this.handleClick} ref={(n) => { this.boardRef = n; }}>          
                                        {cells.map(cell => (            
                                            <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`}/>          
                            ))}        
                        </div>              
                    </div>
                    <div className="controls">
                        <button className="button" onClick={this.toggleTheme}>Toggle Theme</button>
                        <button className="button btrun" onClick={this.runGame} disabled={isRunning}>Run</button>
                        <button className="button btstop" onClick={this.stopGame} disabled={!isRunning}>Stop</button>
                        <button className="button" onClick={this.handleRandom}>Random</button>
                        <button className="button" onClick={this.handleClear}>Clear</button>
                        <button className="button" onClick={this.handlePreset}>Save Preset</button>
                        <button className="button" onClick={this.handleLoad_Preset}>Load Preset</button>
                    </div>
                    <div className={`uplabel ${theme}`}>
                        <label>
                            Update every <input className="interval" type="number" value={this.state.interval} onChange={this.handleIntervalChange} /> ms
                        </label>
                    </div>
                </div>  
            </>
        );  
    }
}

class Cell extends React.Component {  
    render() {    
        const { x, y } = this.props;    
        return (      
            <div className="Cell" style={{left: `${CELL_SIZE * x + 1}px`,top: `${CELL_SIZE * y + 1}px`,
                                        width: `${CELL_SIZE - 1}px`,height: `${CELL_SIZE - 1}px`,}} />    
        );  
    }
}

export default Game;
