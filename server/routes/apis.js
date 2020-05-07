var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');

THREE = require("../model/three.js")
STLLoader = require("../model/STLLoader.js")

function toArrayBuffer(buf) {
	var ab = new ArrayBuffer(buf.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buf.length; ++i) {
			view[i] = buf[i];
	}
	return ab;
}

/**
 * 获取模型的长-z、宽-x、高-y、面积、体积
 * @param url {string} 模型的url
 */
router.get('/modelData', (req, res) => {
  var data = fs.readFileSync(path.resolve(__dirname, '..') + '/雪球金字塔.stl');
  var loader = new THREE.STLLoader();
  data = toArrayBuffer(data);
  var geometry = loader.parse(data);

  if (geometry instanceof THREE.BufferGeometry) {
    geometry = new THREE.Geometry().fromBufferGeometry(geometry);
}

//尺寸
geometry.computeBoundingBox();


var volume = 0;
for (var f = 0, fl = geometry.faces.length; f < fl; f++) {
    var face = geometry.faces[f];

    var vA = geometry.vertices[face.a];
    var vB = geometry.vertices[face.b];
    var vC = geometry.vertices[face.c];
    

    var x1 = vA.x,
        x2 = vB.x,
        x3 = vC.x;
    var y1 = vA.y,
        y2 = vB.y,
        y3 = vC.y;
    var z1 = vA.z,
        z2 = vB.z,
        z3 = vC.z;

    V = (-x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3) / 6;

    volume += V;
}
volume = (volume/1000).toFixed(2)+'cm3'
console.log('体积：',volume);


//三角形面积计算
function AreaOfTriangle(p1, p2, p3){
    var v1 = new THREE.Vector3();
    var v2 = new THREE.Vector3();
    // 通过两个顶点坐标计算其中两条边构成的向量
    v1 = p1.clone().sub(p2);
    v2 = p1.clone().sub(p3);

    var v3 = new THREE.Vector3();
    // 三角形面积计算
    v3.crossVectors(v1,v2);
    var s = v3.length()/2;
    return s
}

// 声明一个变量表示几何体的表面积
var area = 0.0;
// 遍历一个几何体的全部三角形geometry.faces，所有三角形面积累积就是几何体的表面积
// 对于不规则曲面，细分程度越高，面积计算精度越高
for (var i = 0; i < geometry.faces.length; i++) {
//三角形的对应顶点索引
var a = geometry.faces[i].a;
var b = geometry.faces[i].b;
var c = geometry.faces[i].c;
// 获得三角形对三个顶点的坐标
var p1 = geometry.vertices[a];
var p2 = geometry.vertices[b];
var p3 = geometry.vertices[c];
// 调用三角形面积计算函数AreaOfTriangle
area += AreaOfTriangle(p1, p2, p3); //三角形Face3面积累计计算
}
area = (area / 100).toFixed(2)+'cm2'
// 查看面积计算结果
console.log("面积：", area)



var boundingBox = geometry.boundingBox;
// console.log('x_y_z:', boundingBox.max);//实际长宽高，取2x,2y,2z。
let x = (boundingBox.max.x * 2 / 10).toFixed(2)+'cm'
let y = (boundingBox.max.y * 2 / 10).toFixed(2)+'cm'
let z = (boundingBox.max.z * 2 / 10).toFixed(2)+'cm'
console.log('x', x);
console.log('y', y);
console.log('z', z);




  res.json({
    status: 0,
    msg: 'success',
    data: {
      volume: volume,
      area: area,
      x: x,
      y: y,
      z: z
    }
  })
});

module.exports = router;