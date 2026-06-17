let worldGrid = [];
let dotSize = 15; // ドットの大きさ
let spacing = 20; // ドットの間隔（ドットのサイズ＋隙間）

let selectedCountries = [];

// ズームと移動のための変数
let zoom = 1.0;      // 拡大率（1.0 = 100%）
let offsetX = 0;     // 画面のX方向の移動量
let offsetY = 0;     // 画面のY方向の移動量
let moveSpeed = 10;  // 矢印キーを押した時の移動スピード

let pg;
let usaImg, franceImg, indiaImg, japanImg, brazilImg;
let usaModel, franceModel, indiaModel, brazilModel;

// パフォーマンス改善：各モデルのバウンディングボックスサイズをキャッシュする変数
let modelSizes = {};

// パフォーマンス改善：関数呼び出しを減らすためのマッピングオブジェクト
let countryImages = {};
let countryModels = {};

// 各国への遷移先URLマッピング
const countryUrls = {
  2: '/usa/usa.html',
  3: '/france/france.html',
  4: '/india/india.html',
  5: '/japan/japan.html',
  6: '/brazil/brazil.html'
};

function preload() {
  usaImg = loadImage('/asset/image/usa.jpg');
  franceImg = loadImage('/asset/image/france.jpg');
  indiaImg = loadImage('/asset/image/india.jpg');
  japanImg = loadImage('/asset/image/japan.jpg');
  brazilImg = loadImage('/asset/image/brazil.jpg');
  
  usaModel = loadModel('/asset/model/LibertStatue.obj', true);
  franceModel = loadModel('/asset/model/10067_Eiffel_Tower_v1_max2010_it1.obj', true);
  indiaModel = loadModel('/asset/model/tajmahal.obj', true);
  brazilModel = loadModel('/asset/model/Christ the Redeemer-bl.obj', true);
}

function setup() {
  // 改善：スマホの高解像度ディスプレイによる負荷を抑える（効果大）
  pixelDensity(1);
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  imageMode(CENTER);
  angleMode(DEGREES);

  // マッピングの初期化（draw内での条件分岐を高速化するため）
  countryImages = { 2: usaImg, 3: franceImg, 4: indiaImg, 5: japanImg, 6: brazilImg };
  countryModels = { 2: usaModel, 3: franceModel, 4: indiaModel, 5: franceModel, 6: brazilModel };

  // 改善：モデルのサイズ（BoundingBox）を事前に1回だけ計算してキャッシュする
  modelSizes[2] = usaModel.calculateBoundingBox().size;
  modelSizes[3] = franceModel.calculateBoundingBox().size;
  modelSizes[4] = indiaModel.calculateBoundingBox().size;
  modelSizes[5] = franceModel.calculateBoundingBox().size; // 元コード準拠（フランスのモデルを日本に使用）
  modelSizes[6] = brazilModel.calculateBoundingBox().size;

  let savedCountries = localStorage.getItem('selectedCountriesData');
  if (savedCountries) {
    selectedCountries = JSON.parse(savedCountries);
    localStorage.removeItem('selectedCountriesData');
  }
  
  // 地図データ
  worldGrid = [
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,0, 1,1,1,1,1, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,1,1,0,0, 0,0,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,0, 0,0,0,0,2, 2,2,0,0,0, 0,0,0,0,0, 1,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,0,2, 2,2,2,1,1, 1,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,1, 1,1,1,0,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,0,0,2,2, 2,2,2,1,1, 1,1,1,1,1, 1,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,1,1, 0,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,2, 2,2,2,1,1, 1,1,1,1,1, 1,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,1,1, 0,0,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,1,0, 0,0,0,0,2, 2,2,0,1,1, 1,1,1,1,1, 0,0,0,1,1, 1,0,0,0,0, 0],
    [0, 0,1,0,0,0, 0,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,0,0,1,0, 0,0,0,0,2, 0,0,0,0,0, 1,1,1,1,1, 1,1,0,1,1, 1,0,0,0,0, 0],
    [0, 0,1,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,0,0, 0],
    [0, 0,0,3,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 2,2,2,2,2, 2,1,1,1,1, 0,0,0,0,0, 0],
    [0, 0,0,3,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 2,2,2,2,2, 2,2,2,2,2, 0,0,0,0,0, 0],
    [0, 0,1,1,0,1, 0,0,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,1,1,0, 5,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,2,2,2,2, 2,2,2,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,1,1, 1,1,1,1,1, 1,1,1,1,1, 1,1,0,0,5, 5,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,2,2,2,2, 2,2,2,0,0, 0,0,0,0,0, 0],
    [0, 0,1,1,1,1, 1,1,1,1,1, 0,1,1,1,1, 1,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,1,1,1, 0,0,2,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,0,1, 1,0,0,1,4, 4,4,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,0,1, 1,0,0,0,4, 4,0,0,1,1, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,0,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,1,0, 0,0,0,0,4, 4,0,0,1,1, 0,0,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,1,0,0, 0,0,0,0,0, 0],
    [0, 1,1,1,1,1, 1,1,1,1,1, 0,0,0,0,0, 0,0,0,1,0, 0,0,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 1,1,1,0,0, 0],
    [0, 0,0,0,0,1, 1,1,1,1,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 6,6,6,6,0, 0],
    [0, 0,0,0,0,0, 1,1,1,1,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,1, 6,6,6,6,6, 0],
    [0, 0,0,0,0,0, 1,1,1,1,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,1,0, 1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,6,6, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,6,0, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,0,0, 0],
    [0, 0,0,0,0,0, 1,1,1,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,1,1,1,1, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,6,0,0, 0],
    [0, 0,0,0,0,0, 1,1,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 1,1,0,0,0, 1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,1,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 1,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,1, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0],
    [0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0]
  ];
  
  pg = createGraphics(150, 150); 
  pg.background(240);
  pg.erase();
  pg.ellipse(pg.width / 2, pg.height / 2, pg.width, pg.height);
  pg.noErase();
}

function draw() {
  background(240);
  
  handleKeyboardInput();
  orbitControl();

  ambientLight(150);
  directionalLight(255, 255, 255, 0.5, 1, -0.5);

  let rows = worldGrid.length;
  let cols = worldGrid[0].length;
  let startX = -(cols * spacing) / 2;
  let startY = -(rows * spacing) / 2;

  scale(zoom);
  translate(offsetX, offsetY);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let tile = worldGrid[r][c];
      if (tile > 0) {
        let x = startX + c * spacing;
        let y = startY + r * spacing;

        push();
        translate(x, y, 0); 
        
        let isSelected = selectedCountries.includes(tile);
      
        if (tile >= 2 && tile <= 6 && isSelected) {
          // 改善：関数呼び出しではなく事前にマッピングしたオブジェクトから高速取得
          let img = countryImages[tile];
          noStroke();
          texture(img); 
          plane(dotSize, dotSize);
  
          // 改善：マスク用の描画（必要であれば残しますが、2重planeは描画負荷になるため1つにまとめるか、ここを軽量化するとさらに上がります）
          texture(pg);
          plane(dotSize, dotSize);
          
          if (isRepresentativeDot(tile, r, c)) {
            let countryModel = countryModels[tile];
            // 改善：毎フレームの calculateBoundingBox() を廃止し、setupで計算したキャッシュを適用
            let sizeBBox = modelSizes[tile];
            push();
            
            if(tile === 2) {
              translate(0 - spacing / 2, 0 - spacing / 2, sizeBBox.z / 2);
              rotateX(90);
            }
            else if (tile === 3) {
              translate(0, 0 + spacing / 2, -10 + sizeBBox.y / 2);
            }
            else if (tile === 4) {
              translate(0, 0, sizeBBox.z / 9);
              rotateX(90);
            }
            else if (tile === 6) {
              translate(0, 0, sizeBBox.z / 2);
              rotateX(90);
            }
            scale(0.3);
            stroke(40);
            strokeWeight(0.05);
            noFill();
            model(countryModel);
            pop();
          }
          
        } else {
          ambientMaterial(144, 173, 102);
          sphere(dotSize / 2); 
        }
        pop();
      }
    }
  }
}

function isRepresentativeDot(num, r, c) {
  if (num === 2) return (r === 14 && c === 46); 
  if (num === 3) return (r === 12 && c === 3);  
  if (num === 4) return (r === 18 && c === 16); 
  if (num === 5) return (r === 15 && c === 26); 
  if (num === 6) return (r === 21 && c === 52); 
  return false;
}

function handleKeyboardInput() {
  if (keyIsDown(ENTER) || keyIsDown(187) || keyIsDown(88)) zoom += 0.02;
  if (keyIsDown(189) || keyIsDown(90)) zoom = max(0.5, zoom - 0.02);

  if (keyIsDown(LEFT_ARROW))  offsetX += moveSpeed / zoom;
  if (keyIsDown(RIGHT_ARROW)) offsetX -= moveSpeed / zoom;
  if (keyIsDown(UP_ARROW))    offsetY += moveSpeed / zoom;
  if (keyIsDown(DOWN_ARROW))  offsetY -= moveSpeed / zoom;
}

function mouseClicked() {
  let rows = worldGrid.length;
  let cols = worldGrid[0].length;
  let startX = (width - cols * spacing) / 2;
  let startY = (height - rows * spacing) / 2;

  let adjustedMouseX = (mouseX - width / 2 - offsetX) / zoom + width / 2;
  let adjustedMouseY = (mouseY - height / 2 - offsetY) / zoom + height / 2;

  let clickedC = floor((adjustedMouseX - startX) / spacing);
  let clickedR = floor((adjustedMouseY - startY) / spacing);

  if (clickedC >= 0 && clickedC < cols && clickedR >= 0 && clickedR < rows) {
    let clickedTile = worldGrid[clickedR][clickedC];
    if (clickedTile >= 2 && clickedTile <= 6) {
      if (!selectedCountries.includes(clickedTile)) {
        selectedCountries.push(clickedTile);
      }

      // 改善：連続した大量の if 分岐をオブジェクトマッピングでスッキリ共通化
      if (countryUrls[clickedTile]) {
        localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
        window.location.href = countryUrls[clickedTile];
        return;
      }
    }
  }
}