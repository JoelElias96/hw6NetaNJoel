# HW6 – Interactive Basketball Shooting Game with Physics

**Authors:** Joel Elias (ID: 313914699) & Neta Nakdimon (ID: 322216128)  
**Course:** Computer Graphics - Spring Semester 2025

---

## 🎬 Demonstration

### Moving the Ball & Power Control
![Moving the Ball](media/Mooving.gif)

### Shooting & Resetting
![Shooting](media/Shooting.gif)

### Camera Control
![Camera Control](media/Camara.gif)

### Scoring a Basket
![Scoring](media/Scooring.gif)

---

## Overview
This project is a fully interactive, physics-based basketball shooting game built with THREE.js. It features:
- Realistic basketball court and hoops
- Physics-based ball movement and shooting
- Ball rotation and bounce mechanics
- Comprehensive scoring and statistics
- Enhanced UI and visual feedback

## Features

### 🏀 Physics-Based Basketball Movement
- Realistic gravity and parabolic arc
- Ball bounces with energy loss
- Ground, rim, and backboard collision detection
- Ball can be moved and shot anywhere on the court

### 🎮 Interactive Controls
- **Arrow Keys:** Move basketball (left/right/forward/back)
- **W/S:** Adjust shot power (0-100%)
- **Spacebar:** Shoot basketball
- **R:** Reset ball to center
- **O:** Toggle orbit camera

### 🔄 Basketball Animation
- Ball rotates during movement and flight
- Rotation axis matches movement direction
- Rotation speed proportional to velocity
- Smooth transitions

### 📊 Scoring System
- Real-time score tracking and display
- Shot attempt counter
- Shot accuracy percentage
- Visual feedback for made/missed shots
- Score display updates immediately

### 🖥️ Enhanced User Interface
- Live score, attempts, accuracy, and power
- Control instructions panel
- Game status messages (shot made/missed)
- Visual effects for successful shots

## Physics System
- **Gravity:** Custom-tuned for visual, slow, and realistic arcs
- **Trajectory:** Calculated with real projectile motion equations
- **Collisions:** Ball bounces up off rim/backboard, falls through net on score
- **Magnetic guidance:** Subtle, helps ball find the basket

## How to Run
1. `npm install`
2. `npm start`
3. Open [http://localhost:8000](http://localhost:8000)

## Controls Reference
| Key         | Action                        |
|-------------|------------------------------|
| Arrow Keys  | Move basketball              |
| W/S         | Adjust shot power            |
| Spacebar    | Shoot basketball             |
| R           | Reset ball position          |
| O           | Toggle orbit camera          |

## Grading & Requirements
- All HW6 requirements are met (see instructions)
- Physics, controls, animation, scoring, and UI are all implemented
- Visual swish, realistic bounces, and beautiful arcs
- See the GIFs above for demonstration

## Authors
Joel Elias (ID: 313914699) & Neta Nakdimon (ID: 322216128)

---

**Assignment:** HW6 - Interactive Basketball Shooting Game with Physics  
**Due Date:** July 27, 2025, 23:59

---

**Group 3 "Miluim"**
