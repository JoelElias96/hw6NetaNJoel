# HW05 - Interactive Basketball Court Infrastructure

![Basketball Arena Demo](media/NetaJoelBasketball.gif)

## Group Members
- Neta Nakdimon
- Joel Elias

## Project Description
This project implements the infrastructure layer for an interactive 3D basketball court using WebGL and Three.js (HW05). It serves as the foundation for HW06, where ball physics, scoring logic, and full gameplay will be added.

## How to Run
1. Install Node.js (v18 LTS or newer)
2. Clone/open the repository and navigate to the project directory:
   ```bash
   cd hw05Graphics2025Students
   ```
3. Install dependencies and start the local server:
   ```bash
   npm install    # first time only
   npm run dev    # vite dev-server on :5173
   ```
4. Open `http://localhost:5173` in your browser

## Technical Implementation

### Core Components

#### 1. Basketball Court Creation
The court is built with proper 2:1 proportions (30x15 units) and includes all regulation markings:

```javascript
function createBasketballCourt() {
  // Court floor - brown wooden color with 2:1 proportions
  const courtLength = 30;
  const courtWidth = 15;
  const courtGeometry = new THREE.BoxGeometry(courtLength, 0.2, courtWidth);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xc68642,  // Brown wood color
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  court.position.y = -0.1;
  scene.add(court);
  
  // Court markings implementation...
}
```

#### 2. Basketball Hoop Assembly
Complete hoop construction with all required components:

```javascript
function createBasketballHoop(xPosition, direction) {
  const hoopGroup = new THREE.Group();
  
  // Support pole (behind backboard)
  const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(xPosition + (direction * 3), 6, 0);
  pole.castShadow = true;
  hoopGroup.add(pole);
  
  // Backboard, rim, and net implementation...
  scene.add(hoopGroup);
}
```

#### 3. Three-Point Arc Implementation
Accurate curved three-point lines using proper geometry:

```javascript
function createThreePointLine(basketX, direction) {
  const arcGeometry = new THREE.RingGeometry(5.8, 6.2, 32, 1, -Math.PI/2, Math.PI);
  const arcMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const arc = new THREE.Mesh(arcGeometry, arcMaterial);
  
  // Positioning and rotation logic...
  scene.add(arc);
}
```

### Stadium Environment Features
- **Bleachers**: 8-row stadium seating on both sides with 15 seats per row
- **Physical Scoreboard**: 3D scoreboard positioned behind the basket showing HOME/AWAY scores
- **Support Structures**: Realistic pole and arm support for the scoreboard
- **LED Lighting**: Decorative lights around the scoreboard perimeter
- **Realistic Materials**: Alternating blue seat colors and proper stadium atmosphere

## Controls
- **O Key**: Toggle orbit camera controls on/off
- **Mouse Controls** (when orbit is enabled):
  - Left click + drag: Rotate camera
  - Right click + drag: Pan camera
  - Scroll wheel: Zoom in/out

## Architecture Highlights
- **Modular Design**: Each component (court, hoops, ball, stadium) created by separate functions
- **Realistic Proportions**: All measurements follow basketball regulation standards
- **Enhanced Lighting**: Professional shadow mapping with high-resolution shadows
- **Material Realism**: Proper transparency, shininess, and color values
- **Performance Optimized**: Efficient geometry creation and grouped objects

## Additional Features
- Enhanced shadow quality with soft shadows
- Realistic court proportions and measurements
- Professional UI design with clean styling
- Responsive design for different screen sizes
- Comprehensive net geometry with multiple line segments
- Proper material properties for realistic appearance

## Known Limitations
- This is the infrastructure version (HW05) - interactive ball physics will be added in HW06
- Net segments are static (physics-based net movement will be implemented later)
- No collision detection yet (planned for HW06)

## External Assets
- Three.js r128 (CDN)
- OrbitControls.js (included in project)
- No external textures or models used - all geometry created programmatically

## Future Development (HW06)
The current infrastructure is designed to support the following features in the next assignment:
- Interactive basketball shooting mechanics
- Physics-based ball movement and collision detection
- Scoring system with basket detection
- Ball rotation animations
- Additional camera control modes
- Enhanced UI interactions

---

**Project completed for Computer Graphics Course - Spring Semester 2025**
