let capture;
let faceMesh;
let faces = [];
let isEyeClosed = false;
let closedTimer = 0;
let stepSize = 8; 

let inkDrops = []; 
let inkSoundLow;
let inkSoundHigh;



function preload() {
  // WebGPUのエラー対策として backend: "webgl" を指定しています
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: true, backend: "webgl" });
  
  inkSoundLow = loadSound('/asset/sound/Water_Drop03-1(Low-Reverb).mp3');
  inkSoundHigh = loadSound('/asset/sound/Water_Drop03-2(High-Reverb).mp3');
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(width, height);
  capture.hide();

  faceMesh.detectStart(capture, gotFaces);
}


function gotFaces(results) {
  faces = results;
}



function draw() {
  // 背景は和紙の薄いベージュ
  background(245, 242, 235);

  // 1. 実際に目を閉じているかどうかの判定
  if (faces.length > 0) {
    checkEyeStatus(faces[0]);
  } else {
    isEyeClosed = false; 
  }


  // 2. 目を閉じている時間（タイマー）のコントロール
  if (isEyeClosed) {
    closedTimer = min(closedTimer + 1, 200); 
    
    // 目を閉じた「瞬間」（タイマーが1になった時）にポタリと滴を落とす
    if (closedTimer === 1) {
      let soundNumber = floor(random(2));
      if (soundNumber == 0){
        inkSoundLow.play();
      }
      else if (soundNumber == 1) {
        inkSoundHigh.play();
      }
      triggerInkDrop();
    }
    
  } else {
    closedTimer = max(closedTimer - 10, 0);  
  }

  // 波紋の更新と描画を毎回実行（目を閉じて発生した波紋がここで描画されます）
  updateAndDrawDrops();

  // 3. タイマーが動いている（目を閉じている）時だけ水墨画を描画
  if (closedTimer > 0) {
    capture.loadPixels();

    for (let y = 0; y < height; y += stepSize) {
      for (let x = 0; x < width; x += stepSize) {
        
        let mirrorX = width - 1 - x;
        let index = (y * width + mirrorX) * 4;
        
        let r = capture.pixels[index + 0];
        let g = capture.pixels[index + 1];
        let b = capture.pixels[index + 2];
        let currentBrightness = (r + g + b) / 3;

        let myThreshold = 110; 

        if (currentBrightness < myThreshold) {
          let alpha = map(closedTimer, 0, 200, 0, 140); 
          
          push();
          translate(x + random(-2, 2), y + random(-2, 2));
          
          noStroke();
          fill(20, 20, 20, alpha); 
          
          rotate(random(TWO_PI));
          let brushWidth = random(2, 6);
          let brushHeight = random(6, 12);
          ellipse(0, 0, brushWidth, brushHeight);
          
          pop();
        }
      }
    }
  }
}

// --- 目の開閉をリアルタイム判定する関数 ---
function checkEyeStatus(face) {
  let topEye = face.keypoints[159];
  let bottomEye = face.keypoints[145];
  
  if (topEye && bottomEye) {
    let d = dist(topEye.x, topEye.y, bottomEye.x, bottomEye.y);
    
    if (d < 3.5) {
      isEyeClosed = true;
    } else {
      isEyeClosed = false;
    }
  }
}


// --- 演出: 墨の滴（波紋）を発生させる ---
function triggerInkDrop() {
  let corners = [
    {x: 50, y: 50},
    {x: width - 50, y: 50},
    {x: 50, y: height - 50},
    {x: width - 50, y: height - 50}
  ];
  let chosen = random(corners);
  
  inkDrops.push({
    x: chosen.x,
    y: chosen.y,
    r: 0,          // 波紋の半径
    maxR: random(300, 500),
    alpha: 255
  });
}

// --- 演出: 波紋の更新と描画 ---
function updateAndDrawDrops() {
  for (let i = inkDrops.length - 1; i >= 0; i--) {
    let drop = inkDrops[i];
    drop.r += 4; // 波紋が広がるスピード
    drop.alpha -= 2; // 徐々に薄くなる
    
    noFill();
    stroke(30, 30, 30, drop.alpha);
    strokeWeight(1.5); // 水墨画らしく少し繊細な線に
    
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.1) {
      let offset = noise(cos(a) + 1, sin(a) + 1, frameCount * 0.02) * 25;
      let currentR = drop.r + offset;
      let x = drop.x + cos(a) * currentR;
      let y = drop.y + sin(a) * currentR;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    if (drop.alpha <= 0) {
      inkDrops.splice(i, 1);
    }
  }
}


// マウスクリックで戻る処理
function mouseClicked() {
  window.location.href = '/worldmap/worldmap.html'; 
}