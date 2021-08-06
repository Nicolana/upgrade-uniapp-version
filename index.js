var fs = require("fs");
var chalk = require("chalk");
var child_process = require("child_process");
const manifest_name = "manifest.json"
const manifest_path = __dirname + `\\${manifest_name}`;
var cmd = require('node-cmd');

console.log( __filename);
console.log( __dirname );

let old_version = "";

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

function runAddToGit(version, tag) {
    cmd.run(`git add . && git commit -m "update ${manifest_name} version to ${version}"`, (err, data, stderr) => {
        console.log(data, stderr)
    })
    cmd.run(`npm version ${tag} && git push && git push --tags`, (err, data, stderr) => {
        console.log(data, chalk.red(stderr))
    })
    console.log('Git: ' + chalk.yellow(`V${old_version}`) + "->" + chalk.green(`V${version} updated and commited successfully!!`))
}

function main () {
    fs.readFile(manifest_path, 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        data = data.replace(/\/\*[\s\S]*?\*\//g, '')
        let dt = JSON.parse(data)
        console.log('Old Version: ' + chalk.yellow(`V${dt.versionName}`))
        old_version = dt.versionName;
        if (process.argv.length > 2) {
            let tag = process.argv[2]
            dt.versionName = upgrade(dt.versionName, tag)
            fs.writeFile(manifest_path, JSON.stringify(dt, null, 4), err => {
                if (err) {
                    console.error(err)
                    return
                }
                runAddToGit(dt.versionName, tag)
            })
            return
        } else {
            throw "err: 缺少参数"
        }
    })
}

main()
