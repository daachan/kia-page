let capture;
let faceMesh;
let video;
let faces = [];
let items = []; // 顔パーツと画像を格納する配列
let order = []; // 表示順序を管理する配列
let isMouthOpen = false;

let meatImg;
let tomatoImg;
let cheeseImg;
let lettuceImg;

let bun1Img;
let bun2Img;

let stars = [];
let sound;


function preload() {
    faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: true, backend: "webgl" });

    meatImg = loadImage('/asset/image/meat.png');
    tomatoImg = loadImage('/asset/image/tomato.png');
    cheeseImg = loadImage('/asset/image/cheese.png');
    lettuceImg = loadImage('/asset/image/lettuce.png');

    bun1Img = loadImage('/asset/image/bun1.png');
    bun2Img = loadImage('/asset/image/bun2.png');

    sound = loadSound('/asset/sound/Scene-Flashback09-1(Short).mp3')
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    video = createCapture(VIDEO);
    video.hide();
    faceMesh.detectStart(video, gotFaces);

    // 初期順序の作成 (0-4が顔パーツ, 5-8が画像)
    for (let i = 0; i < 9; i++) {
        order[i] = i;
    }
  
    for (let i = 0; i <50; i++) {
        stars.push (new Star(random(width/1.5, width/2), random(height/1.5, height/2)));
    }
}

function draw() {
    background(0);

    let bWidth = width / 3;
    let bHeight = height / 5;

    // バンズの位置（変数として定義）
    let topBunY = height / 5;
    let bottomBunY = 4 * height / 5;

    // バンズの上下端
    let topBunBottom = topBunY + bHeight / 4;
    let bottomBunTop = bottomBunY - bHeight / 4;

    //バンズの下
    image(bun2Img, width / 2 - bWidth / 2, bottomBunY - bHeight / 2, bWidth, bHeight);

    if (faces.length > 0) {
        let face = faces[0];

        // --- 口の開閉判定 ---
        let upperLip = face.keypoints[13];
        let lowerLip = face.keypoints[14];
        let mouthDist = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);

        // 口の開き具合のしきい値（カメラとの距離で変わる場合があるので調整してください）
        let mouthThreshold = 15; 

        if (mouthDist > mouthThreshold) {
            if (!isMouthOpen) {
                // 閉じた状態から開いた瞬間にシャッフル！
                shuffleOrder();
                sound.play();
                isMouthOpen = true;
            }
        } else {
            isMouthOpen = false; // 閉じたらフラグを戻す
        }


        // 顔のサイズを計算（パーツの切り出し用）
        let leftCheek = face.keypoints[234];
        let rightCheek = face.keypoints[454];
        let faceWidth = dist(leftCheek.x, leftCheek.y, rightCheek.x, rightCheek.y);
        let top = face.keypoints[10];
        let bottom = face.keypoints[152];
        let faceHeight = dist(top.x, top.y, top.x, bottom.y);
        let segmentHeight = faceHeight / 5;

        // 具材1つあたりの高さを計算（バンズの間の距離 ÷ 9）
        let contentAreaHeight = bottomBunTop - topBunBottom;
        let unitH = contentAreaHeight / 14
        let itemFH = unitH*2;
        let itemH = unitH;

        let currentY = topBunBottom; 

        for (let i = 0; i < 9; i++) {
            let idx = order[i];

            if (idx < 5) {
                // 顔パーツを切り出し
                let pY = top.y + (segmentHeight * idx); // インデックスに合わせて切り出し位置を変える
                let part = video.get(leftCheek.x, pY, faceWidth, segmentHeight);

                image(part, width / 2 - bWidth / 2, currentY, bWidth, itemFH);
                currentY += itemFH;
            } else {
                // 具材画像を描画
                let img = [meatImg, tomatoImg, cheeseImg, lettuceImg][idx - 5];
                image(img, width / 2 - bWidth / 2, currentY, bWidth, itemH);
                currentY += itemH;
            }
        }
    }
    // バンズの上
    image(bun1Img, width / 2 - bWidth / 2, topBunY - bHeight / 2, bWidth, bHeight);
  
    //星の描写
    let centerX = width / 2;
    let centerY = height / 2;
  
    for (let i = 0; i < stars.length; i++) {
        stars[i].move(isMouthOpen);
        stars[i].draw(centerX, centerY);
    }
}


function shuffleOrder() {
 // シャッフル
 for (let i = order.length - 1; i > 0; i--) {
     const j = floor(random(0, i + 1));
     [order[i], order[j]] = [order[j], order[i]];
    }
}

function gotFaces(results) {
 faces = results;
}


class Star {
  constructor(radiusX, radiusY) {
    this.angle = random(TWO_PI); // 星の現在の角度
    this.speed = random(0.005, 0.015); // 回転速度
    this.accelFactor = random(0.05, 0.15); //引き込まれる速度係数
    this.radiusX = radiusX; // 楕円の横幅
    this.radiusY = radiusY; // 楕円の縦幅
    this.initialRX = radiusX; // 元の軌道半径を保持
    this.initialRY = radiusY;
    this.size = random(3, 6);
  }

 // ブラックホール状態を受け取って更新
  move(isAbsorbing) {
    if (isAbsorbing) {
      // 猛スピードで中心へ引き寄せられる
      this.radiusX = lerp(this.radiusX, 0, this.accelFactor);
      this.radiusY = lerp(this.radiusY, 0, this.accelFactor);
      this.angle += 0.2; // 引き込まれると同時に回転を速くする（渦巻く！）
    } else {
      // 通常の軌道に戻る
      this.radiusX = lerp(this.radiusX, this.initialRX, 0.05);
      this.radiusY = lerp(this.radiusY, this.initialRY, 0.05);
      this.angle += this.speed;
    }
  }

  draw(centerX, centerY) {
    // 楕円運動の計算
    let x = centerX + cos(this.angle) * this.radiusX;
    let y = centerY + sin(this.angle) * this.radiusY;
    
    // 星型を描く
    push();
    translate(x, y);
    fill(255);
    noStroke();
    starShape(0, 0, this.size / 2, this.size, 5); // 5頂点の星型
    pop();
  }
}



// 星型を描くための補助関数
function starShape(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}


//マウスクリックで戻る処理
function mouseClicked() {
  window.location.href = '/worldmap/worldmap.html'; 
}