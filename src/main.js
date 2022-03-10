const fs = require("fs");
const chalk = require("chalk");
const { resolve } = require('path')
const Hjson = require('hjson');
const log = require('./log');
const utils = require("./utils");

const rootPath = resolve('./');
const manifestFileName = "manifest.json";
const manifestFilePaths = [`${rootPath}/src/${manifestFileName}`, `${rootPath}/${manifestFileName}`];
const packagePath = `${rootPath}/package.json`;

function upgrade(version, tag) {
  version = version.split('.')
  switch (tag) {
    case 'patch':
      version[2] = Number(version[2]) + 1
      break
    case 'minor':
      version[2] = "0"
      version[1] = Number(version[1]) + 1
      break
    case 'major':
      version[1] = "0"
      version[2] = "0"
      version[0] = String(Number(version[0]) + 1)
      break
  }
  return version.join('.')
}

/**
 * 检查文件是否存在
 * @param path
 * @returns {boolean}
 */
function isFileExist(path) {
  return fs.existsSync(path);
}

function getManifestFilePath() {
  return new Promise((resolve, reject) => {
    for (let path of manifestFilePaths) {
      if (isFileExist(path)) {
        resolve(path)
        break;
      }
    }
    reject("no path")
  })
}

function upgradeManifest (upgradeType) {
  return new Promise((resolve, reject) => {
    getManifestFilePath().then(manifestPath => {
      // 获取manifest接口
      const rawData = fs.readFileSync(manifestPath, { encoding: 'utf8' });
      const manifestData = Hjson.rt.parse(rawData); // 解析JSON文件并保留字符串
      const oldVersion = manifestData.versionName;
      manifestData.versionName = upgrade(manifestData.versionName, upgradeType);
      console.log(manifestData)
      try {
        fs.writeFileSync(manifestPath, Hjson.rt.stringify(manifestData))
      } catch (err) {
        log.error(err)
        reject(err)
      }
      log.log(`manifest.json文件版本从 ${chalk.green(oldVersion)} 升级至 ${chalk.green(manifestData.versionName)}`)
      resolve(manifestData.versionName);
    }).catch(err => {
      log.error("错误: ❌ manifest.json文件不存在！")
      reject();
    })
  })
}

function upgradePackage(upgradeType) {
  return new Promise((resolve, reject) => {
    if (!isFileExist(packagePath)) {
      log.warn("警告⚠️: package.json文件不存在！")
      reject()
    }
    const rawData = fs.readFileSync(packagePath, { encoding: 'utf8' });
    const packageData = Hjson.parse(rawData);
    console.log(packageData);
    const oldVersion = packageData.version;
    packageData.version = upgrade(oldVersion, upgradeType);
    fs.writeFileSync(packagePath, Hjson.rt.stringify(packageData))
    log.log(`package.json文件版本从 ${chalk.green(oldVersion)} 升级至 ${chalk.green(packageData.version)}`)
    resolve(packageData.version)
  })
}

module.exports = ({ type: upgradeType, hooks, }) => {
  return new Promise((resolve, reject) => {
    Promise.allSettled([upgradeManifest(upgradeType), upgradePackage(upgradeType)]).then(res => {
      const [retData] = res; // 获取manifest升级成功与否的消息
      const version = retData.value;
      if (retData.status === 'fulfilled') {
        // 升级成功, 执行git操作
        utils.commit(`${version}`, hooks).then(() => {
          utils.tag(version).then(() => {
            Promise.all([utils.push(), utils.pushTag()]).then(() => {
              resolve()
            }).catch(() => {
              reject()
            });
          })
        })
      } else {
        // 升级失败
        log.error("升级失败", res);
        reject();
      }
    })
  })
};
