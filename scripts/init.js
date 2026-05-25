const fs = require('fs-extra');

// 项目编译完成后可以运行index.html进行访问
fs.copySync('./scripts/template/index.html', 'index.html');