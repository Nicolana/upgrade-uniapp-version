#!/usr/bin/env node

const { program } = require('commander');
const upgrade = require('./src/main');
const pkg = require('./package.json');
const chalk = require("chalk");

program
  .option('-u, --upgrade <type>', `
  SemVer规范的标准版本号采用 X.Y.Z 的格式，其中 X、Y 和 Z 为非负的整数，且禁止在数字前方补零。X 是主版本号、Y 是次版本号、而 Z 为修订号。每个元素必须以数值来递增。
  
    主版本号(major)：当你做了不兼容的API 修改
    次版本号(minor)：当你做了向下兼容的功能性新增
    修订号(patch)：当你做了向下兼容的问题修正。

  例如：1.9.1 -> 1.10.0 -> 1.11.0
  `)
  .option('--no-hooks', '绕过Git的hooks')
  .action((options) => {
    console.log("options = ", options)
      upgrade(options).then(() => { console.log(); }).catch(() => {
         process.exit(1);
      });
  })

program
  .version(pkg.version)
  .description(chalk.blue("升级 Uni-App 版本从未如此简单！"))
console.log();

//默认展示帮助信息
if (process.argv && process.argv.length < 2) {
    program.help();
}

// 接管命令行输入，参数处理
program.parse(process.argv);
