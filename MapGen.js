class MapNode {
  constructor(type, height) {
    this.type = type;
    this.height = height;
    this.attributes = [];
  }
  getType() {
    return this.type;
  }
  getHeight() {
    return this.height;
  }
  addAttribute(att) {
    this.attributes.push(att);
  }
  setType(type) {
    this.type = type;
  }
  setHeight(height) {
    this.height = height;
  }
}

class MapGenerator {
  constructor(size, parameters) {
    this.hashValues = [151, 160, 137, 91, 90, 15,
      131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
      190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
      88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
      77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
      102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
      5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
      223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
      251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
      49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
      138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    this.size = size;
    this.parameters = parameters;
    this.map = Array.from({ length: size }, () => (Array.from({ length: size }, () => (new MapNode(0, 0)))));

  }

  convolution(arr, kernel){
    let arrLen = arr.length;
    let kernLow = Math.floor(kernel.length/2);
    let newMap = Array.from({ length: arrLen }, () => (Array.from({ length: arrLen }, () => (0))));
    for (let i = 0; i < arrLen; i++){
      for (let j = 0; j < arrLen; j++){
        for (let k = -kernLow; k < kernLow+1; k++){
          for (let l = -kernLow; l < kernLow+1; l++){
            if (i+k > -1 && i+k < arrLen && j+l > -1 && j+l < arrLen){
              newMap[i][j] += kernel[k+3][l+3] * arr[i+k][j+l];
            }
          }
        }
      }
    }
    return newMap;
  }

  average(arr, size){
    let arrLen = arr.length;
    let newMap = Array.from({ length: arrLen }, () => (Array.from({ length: arrLen }, () => (0))));
    let counter = 0;
    for (let i = 0; i < arrLen; i++){
      for (let j = 0; j < arrLen; j++){
        counter = 0;
        for (let k = -size; k < size+1; k++){
          for (let l = -size; l < size+1; l++){
            if (i+k > -1 && i+k < arrLen && j+l > -1 && j+l < arrLen){
              newMap[i][j] += arr[i+k][j+l];
              counter++;
            }
          }
        }
      newMap[i][j] = arr[i][j]/counter;
      }
    }
    return newMap;
  }

  smoothing(arr, level, rounding){
    let arrLen = arr.length;
    for (let i = 0; i < arrLen; i++){
      for (let j = 0; j < arrLen; j++){
        if ((arr[i][j]+level)*0.9 < 2){
          arr[i][j] = (arr[i][j]+level)*0.9;
        } else {
          arr[i][j] = 1.8;
        }
        arr[i][j] = Math.round(arr[i][j]*rounding)/rounding;
      }
    }
    return arr;
  }
  
  gradientCalc(hash, x, y) {
    let h = hash & 0x3F;
    let u = h < 4 ? x : y;
    let v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }

  simplexNoise(coords) {
    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    let f2D = (Math.sqrt(3) - 1) / 2; //Skewing factor
    let g2D = (3 - Math.sqrt(3)) / 6; //Unskewing factor
    let skew = (coords[0] + coords[1]) * f2D;
    let ySkew = coords[1] + skew;
    let xSkew = coords[0] + skew;
    let i = Math.floor(xSkew);
    let j = Math.floor(ySkew);
    let unskew = (i + j) * g2D;
    let bigCoord = [(i - unskew), (j - unskew)];
    let smallCoord = [(coords[0] - bigCoord[0]), (coords[1] - bigCoord[1])];
    let cornerSet = [0,1];
    if (smallCoord[0] > smallCoord[1]) {
      cornerSet = [1, 0];
    } else {
      cornerSet = [0, 1];
    }

    let coordSetTwo = [smallCoord[0] - cornerSet[0] + g2D,
    smallCoord[1] - cornerSet[1] + g2D,
    smallCoord[0] - 1 + (2 * g2D),
    smallCoord[1] - 1 + (2 * g2D)];

    let gradientIndices = [this.hashValues[i + this.hashValues[j]],
    this.hashValues[i + cornerSet[0] + this.hashValues[j + cornerSet[1]]],
    this.hashValues[i + 1 + this.hashValues[j + 1]]];

    let t0 = 0.5 - (smallCoord[0] * smallCoord[0]) - (smallCoord[1] * smallCoord[1]);
    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * this.gradientCalc(gradientIndices[0], smallCoord[0], smallCoord[1]); 
    }

    let t1 = 0.5 - (coordSetTwo[0] * coordSetTwo[0]) - (coordSetTwo[1] * coordSetTwo[1]);
    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * this.gradientCalc(gradientIndices[1], coordSetTwo[0], coordSetTwo[1]);
    }

    let t2 = 0.5 - (coordSetTwo[2] * coordSetTwo[2]) - (coordSetTwo[3] * coordSetTwo[3]);
    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * this.gradientCalc(gradientIndices[2], coordSetTwo[2], coordSetTwo[3]);
    }

    return 45.23065*(n0 + n1 + n2);
  }
}
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");


ctx.fillRect(0, 0, canvas.width, canvas.height);
mapGen = new MapGenerator(100,[""]);
let mapArray = [];
for (let i = -1, row = 0; i < 1; i+=0.00166666, row++){
  mapArray.push([]);
  for (let j = -1, col = 0; j < 1; j+=0.001666666, col++)
  {
    mapArray[row].push(mapGen.simplexNoise([i,j])+1);
  }
}
//console.log(mapArray);
let gaussArray7 = [[1,4,7,10,7,4,1],[4,12,26,33,26,12,4],[7,26,55,71,55,26,7],[10,33,71,91,71,33,10],[7,26,55,71,55,26,7],[4,12,26,33,26,12,4],[1,4,7,10,7,4,1]];
for (let i=0; i < gaussArray7.length; i++){
  for (let j = 0; j < gaussArray7[0].length; j++){
    gaussArray7[i][j] *= 1/1100;
  }
}
let newMap = mapGen.convolution(mapArray, gaussArray7, 7);
newMap = mapGen.average(newMap, 12);
//console.log(newMap);
newMap = mapGen.smoothing(newMap, 0.001, 10000);

//console.log(newMap);
for (let i = -1, row = 0; i < 1; i+=0.00166666, row++){
  for (let j = -1, col = 0; j < 1; j+=0.001666666, col++)
  {
    //console.log("#"+parseInt(((mapGen.simplexNoise([i,j])+1)*8388607)).toString(16));
    ctx.fillStyle = "#"+parseInt((newMap[row][col]*8388607)).toString(16);
    ctx.fillRect((i+1)*600, (j+1)*600, 1, 1);
  }
}
