const fs = require('fs-extra');

const releaseConfig = {
    /**
     * 目标目录
     */
    "dist": "release",
    /**
     * 拷贝资源
     */
    "files": [
        "icon.png",
        "asset",
        "icon",
        "GameCreatorLib/gamecreator.js",
        "out/Game.js",
        "index.html",
        "package.json",
    ],
    /**
     * 需要加密的js文件
     */
    "uglifyjs": [
        "GameCreatorLib/gamecreator.js",
        "out/Game.js"
    ],
    /**
     * 覆盖package.json属性
     */
    "overwrite": {
        "private": false,
        "scripts": {
            "make": "build --tasks win-x64 ."
        },
        "devDependencies": {
            "@gamecreator/nwjs-builder-phoenix": "*"
        }
    }
};

release();

function release(cb) {
    let pkg = fs.readJsonSync('package.json');

    // 清理
    console.log(`清理`);
    fs.removeSync(releaseConfig.dist);

    // 拷贝资源
    console.log(`拷贝资源`);
    const files = releaseConfig.files;
    files.forEach(v => {
        fs.copySync(v, `${releaseConfig.dist}/${v}`);
    });

    // js加密
    console.log(`js加密`);
    const uglifyjs = releaseConfig.uglifyjs;
    uglifyjs.forEach(v => {
        uglifyJS(`${releaseConfig.dist}/${v}`);
    });

    // 调整package.json
    console.log(`调整package.json`);
    const overwrite = releaseConfig.overwrite;
    pkg = Object.assign(pkg, overwrite);
    fs.writeFileSync(`${releaseConfig.dist}/package.json`, JSON.stringify(pkg, null, 4), 'utf8');

    cb && cb();
}

/**
 * 加密js
 * 
 * @param {string} path js文件路径
 */
function uglifyJS(path) {
    const UglifyJS = require("uglify-js");

    const code = fs.readFileSync(path, 'utf8');
    const result = UglifyJS.minify(code);
    fs.writeFileSync(path, result.code, 'utf8');
}