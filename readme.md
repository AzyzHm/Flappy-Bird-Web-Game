# Flappy Bird Game Documentation

## Table of Contents

- Overview
- File Structure
- HTML Structure
- CSS Styling
- JavaScript Game Logic
  - Game Initialization
  - Rendering
  - Game Mechanics
  - Event Handling
- Customization
- Credits

---

## Overview

This project is a browser-based implementation of the classic Flappy Bird game using HTML5 Canvas, CSS, and vanilla JavaScript. The player controls a bird, attempting to fly between sets of pipes without hitting them. The game features smooth animations, responsive controls, and a retro-inspired UI.

---

## File Structure

```
index.html      # Main HTML file
style.css       # Game and UI styling
script.js       # Game logic and rendering
readme.md       # Project documentation
```

---

## HTML Structure

The main HTML file sets up the game container, canvas, overlay UI, and includes the script and styles.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <href="style.css" rel="stylesheet">
  <title>Flappy Bird</title>
</head>
<body>
  <div id="gameWrapper">
    <canvas id="canvas"></canvas>
    <div id="score-hud">0</div>
    <div id="overlay">
      <div class="bird-emoji">🐦</div>
      <h1>FLAPPY<br>BIRD</h1>
      <p class="subtitle" id="overlayText">SPACE / CLICK / TAP TO START</p>
      <div class="score-display" id="scoreDisplay"></div>
      <button id="startBtn">PLAY</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

**Key Elements:**
- `#gameWrapper`: Contains the game canvas and overlay UI.
- `#canvas`: The main drawing surface for the game.
- `#score-hud`: Displays the current score during gameplay.
- `#overlay`: Shown before the game starts and after game over, includes title, instructions, score, and play button.

---

## CSS Styling

The CSS provides a retro, pixel-art inspired look and ensures the game is responsive and visually appealing.

**Highlights:**
- Uses the "Press Start 2P" font for a retro feel.
- Full-screen, dark background with a starry sky effect.
- Overlay with semi-transparent background for menus.
- Animated bird emoji on the overlay.
- Styled play button with hover and active effects.
- Responsive scaling for all UI elements.

**Example:**
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

html, body {
  width: 100%; height: 100%;
  background: #0d0d1a;
  overflow: hidden;
  font-family: 'Press Start 2P', monospace;
}

#gameWrapper { position: relative; width: 100%; height: 100%; }
canvas { display: block; width: 100%; height: 100%; }
#overlay { /* Centered overlay styles */ }
#score-hud { /* Score display styles */ }
.bird-emoji { /* Animated emoji */ }
#startBtn { /* Play button styles */ }
```

---

## JavaScript Game Logic

All game logic, rendering, and event handling are implemented in script.js.

### Game Initialization

- **Canvas Setup:** The canvas is dynamically resized to fit the window.
- **Game State:** Variables track the bird, pipes, score, best score, and animation frames.
- **Responsive Design:** The game resizes and recalculates all dimensions on window resize.

### Rendering

- **Background:** Gradient sky, animated stars, and moving clouds.
- **Ground:** Animated ground with slab joints and speckle effects.
- **Pipes:** Randomly generated, colored pipes with highlights and shadows.
- **Bird:** Drawn as an ellipse with animated wing and eye, rotates based on velocity.
- **Particles:** Burst and jump effects for visual feedback.

### Game Mechanics

- **Gravity & Jump:** The bird is affected by gravity and can jump (flap) to move upward.
- **Pipes:** Spawn at intervals, move leftward, and are removed when off-screen.
- **Collision Detection:** Checks for collisions with pipes and ground/ceiling.
- **Score:** Increments when the bird passes a pipe; best score is tracked.
- **Game Over:** Triggers particle burst, screen shake, and shows overlay with score.

### Event Handling

- **Start/Retry:** Clicking the play button or overlay starts/restarts the game.
- **Controls:** Spacebar, mouse click, or touch triggers a jump.
- **Resize:** The game resizes and recalculates positions on window resize.

**Key Functions:**
- `initGame()`: Resets game state for a new round.
- `gameLoop()`: Main animation loop, handles updates and rendering.
- `jump()`: Makes the bird jump.
- `die()`: Handles game over logic.
- `checkCollision(p)`: Detects collisions with pipes.
- `burst()`, `updateParticles()`: Particle effects for feedback.

---

## Customization

- **Difficulty:** Adjust the gap size, pipe speed, or gravity in the constants section of script.js.
- **Graphics:** Modify the drawing functions for custom bird, pipe, or background styles.
- **Controls:** Add or change event listeners for different input methods.

---

## Credits

- **Font:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) by Codeman38
- **Original Game:** Flappy Bird by Dong Nguyen
- **Implementation:** This project is a custom JavaScript/Canvas recreation.

---

**Enjoy playing and customizing your Flappy Bird game!**