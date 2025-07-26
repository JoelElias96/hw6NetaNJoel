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

// HW6 ADDITIONS: Game State Variables
let basketball = null;
let basketballVelocity = new THREE.Vector3(0, 0, 0);
let basketballRotation = new THREE.Vector3(0, 0, 0);
let isPhysicsActive = false;
let shotPower = 50; // 0-100%
let bounceCount = 0;
let gameStats = {
  score: 0,
  shotsMade: 0,
  shotAttempts: 0,
  accuracy: 0
};
let lastShotMessage = "";
let showMessageTime = 0;

// Physics constants - PERFECT VISUAL BASKETBALL
const GRAVITY = -0.15; // MUCH slower gravity for visual tracking
const BOUNCE_DAMPING = 0.8; // Good bounce response
const GROUND_Y = 0.6;
const BALL_START_HEIGHT = 6.0; // Start ball higher for better basketball feel
const MOVEMENT_SPEED = 0.2; // Slower movement for better control
const ROTATION_DAMPING = 0.95;
const MAX_BOUNCE_COUNT = 6;
const VISUAL_SPEED_SCALE = 0.25; // Balanced for visual tracking and reaching target

// Court boundaries
const COURT_BOUNDS = {
  minX: -14,
  maxX: 14,
  minZ: -7,
  maxZ: 7
};

// Hoop positions for collision detection
const HOOPS = [
  { x: 13, y: 10, z: 0, rim: 0.9 },  // Right hoop
  { x: -13, y: 10, z: 0, rim: 0.9 }  // Left hoop  
];

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
  basketball = new THREE.Mesh(ballGeometry, ballMaterial); // Store global reference
  basketball.position.set(0, BALL_START_HEIGHT, 0);  // Start ball in the air at center court
  basketball.castShadow = true;
  basketball.receiveShadow = true;
  scene.add(basketball);
  
  // Basketball seam lines are removed to avoid positioning issues
  // The orange color and texture is sufficient for basketball appearance
  }

// PERFECT VISUAL BASKETBALL PHYSICS - Slow and realistic
function updatePhysics(deltaTime) {
  if (!isPhysicsActive || !basketball) return;
  
  // Apply gravity (already scaled in calculation)
  basketballVelocity.y += GRAVITY * deltaTime;
  
  // Update position with visual speed scaling
  const scaledVelocity = basketballVelocity.clone().multiplyScalar(deltaTime * VISUAL_SPEED_SCALE);
  basketball.position.add(scaledVelocity);
  
  // Check realistic collisions first (rim and backboard bounce UP)
  if (!ballHasPassedThroughHoop) {
    checkRimCollision(); // Ball bounces UP off rim
    checkBackboardCollision(); // Ball bounces UP off backboard
  }
  
  // Check hoop scoring (ball passes through and falls down)
  checkHoopCollision();
  
  // Ground collision with realistic bouncing
  if (basketball.position.y <= GROUND_Y) {
    basketball.position.y = GROUND_Y;
    basketballVelocity.y *= -BOUNCE_DAMPING;
    basketballVelocity.x *= BOUNCE_DAMPING;
    basketballVelocity.z *= BOUNCE_DAMPING;
    bounceCount++;
    
    // Reset if ball stops bouncing or too many bounces
    if ((Math.abs(basketballVelocity.y) < 0.05 && basketballVelocity.length() < 0.1) || bounceCount >= MAX_BOUNCE_COUNT) {
      basketballVelocity.set(0, 0, 0);
      isPhysicsActive = false;
      bounceCount = 0;
      ballHasPassedThroughHoop = false; // Reset swish state
      
      // Show missed shot message only if no swish occurred
      if (showMessageTime <= 0 && !ballHasPassedThroughHoop) {
        lastShotMessage = "Missed - Try Again!";
        showMessageTime = 90;
        updateUI();
      }
    }
  }
  
  // Update ball rotation for visual realism
  updateBasketballRotation(deltaTime);
}

// REALISTIC Backboard collision - Ball bounces UP and forward
function checkBackboardCollision() {
  if (!basketball || !isPhysicsActive || ballHasPassedThroughHoop) return;
  
  HOOPS.forEach(hoop => {
    const backboardX = hoop.x;
    const backboardY = hoop.y;
    const backboardZ = hoop.z;
    
    const ballX = basketball.position.x;
    const ballY = basketball.position.y;
    const ballZ = basketball.position.z;
    
    // Check if ball hits backboard
    const isBehindBackboard = (hoop.x > 0 && ballX > backboardX + 0.2) || (hoop.x < 0 && ballX < backboardX - 0.2);
    const isAtBackboardHeight = ballY > backboardY - 2 && ballY < backboardY + 2;
    const isAtBackboardWidth = Math.abs(ballZ - backboardZ) < 1.4;
    
    if (isBehindBackboard && isAtBackboardHeight && isAtBackboardWidth) {
      console.log(`Ball hit backboard! Bouncing UP and forward for bank shot`);
      
      // REALISTIC BACKBOARD BOUNCE - Ball bounces UP and toward rim
      basketballVelocity.x *= -0.6; // Reverse direction toward rim
      basketballVelocity.y = Math.abs(basketballVelocity.y) * 0.5 + 0.2; // Bounce UP
      basketballVelocity.z *= 0.7;  // Some dampening
      
      // Move ball away from backboard
      const directionToRim = hoop.x > 0 ? -1 : 1;
      basketball.position.x = backboardX + directionToRim * 1.0;
      
      bounceCount++;
      console.log(`Backboard bounce: ball now moving UP with velocity Y = ${basketballVelocity.y.toFixed(2)}`);
    }
  });
}

// REALISTIC RIM COLLISION - Ball bounces UP like real basketball
function checkRimCollision() {
  if (!basketball || !isPhysicsActive || ballHasPassedThroughHoop) return;
  
  HOOPS.forEach(hoop => {
    const rimX = hoop.x - 0.6; // Rim center position
    const rimY = hoop.y;
    const rimZ = hoop.z;
    
    const ballX = basketball.position.x;
    const ballY = basketball.position.y;
    const ballZ = basketball.position.z;
    
    // Check distance to rim edge
    const horizontalDistance = Math.sqrt(
      Math.pow(ballX - rimX, 2) + Math.pow(ballZ - rimZ, 2)
    );
    
    // Ball hits the rim (not going through cleanly)
    if (horizontalDistance > hoop.rim * 0.9 && horizontalDistance < hoop.rim * 1.8 && Math.abs(ballY - rimY) < 0.6) {
      console.log(`Ball hit the rim! Bouncing UP like real basketball`);
      
      // REALISTIC RIM BOUNCE - Ball bounces UP and away from rim
      const bounceDirection = new THREE.Vector3(ballX - rimX, 0, ballZ - rimZ);
      bounceDirection.normalize();
      
      // Apply realistic rim bounce - UP and outward
      basketballVelocity.x = bounceDirection.x * 0.4; // Bounce away horizontally
      basketballVelocity.z = bounceDirection.z * 0.4; // Bounce away horizontally  
      basketballVelocity.y = Math.abs(basketballVelocity.y) * 0.6 + 0.3; // Bounce UP (important!)
      
      bounceCount++;
      console.log(`Rim bounce: ball now moving UP with velocity Y = ${basketballVelocity.y.toFixed(2)}`);
    }
  });
}

function updateBasketballRotation(deltaTime) {
  if (!basketball) return;
  
  // Calculate rotation based on velocity during physics
  const speed = basketballVelocity.length();
  if (speed > 0.1 && isPhysicsActive) {
    // Rotation axis perpendicular to velocity direction for realistic rolling/spinning
    const velocityDirection = basketballVelocity.clone().normalize();
    
    // For horizontal movement, rotate around vertical axis through ball center
    if (Math.abs(velocityDirection.x) > 0.1 || Math.abs(velocityDirection.z) > 0.1) {
      const horizontalVelocity = new THREE.Vector3(velocityDirection.x, 0, velocityDirection.z).normalize();
      const rotationAxis = new THREE.Vector3(0, 1, 0).cross(horizontalVelocity).normalize();
      const rotationSpeed = speed * 3; // More realistic rotation speed
      basketball.rotateOnAxis(rotationAxis, rotationSpeed * deltaTime);
    }
    
    // Add slight spin around y-axis for basketball shooting effect
    if (velocityDirection.y !== 0) {
      basketball.rotation.y += speed * 0.5 * deltaTime;
    }
  }
  
  // Apply rotation damping when ball is moving
  basketballRotation.multiplyScalar(ROTATION_DAMPING);
}

// PERFECT VISUAL SWISH DETECTION
let ballHasPassedThroughHoop = false;

function checkHoopCollision() {
  if (!basketball || !isPhysicsActive) return;
  
  HOOPS.forEach(hoop => {
    const rimPosition = new THREE.Vector3(hoop.x - 0.6, hoop.y, hoop.z); // Exact rim center
    const ballPosition = basketball.position.clone();
    
    // Check horizontal distance to rim center
    const horizontalDistance = Math.sqrt(
      Math.pow(ballPosition.x - rimPosition.x, 2) + 
      Math.pow(ballPosition.z - rimPosition.z, 2)
    );
    
    // STRONGER MAGNETIC GUIDANCE: Help ball find the basket easily
    if (horizontalDistance < hoop.rim * 3.5 && Math.abs(ballPosition.y - rimPosition.y) < 3.0) {
      const pullStrength = 0.025; // Stronger guidance for easier scoring
      const pullDirection = new THREE.Vector3(
        rimPosition.x - ballPosition.x,
        0, // No vertical pull - let gravity handle it
        rimPosition.z - ballPosition.z
      );
      pullDirection.normalize();
             pullDirection.multiplyScalar(pullStrength);
      
      // Apply very subtle horizontal guidance only
      basketballVelocity.x += pullDirection.x;
      basketballVelocity.z += pullDirection.z;
    }
    
         // DETECT BALL ACTUALLY PASSING THROUGH HOOP
     const isPassingThroughHoop = horizontalDistance < hoop.rim * 1.3; // Generous but realistic
     const isAtRimLevel = Math.abs(ballPosition.y - rimPosition.y) < 0.8; // Near rim height
     const isMovingDownward = basketballVelocity.y < -0.1; // Must be falling down
     const isComingFromAbove = ballPosition.y >= rimPosition.y - 1.0; // Coming from above
     
     // VISUAL SWISH - Ball actually goes through hoop and falls
     if (isPassingThroughHoop && isAtRimLevel && isMovingDownward && isComingFromAbove && !ballHasPassedThroughHoop) {
       ballHasPassedThroughHoop = true;
       console.log(`🏀 SWISH! Ball passing through ${hoop.x > 0 ? 'RIGHT' : 'LEFT'} hoop and falling through net!`);
       
       // VISUAL INDICATION - Flash and message
       flashBasketEffect();
       lastShotMessage = "🏀 SWISH! Through the Net!";
       showMessageTime = 240;
       updateUI();
       
       // Let ball continue falling THROUGH the hoop for visual effect
       // Make sure ball passes through visually by guiding it down
       basketballVelocity.x *= 0.3; // Slow horizontal movement
       basketballVelocity.z *= 0.3; // Slow horizontal movement  
       basketballVelocity.y = -0.6; // Ensure downward motion through net
       
       // Position ball right at rim center for clean passage
       basketball.position.x = rimPosition.x;
       basketball.position.z = rimPosition.z;
       
       // Score after ball falls through visually
       setTimeout(() => {
         if (ballHasPassedThroughHoop) {
           gameStats.score += 2;
           gameStats.shotsMade++;
           gameStats.accuracy = gameStats.shotAttempts > 0 ? (gameStats.shotsMade / gameStats.shotAttempts * 100).toFixed(1) : 0;
           
           // Celebration effect
           celebrateBasket();
           
           lastShotMessage = "🏆 +2 POINTS! BEAUTIFUL SWISH!";
           showMessageTime = 200;
           updateUI();
           
           console.log(`🎉 SCORED! Ball fell through net! Total: ${gameStats.score} points`);
           
           // Reset after celebration
           setTimeout(() => {
             basketballVelocity.set(0, 0, 0);
             isPhysicsActive = false;
             basketball.position.set(0, BALL_START_HEIGHT, 0);
             ballHasPassedThroughHoop = false;
           }, 1500); // Extra time to watch ball fall
         }
       }, 1000); // Let ball fall through first
       
       return; // Exit to prevent multiple detections
     }
  });
}

// HW6 INPUT HANDLING
const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  w: false,
  s: false,
  space: false,
  r: false
};

function handleKeyDown(e) {
  switch(e.key.toLowerCase()) {
    case 'o':
      isOrbitEnabled = !isOrbitEnabled;
      console.log('Orbit controls:', isOrbitEnabled ? 'enabled' : 'disabled');
      break;
    case 'arrowleft':
      keys.left = true;
      e.preventDefault();
      break;
    case 'arrowright':
      keys.right = true;
      e.preventDefault();
      break;
    case 'arrowup':
      keys.up = true;
      e.preventDefault();
      break;
    case 'arrowdown':
      keys.down = true;
      e.preventDefault();
      break;
    case 'w':
      keys.w = true;
      break;
    case 's':
      keys.s = true;
      break;
    case ' ':
      keys.space = true;
      e.preventDefault();
      break;
    case 'r':
      keys.r = true;
      break;
  }
}

function handleKeyUp(e) {
  switch(e.key.toLowerCase()) {
    case 'arrowleft': keys.left = false; e.preventDefault(); break;
    case 'arrowright': keys.right = false; e.preventDefault(); break;
    case 'arrowup': keys.up = false; e.preventDefault(); break;
    case 'arrowdown': keys.down = false; e.preventDefault(); break;
    case 'w': keys.w = false; break;
    case 's': keys.s = false; break;
    case ' ': keys.space = false; e.preventDefault(); break;
    case 'r': keys.r = false; break;
  }
}

function processInput() {
  if (!basketball || isPhysicsActive) return;
  
  let moved = false;
  let movementDirection = new THREE.Vector3(0, 0, 0);
  
  // Movement controls (only when physics is not active)
  if (keys.left && basketball.position.x > COURT_BOUNDS.minX) {
    basketball.position.x -= MOVEMENT_SPEED;
    movementDirection.x = -1;
    moved = true;
  }
  if (keys.right && basketball.position.x < COURT_BOUNDS.maxX) {
    basketball.position.x += MOVEMENT_SPEED;
    movementDirection.x = 1;
    moved = true;
  }
  if (keys.up && basketball.position.z > COURT_BOUNDS.minZ) {
    basketball.position.z -= MOVEMENT_SPEED;
    movementDirection.z = -1;
    moved = true;
  }
  if (keys.down && basketball.position.z < COURT_BOUNDS.maxZ) {
    basketball.position.z += MOVEMENT_SPEED;
    movementDirection.z = 1;
    moved = true;
  }
  
  // Add rotation during manual movement
  if (moved) {
    movementDirection.normalize();
    const rotationAxis = new THREE.Vector3();
    rotationAxis.crossVectors(movementDirection, new THREE.Vector3(0, 1, 0));
    rotationAxis.normalize();
    basketball.rotateOnAxis(rotationAxis, MOVEMENT_SPEED * 0.1);
  }
  
  // Power adjustment
  if (keys.w && shotPower < 100) {
    shotPower = Math.min(100, shotPower + 2);
    updateUI();
  }
  if (keys.s && shotPower > 0) {
    shotPower = Math.max(0, shotPower - 2);
    updateUI();
  }
  
  // Shooting
  if (keys.space) {
    shootBasketball();
    keys.space = false; // Prevent continuous shooting
  }
  
  // Reset
  if (keys.r) {
    resetBasketball();
    keys.r = false;
  }
}

function shootBasketball() {
  if (!basketball || isPhysicsActive) return;
  
  // Find nearest hoop
  const nearestHoop = HOOPS.reduce((nearest, hoop) => {
    const distance = basketball.position.distanceTo(new THREE.Vector3(hoop.x, hoop.y, hoop.z));
    return (!nearest || distance < nearest.distance) ? {hoop, distance} : nearest;
  }, null);
  
  if (!nearestHoop) return;
  
  gameStats.shotAttempts++;
  gameStats.accuracy = gameStats.shotAttempts > 0 ? (gameStats.shotsMade / gameStats.shotAttempts * 100).toFixed(1) : 0;
  
  // PROPER PROJECTILE MOTION PHYSICS - Calculate exact velocities to reach target
  const targetHoop = nearestHoop.hoop;
  
  // Target the RIM CENTER (slightly in front of backboard)
  const rimTarget = new THREE.Vector3(targetHoop.x - 0.6, targetHoop.y, targetHoop.z);
  
  // Get ball's current position
  const ballPos = basketball.position.clone();
  
  // Calculate distances
  const deltaX = rimTarget.x - ballPos.x;
  const deltaZ = rimTarget.z - ballPos.z;
  const deltaY = rimTarget.y - ballPos.y; // Height difference (should be positive - going UP)
  const horizontalDistance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
  
  console.log(`🏀 SHOOTING FROM HIGHER POSITION:`);
  console.log(`Ball at (${ballPos.x.toFixed(1)}, ${ballPos.y.toFixed(1)}, ${ballPos.z.toFixed(1)})`);
  console.log(`Aiming at rim (${rimTarget.x.toFixed(1)}, ${rimTarget.y.toFixed(1)}, ${rimTarget.z.toFixed(1)})`);
  console.log(`Distance: ${horizontalDistance.toFixed(1)}, Height diff: ${deltaY.toFixed(1)} (ball needs to go ${deltaY > 0 ? 'UP' : 'DOWN'})`);
  
  // BALANCED CURVED TRAJECTORY - Perfect middle ground
  const baseBallTime = 4.2; // Good balance of visual appeal and power
  const powerEffect = (shotPower / 100) * 0.4 + 0.6; // 0.6 to 1.0 multiplier (moderate)
  const flightTime = baseBallTime / powerEffect; // 4.2 to 7.0 seconds
  
  // Add arc height for beautiful curved shots
  const arcBoost = 4.0; // Good arc height that still allows reaching target
  const adjustedDeltaY = deltaY + arcBoost; // Make ball go higher than target
  
  // Calculate velocities with MODERATE boost for reaching basket
  const powerBoost = 1.2; // Moderate boost - middle ground between weak and too strong
  const velocityX = (deltaX / flightTime) * powerBoost;
  const velocityZ = (deltaZ / flightTime) * powerBoost;
  
  // Calculate vertical velocity with moderate boost
  // Using: deltaY = vY*t + 0.5*g*t² -> vY = (deltaY - 0.5*g*t²) / t
  const velocityY = ((adjustedDeltaY - 0.5 * GRAVITY * flightTime * flightTime) / flightTime) * powerBoost;
  
  console.log(`🏀 BALANCED ARC SHOT - Flight time: ${flightTime.toFixed(1)}s, Arc boost: +${arcBoost} units, Power boost: ${powerBoost}x`);
  console.log(`Ball will arc beautifully from (${ballPos.x.toFixed(1)}, ${ballPos.y.toFixed(1)}) to (${rimTarget.x.toFixed(1)}, ${rimTarget.y.toFixed(1)})`);
  console.log(`BALANCED velocities: vX=${velocityX.toFixed(2)}, vY=${velocityY.toFixed(2)}, vZ=${velocityZ.toFixed(2)}`);
  
  // Set the calculated slow velocities
  basketballVelocity.x = velocityX;
  basketballVelocity.y = velocityY;  
  basketballVelocity.z = velocityZ;
  
  // Activate physics and reset states
  isPhysicsActive = true;
  bounceCount = 0;
  ballHasPassedThroughHoop = false; // Reset swish detection
  
  console.log(`🏀 PERFECTLY BALANCED SHOT FIRED! Ball will reach rim in ${flightTime.toFixed(1)} seconds with ${powerBoost}x power!`);
  console.log(`Watch the ball's beautiful curved trajectory - perfectly balanced power!`);
  
  updateUI();
}

function resetBasketball() {
  if (!basketball) return;
  
  basketball.position.set(0, BALL_START_HEIGHT, 0); // Reset to air height
  basketball.rotation.set(0, 0, 0); // Reset visual rotation too
  basketballVelocity.set(0, 0, 0);
  basketballRotation.set(0, 0, 0);
  isPhysicsActive = false;
  bounceCount = 0;
  ballHasPassedThroughHoop = false; // Reset swish state
  shotPower = 50;
  lastShotMessage = "🏀 Ball Reset - Ready to Shoot!";
  showMessageTime = 90;
  
  updateUI();
}

function updateUI() {
  // Update score display
  const scoreElement = document.getElementById('score-display');
  if (scoreElement) {
    const accuracy = gameStats.shotAttempts > 0 ? gameStats.accuracy : 0;
    scoreElement.innerHTML = `
      <div><strong>SCORE: ${gameStats.score}</strong></div>
      <div>Shots Made: ${gameStats.shotsMade}/${gameStats.shotAttempts}</div>
      <div>Accuracy: ${accuracy}%</div>
      <div>Shot Power: ${shotPower}%</div>
      <div>Status: ${isPhysicsActive ? 'Ball in Flight' : 'Ready to Shoot'}</div>
      ${lastShotMessage && showMessageTime > 0 ? `<div style="color: ${lastShotMessage.includes('MADE') ? '#4ade80' : '#ef4444'}; font-weight: bold; margin-top: 8px;">${lastShotMessage}</div>` : ''}
    `;
  }
  
  // Update controls display
  const controlsElement = document.getElementById('controls-display');
  if (controlsElement) {
    controlsElement.innerHTML = `
      <h3>Controls:</h3>
      <p><strong>Arrow Keys</strong> - Move basketball</p>
      <p><strong>W/S</strong> - Adjust shot power (${shotPower}%)</p>
      <p><strong>Spacebar</strong> - Shoot basketball</p>
      <p><strong>R</strong> - Reset ball position</p>
      <p><strong>O</strong> - Toggle orbit camera</p>
      <br>
      <p><em>Move ball with arrows, adjust power, and shoot!</em></p>
      <p style="font-size: 14px; color: #aaa;">Physics: ${isPhysicsActive ? 'Active' : 'Inactive'}</p>
    `;
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

// VISUAL EFFECTS FOR BASKET SCORING
function flashBasketEffect() {
  // Flash the background briefly to indicate scoring
  const originalBg = scene.background;
  scene.background = new THREE.Color(0x44ff44); // Green flash
  
  setTimeout(() => {
    scene.background = originalBg; // Restore original background
  }, 200); // Brief flash
}

function celebrateBasket() {
  // Multiple flashes for celebration
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    if (flashCount % 2 === 0) {
      scene.background = new THREE.Color(0xffaa00); // Orange flash
    } else {
      scene.background = new THREE.Color(0x404040); // Original gray
    }
    flashCount++;
    
    if (flashCount >= 6) { // 3 flashes total
      clearInterval(flashInterval);
      scene.background = new THREE.Color(0x404040); // Ensure back to original
    }
  }, 150);
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
let lastTime = 0;

// Event listeners for HW6 features
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Handle window resize
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', handleWindowResize);

// Animation function with physics integration
function animate(currentTime) {
  requestAnimationFrame(animate);
  
  // Calculate delta time
  const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap delta time
  lastTime = currentTime;
  
  // Process input for basketball movement
  processInput();
  
  // Update physics
  updatePhysics(deltaTime * 60); // Scale for 60fps physics
  
  // Update message timer
  if (showMessageTime > 0) {
    showMessageTime--;
  }
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

// Initialize the game
function initGame() {
  updateUI(); // Set initial UI state
  animate(0);
}

initGame(); 