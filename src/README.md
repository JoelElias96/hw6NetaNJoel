# Exercise 6 – Interactive Basketball Shooting Game with Physics

**Authors:** Joel Elias & Neta Nakdimon  
**Course:** Computer Graphics - Spring Semester 2025

## Overview
This exercise extends HW05 basketball court infrastructure by implementing interactive controls, physics-based movement, realistic basketball shooting mechanics, rotation animations, and a comprehensive scoring system. This transforms the static 3D basketball court into a fully interactive shooting game.

## Implemented Features

### 🏀 **Physics-Based Basketball Movement**
- Realistic gravity simulation affecting basketball trajectory
- Proper parabolic arc physics for basketball shots  
- Ball bouncing mechanics with energy loss
- Ground collision detection and response
- Hoop/rim collision detection for successful shots

### 🎮 **Interactive Basketball Controls**
- **Arrow Keys**: Move basketball horizontally (left/right, forward/backward)
- **W/S Keys**: Adjust shot power (0-100% with visual feedback)
- **Spacebar**: Shoot basketball toward nearest hoop
- **R Key**: Reset basketball position to center court
- **O Key**: Toggle orbit camera controls (inherited from HW05)

### 🎯 **Basketball Rotation Animations**
- Realistic ball rotation during movement and flight
- Rotation axis matches movement direction
- Rotation speed proportional to ball velocity
- Smooth rotation transitions with basketball spin effects

### 📊 **Comprehensive Scoring System**
- Real-time score tracking and display (2 points per successful shot)
- Shot attempt counter
- Shot accuracy percentage calculation  
- Score display updated immediately upon successful shots
- Visual feedback for successful/missed shots ("SHOT MADE!" vs "MISSED SHOT")

### 🖥️ **Enhanced User Interface**
- Live display of current score
- Shot attempts and accuracy statistics
- Current shot power indicator
- Control instructions panel
- Game status messages (shot made/missed)
- Ball flight status indicator

## Technical Implementation

### Physics System
- **Gravity**: Constant downward acceleration (-0.8 scaled units)
- **Trajectory**: Parabolic path calculation based on shot angle and power
- **Collision Detection**: Ball-to-ground and ball-to-rim collision
- **Energy Loss**: Realistic bounce damping (0.6 coefficient of restitution)
- **Bounce Limiting**: Maximum 8 bounces to prevent infinite bouncing

### Shot Mechanics  
- Adjustable shot power affecting initial velocity
- Automatic targeting of nearest hoop
- Enhanced trajectory calculation ensuring ball can reach hoops
- Proper arc height requirement for successful shots
- Strict scoring detection (ball must pass through rim area while moving downward)

### Visual Features
- Stadium environment with bleachers
- 3D physical scoreboard
- Realistic basketball court with proper markings
- Court boundaries preventing ball from leaving play area
- Real-time UI updates with color-coded feedback

## How to Run

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm start
   ```

3. **Open Browser:**
   Navigate to `http://localhost:8000`

## Controls Reference

| Control | Function | Details |
|---------|----------|---------|
| **Arrow Keys** | Move Basketball | Left/Right/Forward/Backward movement with boundary checking |
| **W/S Keys** | Adjust Shot Power | Increase/Decrease power (0-100%) with visual indicator |
| **Spacebar** | Shoot Basketball | Launch ball toward nearest hoop with physics trajectory |
| **R Key** | Reset Basketball | Return ball to center court, reset power to 50% |
| **O Key** | Toggle Camera | Enable/disable orbit camera controls |

## Scoring System

- **Points per Shot**: 2 points for successful shots
- **Shot Detection**: Ball must pass through hoop area while moving downward
- **Statistics Tracked**: 
  - Total Score
  - Shots Made / Shot Attempts  
  - Shooting Accuracy Percentage
- **Visual Feedback**: Color-coded messages for made/missed shots

## Implementation Phases Completed

✅ **Phase 1**: Basic Movement Controls  
✅ **Phase 2**: Shot Power System  
✅ **Phase 3**: Physics and Shooting  
✅ **Phase 4**: Collision and Bouncing  
✅ **Phase 5**: Rotation Animation  
✅ **Phase 6**: Scoring System  
✅ **Phase 7**: UI Enhancement  

## Technical Requirements Met

- ✅ All objects cast and receive shadows properly
- ✅ Physics implementation looks realistic with proper trajectory
- ✅ Responsive design that handles window resizing
- ✅ Smooth 60 FPS performance maintained
- ✅ Accurate collision detection for fair gameplay
- ✅ Comprehensive user interface with real-time updates

## Dependencies

- **Three.js** (r128): 3D graphics library
- **Express.js**: Development server
- **OrbitControls**: Camera control system

## File Structure

```
hw6NetaNJoel/
├── index.html              # Main HTML file with enhanced UI
├── index.js                # Express server configuration  
├── package.json            # Node.js dependencies
├── src/
│   ├── hw6.js              # Main game implementation
│   ├── OrbitControls.js    # Camera controls
│   └── README.md           # This file
└── media/
    └── NetaJoelBasketball.gif  # Demo gameplay video
```

## Known Features

- Ball physics provide realistic basketball shooting experience
- Automatic targeting finds nearest hoop for shots
- Court boundaries keep gameplay within basketball court area
- Enhanced trajectory calculation ensures ball can reach both hoops
- Comprehensive statistics tracking for competitive gameplay

## Future Enhancements (Optional Bonus Features)

- Multiple game modes (timed challenges, etc.)
- Sound effects for shots, bounces, and scores
- Ball trail effects during flight
- Advanced physics (air resistance, wind simulation)
- Local leaderboard system
- Swish detection for bonus points

---

**Assignment**: HW6 - Interactive Basketball Shooting Game with Physics  
**Due Date**: July 6, 2025, 23:59  
**Submission**: GitHub repository with complete source code and demonstration video