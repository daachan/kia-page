let capture;
let video;
let oilLayer;
let handPose;
let hands = [];
let sound;
let startTime = 0; // 検知を開始した時間
let isTriggered = false; // 削り中かどうかのフラグ

function preload() {
  handPose = ml5.handPose({ maxHands: 1, flipHorizontal: true });
  sound = loadSound('/asset/sound/hagasu03.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  oilLayer = createGraphics(width, height);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handPose.detectStart(video, gotHands);
  angleMode(DEGREES);
  oilLayer.angleMode(DEGREES);
}

function draw() {
  // 1. 彫刻風の線画処理（背景）
  video.loadPixels();
  let img = createImage(video.width, video.height);
  img.loadPixels();
  
  let brightnesses = [];
  for (let i = 0; i < video.pixels.length; i += 4) {
    brightnesses.push((video.pixels[i] + video.pixels[i+1] + video.pixels[i+2]) / 3);
  }

  for (let x = 1; x < video.width - 1; x++) {
    for (let y = 1; y < video.height - 1; y++) {
      let idx = x + y * video.width;
      let diffX = abs(brightnesses[idx + 1] - brightnesses[idx - 1]);
      let diffY = abs(brightnesses[idx + video.width] - brightnesses[idx - video.width]);
      let totalDiff = diffX + diffY;

      let pixelIdx = idx * 4;
      if (totalDiff > 30) {
        img.pixels[pixelIdx] = 110; img.pixels[pixelIdx+1] = 80; img.pixels[pixelIdx+2] = 60;
      } else {
        img.pixels[pixelIdx] = 245; img.pixels[pixelIdx+1] = 235; img.pixels[pixelIdx+2] = 210;
      }
      img.pixels[pixelIdx+3] = 255;
    }
  }
  img.updatePixels();
  push();
  scale(-1, 1);
  image(img, -width, 0);
  pop();

  // 2. 【周期的な削り制御】
  if (hands.length > 0) {
    // 手を検知し始めた瞬間を記録
    if (startTime === 0) startTime = millis();
    
    let elapsed = millis() - startTime;
    
    // 3秒（3000ms）ごとに削る（削る時間は0.5秒間）
    if (elapsed % 1000 < 500) {
      let indexTip = hands[0].keypoints[8];
      let handX = width - (width - indexTip.x);
      let handY = indexTip.y;

      sound.play();

      oilLayer.erase();
      oilLayer.noStroke();
      let wipeX = random(10, 100);
      oilLayer.rect(handX - 75, handY, wipeX, height - handY);
      oilLayer.noErase();
    }
  } else {
    // 手がなくなったらリセット
    startTime = 0;
  }

  // 3. 油絵を塗り重ねる
  for (let i = 0; i < 2000; i++) {
    let x = floor(random(width));
    let y = floor(random(height));
    let px = (width - 1 - x);
    let index = (px + y * video.width) * 4;
    
    let r = video.pixels[index];
    let g = video.pixels[index + 1];
    let b = video.pixels[index + 2];
    
    oilLayer.noStroke();
    oilLayer.fill(r * 0.8, g * 0.8, b * 0.6, 100);
    oilLayer.push();
    oilLayer.translate(x, y);
    oilLayer.rotate(random(360));
    oilLayer.ellipse(0, 0, random(4, 12), random(2, 6));
    oilLayer.pop();
  }
  
  // 4. 重ねて表示
  image(oilLayer, 0, 0);
}

function gotHands(results) {
  hands = results;
}


//マウスクリックで戻る処理
function mouseClicked() {
  window.location.href = '/worldmap/worldmap.html'; 
}