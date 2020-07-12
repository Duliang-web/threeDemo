var express = require('express');
var router = express.Router();

var parse = require("../public/javascripts/parse")

/**
 * 获取模型的长-z、宽-x、高-y、面积、体积
 * @param url {string} 模型的url
 */
router.get('/modelData', (req, res) => {
  parse().then((data) => {
    res.json({
      status: 0,
      msg: 'success',
      data: data
    })
  })
});

module.exports = router;