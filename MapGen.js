 class MapNode { //Class for each node in the map
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
    this.map = [];

  }

  loadMap(arr,bioArr, startOffset){ //Loads data from map into an array of MapNode objects
    let length1 = arr.length;
    let length2 = arr[0].length;
    this.map = [];
    for (let i = startOffset; i < length1; i++){
      (this.map).push([]);
      for (let j = startOffset; j < length2; j++){
        (this.map[i-startOffset]).push(new MapNode(arr[i][j],bioArr[i][j]));
      }
    }
  }

  pullMap(){ //To get the map from the object
    return (this.map);
  }

  pushMap(newmap){ //To directly add a new map overwriting the main map
    this.map = newmap;
  }

  editMapNode(posX, posY, newNode){ //To directly change a map node into another (useful for editing small areas of the map without reloading the whole thing, will run faster)
    this.map[posX][posY] = newNode;
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

  makeBiomesReadable(biomeMap, mainMap){ //Function to aid in the reading and creation of biomes
    let mapLen = biomeMap.length;
    let newBiomeMap = [];
    for (let i = 0; i<mapLen; i++){
      newBiomeMap.push([]);
      for (let j = 0; j < mapLen; j++){
        if (biomeMap[i][j] == 0.001){
          newBiomeMap[i].push(1); //Biome 1
        } else if (mainMap[i][j] < 0.0039) {
          newBiomeMap[i].push(2); //Beach
        } else if (mainMap[i][j] < 0.0042) {
          newBiomeMap[i].push(3); //Water
        } else if (mainMap[i][j] < 0.00425) {
          newBiomeMap[i].push(2); //Beach
        } else {
          newBiomeMap[i].push(4); //Biome 2
        }
      }
    }
    return newBiomeMap;
  }

  average(arr, size){ //Gets the average of all heights nearby, allows the noise to more accurately match terrain
    let arrLen = arr.length;
    let newMap = [];
    //let newMap = Array.from({ length: arrLen }, () => (Array.from({ length: arrLen }, () => (0))));
    let counter = 0;
    for (let i = 0; i < arrLen; i++){
      newMap.push([]);
      for (let j = 0; j < arrLen; j++){
        newMap[i].push(0);
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

  level(arr, rounding){ //Reduces the amount of heights to a set few so its more easily representable
    let arrLen = arr.length;
    for (let i = 0; i < arrLen; i++){
      for (let j = 0; j < arrLen; j++){
        arr[i][j] = Math.round(arr[i][j]*rounding)/rounding;
      }
    }
    return arr;
  }

  layerNoise(layers){ //Layers multiple noise frequencies on top of each other for more realistic terrain
    let mapArray = [];
    let temp = 0;
    for (let i = -1, row = 0; i < -0.5; i+=0.0004, row++){
      mapArray.push([]);
      for (let j = -1, col = 0; j < -0.5; j+=0.0004, col++){
        temp = mapGen.simplexNoise([i,j])+1;
        for (let layer = 0; layer < layers; layer++){
          temp += mapGen.simplexNoise([(i+1)*layer-1,(j+1)*layer-1])+1;
        }
        mapArray[row].push(temp/layers);
      }
    }  
    return mapArray;
  }
  
  arrAdd2D(arr1, arr2, avg, mirrorI, mirrorJ){ //Adds two arrays
    let length1 = arr1.length;
    let length2 = arr1[0].length;
    for (let i = 0; i < length1; i++){
      for (let j = 0; j < length2; j++){
        arr1[i][j] += arr2[(!mirrorI) ? i : length1-i-1][(!mirrorJ) ? j : length2-j-1]; //Adds array 1 to 2, with the option to add them while mirrored in either direction
        if (avg) {
          arr1[i][j] /= 2;
        }
      }
    }
    return arr1;
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

  generateMap(method){
    console.time("Noise Layering");
    let mapArray = [];
    if (method == 1){ //Added multiple methods of generating the map, they result in different terrain formations most of the time, method 2 performs similarly (sometimes a bit better) in runtime, method 3 performs significantly better but will produce a less visually pleasing result
      mapArray = mapGen.arrAdd2D(mapGen.layerNoise(Math.floor(Math.random()*24)+7),mapGen.layerNoise(Math.floor(Math.random()*5)+9), true, true, false); //Looks complicated but is actually pretty simple, adds two randomly selected layerings of noise together to form a more realistic and varied map
    } else if (method == 2) { //Method 2, many lower value noises
      mapArray = mapGen.arrAdd2D(mapGen.layerNoise(Math.floor(Math.random()*5)+12),mapGen.layerNoise(Math.floor(Math.random()*5)+12), true, true, false); 
      mapArray = mapGen.arrAdd2D(mapArray,mapGen.layerNoise(Math.floor(Math.random()*5)+12), true, false, true);
      mapArray = mapGen.arrAdd2D(mapArray,mapGen.layerNoise(Math.floor(Math.random()*5)+12), true, true, true);
    } else { //Method 3, a few lower value noises (same as method 2 but with fewer layers so that it runs faster) 
      mapArray = mapGen.arrAdd2D(mapGen.layerNoise(Math.floor(Math.random()*5)+12),mapGen.layerNoise(Math.floor(Math.random()*5)+12), true, true, false); 
      mapArray = mapGen.arrAdd2D(mapArray,mapGen.layerNoise(Math.floor(Math.random()*5)+12), true, false, true);
    }
    console.timeEnd("Noise Layering");
    console.time("Averaging");
    let newMap = mapGen.average(mapArray, 8);
    console.timeEnd("Averaging");
    console.time("leveling");
    newMap = mapGen.level(newMap, 10000);
    console.timeEnd("leveling");
    const biomeMap = mapGen.makeBiomesReadable(mapGen.level(mapGen.average(mapArray, 13), 1000),newMap);
    console.time("map loading");
    mapGen.loadMap(newMap, biomeMap, 13); //Loads in map removing the 13 dead pixels at the top and left of the map
    console.timeEnd("map loading");
    return [newMap,biomeMap];
  }
}



var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");


ctx.fillRect(0, 0, canvas.width, canvas.height);
mapGen = new MapGenerator(1200,[""]);
let [newMap,biomeMap] = mapGen.generateMap(1);
let tot = 0;
for (let i = -0.9783333, row = 13; i < 1; i+=0.00166666, row++){ //Rudimentary map display
  // THERE IS A 13 PIXEL OFFSET AT THE TOP WHEN DISPLAYING, NOTE THIS IS NOT PRESENT IN THE mapGen's map, which is loaded in with the loadMap function
  for (let j = -0.9783333, col = 13; j < 1; j+=0.001666666, col++)
  {
    tot += newMap[row][col];
    
    if (biomeMap[row][col] == 1){ //Fills the green areas
      ctx.fillStyle = "#00"+parseInt((newMap[row][col]*35000)).toString(16) + "00";
    } else if(biomeMap[row][col] == 2) { //Fills one part of beach
      ctx.fillStyle = "#FFFACD";
    } else if(biomeMap[row][col] == 3) { //Fills water
      ctx.fillStyle = "#0000"+parseInt((newMap[row][col]*35000)).toString(16);
    } else if(biomeMap[row][col] == 2) { // Fills other part of beach
      ctx.fillStyle = "#FFFACD";
    } else { //Fills biome 2
      ctx.fillStyle = "#"+parseInt((newMap[row][col]*40000)).toString(16).repeat(3);
    }
    ctx.fillRect((i+1)*600, (j+1)*600, 1, 1);
    //console.log(biomeMap[row][col]);
  }
}
tot /= (newMap.length-13)*(newMap.length-13);
console.log(tot);
