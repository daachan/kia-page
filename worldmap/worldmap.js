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
let usaImg;
let franceImg;
let indiaImg;
let japanImg;
let brazilImg;

let usaModel;
let franceModel;
let brazilModel;


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
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  imageMode(CENTER);
  angleMode(DEGREES);

  let savedCountries = localStorage.getItem('selectedCountriesData');
  if (savedCountries) {
    // 保存されていた記憶があれば配列に戻して復活させる
    selectedCountries = JSON.parse(savedCountries);
    
    // 読み込んだら、ブラウザの記憶（localStorage）の中身をすぐ消去する！
    localStorage.removeItem('selectedCountriesData');
  }
  
  // 画像のデザインを元にした簡易ドット世界地図データ (0:海、1:陸地, 2:アメリカ, 3:フランス, 4:インド, 5:日本, 6:ブラジル)
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
  
  // キーボードの常時入力（ズーム・移動）を処理
  handleKeyboardInput();
  
  orbitControl();

  // WEBGL用のライト設定
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
          let img = getCountryImage(tile);
          noStroke();
          texture(img); 
          plane(dotSize, dotSize);
  
          texture(pg);
          plane(dotSize, dotSize);
          
          // 現在処理中のマス(r, c)が「各国の特定の1点」である時のみ3Dモデルを描画
          if (isRepresentativeDot(tile, r, c)) {
            let countryModel = getCountryModel(tile);
            let bbox = countryModel.calculateBoundingBox();
            push();
            
            if(tile === 2) {
              translate(0-spacing/2, 0-spacing/2, bbox.size.z/2);
              rotateX(90);
            }
            else if (tile === 3) {
              translate(0, 0+spacing/2, -10+bbox.size.y/2);
            }
            else if (tile === 4) {
                translate(0, 0, bbox.size.z/9);
                rotateX(90);
            }
            else if (tile === 6) {
              translate(0, 0, bbox.size.z/2);
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


function getCountryImage(num) {
  if (num === 2) return usaImg;
  if (num === 3) return franceImg;
  if (num === 4) return indiaImg;
  if (num === 5) return japanImg;
  if (num === 6) return brazilImg;
}

// 各国の3Dモデルを配置する「特定の1ドット」のインデックスを判定
function isRepresentativeDot(num, r, c) {
  if (num === 2) return (r === 14  && c === 46); 
  if (num === 3) return (r === 12 && c === 3);  
  if (num === 4) return (r === 18 && c === 16); 
  if (num === 5) return (r === 15 && c === 26); 
  if (num === 6) return (r === 21 && c === 52); 
  return false;
}


function getCountryModel(num) {
  if (num === 2) return usaModel;
  if (num === 3) return franceModel;
  if (num === 4) return indiaModel;
  if (num === 5) return franceModel;
  if (num === 6) return brazilModel;
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


        if (clickedTile == 2) {
         // ここから追加：ジャンプする前に現在の選択状態を保存する
         // 配列のままだと保存できないので、JSON.stringifyで文字列に変換して保存します
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         
         window.location.href = '/usa/usa.html';
         return; // 地図のドット選択処理を動かさないためにここで処理を終了する
        }

        if (clickedTile == 3) {
         // ここから追加：ジャンプする前に現在の選択状態を保存する
         // 配列のままだと保存できないので、JSON.stringifyで文字列に変換して保存します
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         
         window.location.href = '/france/france.html';
         return; // 地図のドット選択処理を動かさないためにここで処理を終了する
        }

        if (clickedTile == 4) {
         // ここから追加：ジャンプする前に現在の選択状態を保存する
         // 配列のままだと保存できないので、JSON.stringifyで文字列に変換して保存します
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         
         window.location.href = '/india/india.html';
         return; // 地図のドット選択処理を動かさないためにここで処理を終了する
        }

        if (clickedTile == 5) {
         // ここから追加：ジャンプする前に現在の選択状態を保存する
         // 配列のままだと保存できないので、JSON.stringifyで文字列に変換して保存します
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         
         window.location.href = '/japan/japan.html';
         return; // 地図のドット選択処理を動かさないためにここで処理を終了する
        }

        if (clickedTile == 6) {
         // ここから追加：ジャンプする前に現在の選択状態を保存する
         // 配列のままだと保存できないので、JSON.stringifyで文字列に変換して保存します
         localStorage.setItem('selectedCountriesData', JSON.stringify(selectedCountries));
         
         window.location.href = '/brazil/brazil.html';
         return; // 地図のドット選択処理を動かさないためにここで処理を終了する
        }
    }
  }
}