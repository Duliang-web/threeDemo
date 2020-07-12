var fs = require("fs");
var path = require('path');
var phantom = require('phantom');
THREE = require("./three.js")
require("./STLLoader.js")
require("./ctm.js")
require("./lzma.js")
require("./CTMLoader.js")

function toArrayBuffer(buf) {
	var ab = new ArrayBuffer(buf.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buf.length; ++i) {
			view[i] = buf[i];
  }
	return ab;
}

// 获取模型相关数据
function getData (geometry, resolve) {
  if (geometry instanceof THREE.BufferGeometry) {
    geometry = new THREE.Geometry().fromBufferGeometry(geometry)
  }

  // 尺寸
  geometry.computeBoundingBox()

  var volume = 0
  for (var f = 0, fl = geometry.faces.length; f < fl; f++) {
    var face = geometry.faces[f]

    var vA = geometry.vertices[face.a]
    var vB = geometry.vertices[face.b]
    var vC = geometry.vertices[face.c]

    var x1 = vA.x
    var x2 = vB.x
    var x3 = vC.x
    var y1 = vA.y
    var y2 = vB.y
    var y3 = vC.y
    var z1 = vA.z
    var z2 = vB.z
    var z3 = vC.z

    var V = (-x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3) / 6

    volume += V
  }
  volume = (volume / 1000).toFixed(2)
  console.log('体积：', volume)

  // 三角形面积计算
  function AreaOfTriangle (p1, p2, p3) {
    var v1 = new THREE.Vector3()
    var v2 = new THREE.Vector3()
    // 通过两个顶点坐标计算其中两条边构成的向量
    v1 = p1.clone().sub(p2)
    v2 = p1.clone().sub(p3)

    var v3 = new THREE.Vector3()
    // 三角形面积计算
    v3.crossVectors(v1, v2)
    var s = v3.length() / 2
    return s
  }

  // 声明一个变量表示几何体的表面积
  var area = 0.0
  // 遍历一个几何体的全部三角形geometry.faces，所有三角形面积累积就是几何体的表面积
  // 对于不规则曲面，细分程度越高，面积计算精度越高
  for (var i = 0; i < geometry.faces.length; i++) {
    // 三角形的对应顶点索引
    var a = geometry.faces[i].a
    var b = geometry.faces[i].b
    var c = geometry.faces[i].c
    // 获得三角形对三个顶点的坐标
    var p1 = geometry.vertices[a]
    var p2 = geometry.vertices[b]
    var p3 = geometry.vertices[c]
    // 调用三角形面积计算函数AreaOfTriangle
    area += AreaOfTriangle(p1, p2, p3) // 三角形Face3面积累计计算
  }
  area = (area / 100).toFixed(2)
  // 查看面积计算结果
  console.log('面积：', area)

  var boundingBox = geometry.boundingBox

  let x = ((boundingBox.max.x - boundingBox.min.x) / 10).toFixed(2)
  let y = ((boundingBox.max.y - boundingBox.min.y) / 10).toFixed(2)
  let z = ((boundingBox.max.z - boundingBox.min.z) / 10).toFixed(2)
  console.log('x', x)
  console.log('y', y)
  console.log('z', z)

  let data = {
    volume: volume,
    area: area,
    x: x,
    y: y,
    z: z,
    name: '魔猴魔方'
  }

  // resolve(data)
  getImg(geometry, data, resolve)
}

// 获取封面图
async function getImg (geometry, data, resolve) {
  var instance = await phantom.create()
  var page = await instance.createPage()
  var status = await page.open('http://127.0.0.1:8080/demo.html')
  if(status=='success'){
    setTimeout(function() {
      page.render("3d.png");
    }, 6000)
    
  }
}

function parse (url) {
  /**
   * ctm、stl数据加载
   */
  url = path.resolve(__dirname, '../') + '/雪球金字塔.stl'
  let reg = /\.ctm$/
  let loader = new THREE.CTMLoader()
  if (!reg.test(url)) {
    // 如果返回的为stl格式的3d文件，则用stl文件加载器
    loader = new THREE.STLLoader()
  }

  var data = fs.readFileSync(url);
  data = toArrayBuffer(data);
  var geometry = loader.parse(data);

  return new Promise(function (resolve, reject) {
      getData(geometry, resolve)
  })
}
module.exports = parse