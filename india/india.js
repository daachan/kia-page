let capture;
let video;
let handPose;
let hands = [];

let particles = [];

let curryColor = [
  [170, 135, 56],
  [190, 122, 17],
  [ 137, 96, 35],
  [229, 201, 100]
]

let pg;
let cowImg;
let cowSound;


function preload() {
  handPose = ml5.handPose({maxHands: 1, flipHorizontal: true});
  cowImg = loadImage('/asset/image/cow.png');
  cowSound = loadSound('/asset/sound/cowFoot.mp3')
}
function setup() {
  createCanvas(windowWidth, windowHeight); 
  pg = createGraphics(width, height);
  video = createCapture(VIDEO);
  video.size(width, height); 
  video.hide();
  
  handPose.detectStart(video, gotHands);
  
  angleMode(DEGREES);
  
  noStroke();
}

function draw() {
  background(240, 230, 210);

  
  //push();
  //translate(width, 0);
  //scale(-1, 1);
  //image(video, 0, 0, width, height);
  //pop();
  
  if (hands.length > 0) {
    let indexFinger = hands[0].keypoints[8];
    
    let x = width - (width - indexFinger.x);
    let y = indexFinger.y;
    
    let currentColor = random(curryColor);
    
    for (let i = 0; i < 50; i++) {
     particles.push(new Particle(x ,y, currentColor));
    }

  }
  
  for (let i = 0; i < particles.length; i++) {
    particles[i].move();
    particles[i].draw();
  }
  
  //足跡
  if (frameCount % 10 === 0) {
    let numFootprints = floor(random(3, 9));
    let baseX = random(100, width - 100);
    let baseY = random(100, height - 100);

    if (frameCount % 100 === 0) {
     cowSound.rate(2.0);
     cowSound.play();
    }

    //pg.erase();
    
    for (let i = 0; i < numFootprints; i++) {
      pg.push();
      filter(INVERT);
      let offsetX = random(-50, 50);
      let offsetY = random(-50, 50);
      pg.translate(baseX + offsetX, baseY + offsetY);
      pg.rotate(random(360));
      pg.tint(255, 0, 0);
      pg.image(cowImg, 0, 0, 40, 40);
      filter(INVERT);
      pg.pop();
    }
    //pg.noErase();
  }
  image(pg, 0, 0)
}


function gotHands(results) {
  hands = results;
}


class Particle {
  constructor(x, y, color) {
    this.rad = random(2, 10);
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(1, 20));
    this.lifetime = 10;
    this.maxLifetime = 10;
    this.color = color;
  }
  
  move() {
    if (this.lifetime > 0) {
    this.pos.add(this.vel);
    this.vel.mult(0.95);
    this.lifetime -= 1;
    }
  }
  
  draw() {
    this.alpha = map(this.lifetime, this.maxLifetime, 0, 0, 255);
    fill(this.color[0], this.color[1], this.color[2], this.alpha);
    ellipse(this.pos.x, this.pos.y, this.rad);
  }
}


//マウスクリックで戻る処理
function mouseClicked() {
  window.location.href = '/worldmap/worldmap.html'; 
}