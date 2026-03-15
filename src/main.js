/**
 * Entry point — bootstraps the game once the DOM is ready.
 */
import { Game } from './Game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
game.start();
