import {OrbitControls} from './OrbitControls.js'

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color to solid gray
scene.background = new THREE.Color(0x404040);

// Enhanced lighting setup with shadows
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(20, 30, 20);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

function degrees_to_radians(degrees) {
  return degrees * (Math.PI / 180);
}

// Create basketball court with all required markings
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
  
  // Create court lines (white)
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lineHeight = 0.05;
  
  // Center line
  const centerLineGeometry = new THREE.BoxGeometry(0.2, lineHeight, courtWidth);
  const centerLine = new THREE.Mesh(centerLineGeometry, lineMaterial);
  centerLine.position.set(0, lineHeight/2, 0);
  scene.add(centerLine);
  
  // Court boundaries
  const boundaryThickness = 0.2;
  
  // Long sides
  const longBoundaryGeometry = new THREE.BoxGeometry(courtLength, lineHeight, boundaryThickness);
  const longBoundary1 = new THREE.Mesh(longBoundaryGeometry, lineMaterial);
  longBoundary1.position.set(0, lineHeight/2, courtWidth/2);
  scene.add(longBoundary1);
  
  const longBoundary2 = new THREE.Mesh(longBoundaryGeometry, lineMaterial);
  longBoundary2.position.set(0, lineHeight/2, -courtWidth/2);
  scene.add(longBoundary2);
  
  // Short sides
  const shortBoundaryGeometry = new THREE.BoxGeometry(boundaryThickness, lineHeight, courtWidth);
  const shortBoundary1 = new THREE.Mesh(shortBoundaryGeometry, lineMaterial);
  shortBoundary1.position.set(courtLength/2, lineHeight/2, 0);
  scene.add(shortBoundary1);
  
  const shortBoundary2 = new THREE.Mesh(shortBoundaryGeometry, lineMaterial);
  shortBoundary2.position.set(-courtLength/2, lineHeight/2, 0);
  scene.add(shortBoundary2);
  
  // Center circle
  const centerCircleGeometry = new THREE.RingGeometry(2.8, 3, 32);
  const centerCircleMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const centerCircle = new THREE.Mesh(centerCircleGeometry, centerCircleMaterial);
  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.y = 0.02;
  scene.add(centerCircle);
  
  // Three-point lines (curved arcs at both ends)
  createThreePointLine(13, 1); // Right side
  createThreePointLine(-13, -1); // Left side
}

// Create perfect three-point line arc positioned correctly
function createThreePointLine(basketX, direction) {
  // Create the arc using ring geometry with proper positioning
  const arcGeometry = new THREE.RingGeometry(5.8, 6.2, 32, 1, -Math.PI/2, Math.PI);
  const arcMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const arc = new THREE.Mesh(arcGeometry, arcMaterial);
  
  // Position and rotate correctly for basketball court
  arc.rotation.x = -Math.PI / 2; // Lay flat on court
  arc.rotation.z = direction > 0 ? Math.PI : 0; // Face correct direction (flipped)
  
  // Position at basket location, shifted toward baseline
  const baselineOffset = direction * 1.5; // Distance from basket to arc center
  arc.position.set(basketX + baselineOffset, 0.02, 0);
  
  scene.add(arc);
}

// Create basketball hoop with all components
function createBasketballHoop(xPosition, direction) {
  const hoopGroup = new THREE.Group();
  
  // Support pole (behind backboard)
  const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(xPosition + (direction * 3), 6, 0);
  pole.castShadow = true;
  hoopGroup.add(pole);
  
  // Support arm connecting pole to backboard
  const armGeometry = new THREE.BoxGeometry(3, 0.3, 0.3);
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.position.set(xPosition + (direction * 1.5), 10, 0);
  arm.castShadow = true;
  hoopGroup.add(arm);
  
  // Backboard (white, partially transparent)
  const backboardGeometry = new THREE.BoxGeometry(0.2, 3.5, 2.5);
  const backboardMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  backboard.position.set(xPosition, 10, 0);
  backboard.castShadow = true;
  hoopGroup.add(backboard);
  
  // Rim (orange)
  const rimGeometry = new THREE.TorusGeometry(0.9, 0.05, 8, 32);
  const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.position.set(xPosition - (direction * 0.6), 10, 0);
  rim.rotation.x = Math.PI / 2;
  rim.castShadow = true;
  hoopGroup.add(rim);
  
  // Net (created with line segments)
  createNet(xPosition - (direction * 0.6), 10, hoopGroup);
  
  scene.add(hoopGroup);
}

// Create net using line segments
function createNet(x, y, parentGroup) {
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netRadius = 0.9;
  const netSegments = 12;
  const netHeight = 1.5;
  
  // Create vertical net segments
  for (let i = 0; i < netSegments; i++) {
    const angle = (i / netSegments) * Math.PI * 2;
    const x1 = Math.cos(angle) * netRadius;
    const z1 = Math.sin(angle) * netRadius;
    
    const points = [];
    for (let j = 0; j <= 8; j++) {
      const t = j / 8;
      const currentRadius = netRadius * (1 - t * 0.3);
      const currentX = Math.cos(angle) * currentRadius;
      const currentZ = Math.sin(angle) * currentRadius;
      const currentY = -t * netHeight;
      points.push(new THREE.Vector3(currentX, currentY, currentZ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, netMaterial);
    line.position.set(x, y, 0);
    parentGroup.add(line);
  }
  
  // Create horizontal net segments for connection
  for (let j = 1; j <= 4; j++) {
    const t = j / 8;
    const currentRadius = netRadius * (1 - t * 0.3);
    const currentY = -t * netHeight;
    
    const points = [];
    for (let i = 0; i <= netSegments; i++) {
      const angle = (i / netSegments) * Math.PI * 2;
      const currentX = Math.cos(angle) * currentRadius;
      const currentZ = Math.sin(angle) * currentRadius;
      points.push(new THREE.Vector3(currentX, currentY, currentZ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, netMaterial);
    line.position.set(x, y, 0);
    parentGroup.add(line);
  }
}

// Create realistic basketball at center court
function createBasketball() {
  // Create basketball with better material properties
  const ballGeometry = new THREE.SphereGeometry(0.6, 64, 64); // Higher resolution
  const ballMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xd2691e,  // More realistic basketball orange
    shininess: 20,    // Less shiny, more matte
    specular: 0x222222 // Darker specular highlights
  });
  const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
  basketball.position.set(0, 4, 0);  // Float the ball 4 units above the court
  basketball.castShadow = true;
  basketball.receiveShadow = true;
  scene.add(basketball);
  
  // Create realistic basketball seam lines
  const seamMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000,
    linewidth: 2
  });
  
  // Function to create curved seam line
  function createSeamLine(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, seamMaterial);
    line.position.set(0, 4, 0);
    scene.add(line);
  }
  
  // Create main vertical seams (basketball's characteristic curved lines)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const points = [];
    
    // Create curved seam from top to bottom
    for (let j = 0; j <= 50; j++) {
      const t = j / 50;
      const theta = t * Math.PI; // From 0 to PI (top to bottom)
      
      // Create the characteristic basketball curve
      const curveFactor = Math.sin(theta) * 0.3; // Creates the curved shape
      const adjustedAngle = angle + curveFactor;
      
      const radius = Math.sin(theta) * 0.61;
      const x = Math.cos(adjustedAngle) * radius;
      const z = Math.sin(adjustedAngle) * radius;
      const y = Math.cos(theta) * 0.61;
      
      points.push(new THREE.Vector3(x, y, z));
    }
    createSeamLine(points);
  }
  
  // Create horizontal seam lines for more detail
  for (let i = 1; i <= 3; i++) {
    const points = [];
    const heightRatio = i / 4;
    const theta = heightRatio * Math.PI;
    const radius = Math.sin(theta) * 0.61;
    const y = Math.cos(theta) * 0.61;
    
    for (let j = 0; j <= 32; j++) {
      const phi = (j / 32) * Math.PI * 2;
      const x = Math.cos(phi) * radius;
      const z = Math.sin(phi) * radius;
      points.push(new THREE.Vector3(x, y, z));
    }
    createSeamLine(points);
    
    // Mirror for bottom half
    const pointsBottom = [];
    for (let j = 0; j <= 32; j++) {
      const phi = (j / 32) * Math.PI * 2;
      const x = Math.cos(phi) * radius;
      const z = Math.sin(phi) * radius;
      pointsBottom.push(new THREE.Vector3(x, -y, z));
    }
    createSeamLine(pointsBottom);
  }
  }
  
  // Create stadium environment with bleachers
  function createStadiumEnvironment() {
    // Create bleachers on both sides
    createBleachers(0, 20, 1);  // Right side bleachers
    createBleachers(0, -20, -1); // Left side bleachers
  }
  
  // Create bleachers for stadium atmosphere
  function createBleachers(x, z, side) {
    const bleacherGroup = new THREE.Group();
    
    // Bleacher structure parameters
    const rows = 8;
    const seatsPerRow = 15;
    const rowHeight = 1.5;
    const rowDepth = 1.2;
    const seatWidth = 1.8;
    
    for (let row = 0; row < rows; row++) {
      for (let seat = 0; seat < seatsPerRow; seat++) {
        // Create seat
        const seatGeometry = new THREE.BoxGeometry(seatWidth * 0.9, 0.3, rowDepth * 0.8);
        const seatMaterial = new THREE.MeshPhongMaterial({ 
          color: row % 2 === 0 ? 0x1e40af : 0x3b82f6 // Alternating blue colors
        });
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        
        // Position seat
        const seatX = x + (seat - seatsPerRow/2) * seatWidth;
        const seatY = row * rowHeight + 0.5;
        const seatZ = z + side * (row * rowDepth);
        
        seatMesh.position.set(seatX, seatY, seatZ);
        seatMesh.castShadow = true;
        bleacherGroup.add(seatMesh);
        
        // Create backrest
        const backGeometry = new THREE.BoxGeometry(seatWidth * 0.9, rowHeight * 0.8, 0.2);
        const backMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x1e3a8a // Darker blue
        });
        const backMesh = new THREE.Mesh(backGeometry, backMaterial);
        backMesh.position.set(seatX, seatY + rowHeight * 0.4, seatZ + side * rowDepth * 0.4);
        backMesh.castShadow = true;
        bleacherGroup.add(backMesh);
      }
    }
    
    // Support structure
    const supportGeometry = new THREE.BoxGeometry(seatsPerRow * seatWidth, 2, 2);
    const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x6b7280 });
    const support = new THREE.Mesh(supportGeometry, supportMaterial);
    support.position.set(x, -1, z);
    support.castShadow = true;
    bleacherGroup.add(support);
    
    scene.add(bleacherGroup);
  }
  
  // Create physical 3D scoreboard behind the hoop
  function createPhysicalScoreboard() {
    const scoreboardGroup = new THREE.Group();
    const scoreboardX = -20; // BEHIND the left basket, outside court
    const scoreboardY = 15; // Height above the hoop
    const scoreboardZ = 0; // Same z-position as the basket
    
    // Main scoreboard screen
    const screenGeometry = new THREE.BoxGeometry(10, 5, 0.5);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x001100,
      emissive: 0x002200
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(scoreboardX, scoreboardY, scoreboardZ);
    screen.rotation.y = Math.PI / 2; // Rotate 90 degrees to face the court
    screen.castShadow = true;
    scoreboardGroup.add(screen);
    
    // Scoreboard frame
    const frameGeometry = new THREE.BoxGeometry(10.8, 5.8, 1);
    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x2d3748 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(scoreboardX, scoreboardY, scoreboardZ);
    frame.rotation.y = Math.PI / 2; // Rotate 90 degrees to face the court
    frame.castShadow = true;
    scoreboardGroup.add(frame);
    
    // Create simple text using box geometry for HOME
    function createScoreboardText(text, x, y, z, color = 0x00ff00, size = 0.5) {
      const textGroup = new THREE.Group();
      const charWidth = size;
      const charHeight = size * 1.2;
      const spacing = size * 1.1;
      
      for (let i = 0; i < text.length; i++) {
        if (text[i] !== ' ') {
          const charGeometry = new THREE.BoxGeometry(charWidth, charHeight, 0.2);
          const charMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color === 0x00ff00 ? 0x001100 : (color === 0xff4444 ? 0x110000 : 0x001100)
          });
          const char = new THREE.Mesh(charGeometry, charMaterial);
          char.position.set(x + (i - text.length/2) * spacing, y, z);
          char.rotation.y = Math.PI / 2; // Rotate text to face the court
          textGroup.add(char);
        }
      }
      return textGroup;
    }
    
    // Add HOME label and score (properly positioned for rotated scoreboard)
    const homeLabel = createScoreboardText("HOME", scoreboardX + 0.3, scoreboardY + 1.5, scoreboardZ - 2, 0x00ff00, 0.4);
    const homeScore = createScoreboardText("0", scoreboardX + 0.3, scoreboardY, scoreboardZ - 2, 0xff4444, 0.8);
    
    // Add AWAY label and score (properly positioned for rotated scoreboard)
    const awayLabel = createScoreboardText("AWAY", scoreboardX + 0.3, scoreboardY + 1.5, scoreboardZ + 2, 0x00ff00, 0.4);
    const awayScore = createScoreboardText("0", scoreboardX + 0.3, scoreboardY, scoreboardZ + 2, 0xff4444, 0.8);
    
    // Add dash separator between scores
    const dashLabel = createScoreboardText("-", scoreboardX + 0.3, scoreboardY, scoreboardZ, 0xffffff, 0.6);
    
    scoreboardGroup.add(homeLabel);
    scoreboardGroup.add(homeScore);
    scoreboardGroup.add(awayLabel);
    scoreboardGroup.add(awayScore);
    scoreboardGroup.add(dashLabel);
    
         // Support pole from ground outside the court
     const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, scoreboardY + 2);
     const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x4b5563 });
     const pole = new THREE.Mesh(poleGeometry, poleMaterial);
     pole.position.set(scoreboardX, (scoreboardY + 2) / 2 - 1, scoreboardZ);
     pole.castShadow = true;
     scoreboardGroup.add(pole);
     
     // Support arm connecting pole to scoreboard
     const armGeometry = new THREE.BoxGeometry(0.3, 0.3, 1);
     const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4b5563 });
     const arm = new THREE.Mesh(armGeometry, armMaterial);
     arm.position.set(scoreboardX, scoreboardY, scoreboardZ - 0.5);
     arm.castShadow = true;
     scoreboardGroup.add(arm);
    
         // LED-style lights around the scoreboard (adjusted for rotation)
     for (let i = 0; i < 12; i++) {
       const angle = (i / 12) * Math.PI * 2;
       const lightGeometry = new THREE.SphereGeometry(0.12, 8, 8);
       const lightMaterial = new THREE.MeshPhongMaterial({ 
         color: 0xffffff,
         emissive: 0x444444
       });
       const light = new THREE.Mesh(lightGeometry, lightMaterial);
       light.position.set(
         scoreboardX + 0.4,
         scoreboardY + Math.sin(angle) * 3,
         scoreboardZ + Math.cos(angle) * 5.8
       );
       scoreboardGroup.add(light);
     }
    
    scene.add(scoreboardGroup);
  }
  
  // Create all elements
createBasketballCourt();
  createBasketballHoop(13, 1);  // Right hoop facing left
  createBasketballHoop(-13, -1); // Left hoop facing right
  createBasketball();
  createStadiumEnvironment(); // Add stadium bleachers
  createPhysicalScoreboard(); // Add 3D scoreboard above court
  
  // Set camera position for better view
camera.position.set(0, 15, 25);
camera.lookAt(0, 0, 0);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minDistance = 5;
controls.maxDistance = 50;

  let isOrbitEnabled = true;
  
  // Handle key events
function handleKeyDown(e) {
  if (e.key.toLowerCase() === "o") {
    isOrbitEnabled = !isOrbitEnabled;
    console.log('Orbit controls:', isOrbitEnabled ? 'enabled' : 'disabled');
  }
}

document.addEventListener('keydown', handleKeyDown);

// Handle window resize
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleWindowResize);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate(); 