let capture;
let handPose;
let video;
let hands = [];
let particles = [];
let currentLen = 70;
let lastY = null;
let isFalling = false;
let music, fft;

function preload() {
  handPose = ml5.handPose({ maxHands: 1, flipHorizontal: true });
  music = loadSound('/asset/sound/hitslab-brazil-rio-samba-carnival-music-481483.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);
  
  fft = new p5.FFT(0.8, 16);
  // 音は一度だけ再生開始
  music.loop(); 
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(20, 60, 40);
  blendMode(ADD);
  
  // FFTの解析
  let spectrum = fft.analyze();
  let volume = fft.getEnergy("bass"); // 低音(キックドラムなど)を音量トリガーにする

  // 手の検知（落下判定のみに使用）
  if (hands.length > 0) {

    let tipY = hands[0].index_finger_tip.y;
    if (lastY === null) lastY = tipY;
    if (tipY - lastY > 10 && !isFalling) {
      isFalling = true;
    }
    lastY = tipY;
    }

  // 音量が一定以上ならパーティクルを生成
  if (!isFalling && volume > 250) { 
    for (let i = 0; i < 10; i++) {
      particles.push(new Particle(volume));
    }
  }

  // 円の更新と描画
  blendMode(ADD);
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].move(isFalling);
    particles[i].draw();
    
  // 画面下で消滅
    if (particles[i].pos.x < 0 || particles[i].pos.x > width || particles[i].pos.y < 0 || particles[i].pos.y > height ) {
      particles.splice(i, 1);
    }
  }


  // 全ての円が画面外に消えたら成長
  if (isFalling && particles.length === 0) {
    currentLen += 10;
    isFalling = false;
  }

 blendMode(BLEND);

  // 木の描画
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(255, 255, 100);
  randomSeed(1);
  push();
  translate(width / 2, height);
  branch(currentLen);
  pop();
  drawingContext.shadowBlur = 0;
}

class Particle {
  constructor(vol) {
    this.rad = random(2, 8);
    
    this.pos = createVector(width/2 + random(-width/20, width/20), 4*height/5 + random(-height/10, height/10));
    
    this.vel = p5.Vector.random2D().mult(random(3, 15));
    
    this.alpha = 255;
    this.color = random([
      color(254 + random(-10, 10), 223 + random(-10, 10), 0),
      color(0, 39 + random(-10, 10), 118 + random(-10, 10))
    ]);
  }

  move(isFalling) {
    if (isFalling) {
      // 下へ移動するロジック（X軸は保持）
      this.pos.y += 30; 
      this.vel.mult(15);
    } else {
      // 通常のランダムな動き
      this.pos.add(this.vel);
    }
  }

  draw() {
    fill(this.color, this.alpha);
    ellipse(this.pos.x, this.pos.y, this.rad);
  }
}


function branch(len) {
  push();
  if (len > 10) {
    strokeWeight(map(len, 10, 250, 1, 15));
    stroke(200);
    line(0, 0, 0, -len);
    translate(0, -len);
    rotate(random(-20, -35));
    branch(len * random(0.7, 0.9));
    rotate(random(50, 70));
    branch(len * random(0.7, 0.9));
  }
  pop();
}


// マウスクリックで戻る処理
function mouseClicked() {
  window.location.href = '/worldmap/worldmap.html'; 
}