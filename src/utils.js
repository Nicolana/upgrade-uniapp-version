const cmd = require("node-cmd");
const chalk = require("chalk");

function runAddToGit(version, tag) {
  cmd.run(`git add . && git commit -m "update ${manifest_name} version to ${version}" ${args.join(" ")}`, (err, data, stderr) => {
    console.log(data, stderr)
  })
  cmd.run(`npm version ${tag} && git push && git push --tags`, (err, data, stderr) => {
    console.log(data, chalk.yellow(stderr))
  })
  console.log('Git: ' + chalk.yellow(`V${old_version}`) + "->" + chalk.green(`V${version} updated and commited successfully!!`))
}

/**
 * 推送消息
 * @returns {Promise<unknown>}
 */
function push() {
  return new Promise((resolve, reject) => {
    const command = 'git push';
    cmd.run(command, (err, data, stderr) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

/**
 * 推送tag
 * @returns {Promise<unknown>}
 */
function pushTag() {
  return new Promise((resolve, reject) => {
    // 提交标签
    const pushCommand = `git push origin --tags`;
    cmd.run(pushCommand, (err, data, stderr) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

/**
 * 添加commit信息
 * @param message
 * @param noHooks
 * @returns {Promise<unknown>}
 */
function utils(message, noHooks = false) {
  return new Promise((resolve, reject) => {
    const command = `git add . && git commit -m "${message}" ` + (noHooks ? '--no-verify' : '');
    cmd.run(command, (err, data, stderr) => {
      console.log(data, stderr)
      if (err) {
        reject(stderr)
      }
      resolve(data)
    })
  })
}

/**
 * 快速给分支打标签并提交
 * @param version
 * @returns {Promise<unknown>}
 */
function tag(version) {
  return new Promise((resolve, reject) => {
    const command = `git tag v${version}`
    cmd.run(command, (err, data, stderr) => {
      console.log(data, stderr);
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

module.exports = {
  push,
  pushTag,
  commit: utils,
  tag,
}
