const inquirer = require('inquirer')  // 命令行问询插件
const iconv = require('iconv-lite'); // 编码格式化
const chalk =require('chalk')  // log信息  颜色
const {exec} = require('child_process') // nodejs  里面的  promise
chalk.level = 3 // 设置chalk等级为3  支持的颜色 0 all  disabled; 1 16种 ； 2 256种； 3  1亿6千万种
const fs = require('fs')
const ejs = require('ejs') // 模板语言
module.exports = ()=>{
    let prompts = [{
        type:'input', // 问题类型为填空题
        message:'项目名称:', // 问题描述
        name:'projectName', // 问题答案对应的属性，用户输入的内容被存储在then方法中第一个参数对应的该属性中
        validate:val=>{ // 对输入的值做判断
            if(val===""){
                return chalk.red('项目名不能为空，请重新输入')
            }
            return true
        }
    },{
        type:'input',
        message:'版本号:',
        name:'version',
        default:'1.0.0'
    },{
        type:'confirm',
        message:'是否使用vuex?',
        name:'useVuex',
        default:true
    },{
        type:'confirm',
        message:'是否使用vue-router',
        name:'useVueRouter',
        default:true
    },{
        type:'list',
        message:'ui框架：',
        name:'UIfrag',
        choices:[
            {name:'no UI fragment',value:'none'},
            {name:'element-ui',value:'eleUI'},
            {name:'ant-design-vue',value:'antVue'},
            {name:'vant',value:'vant'},
        ]
    },{
        type:'list',
        message:'预编译处理器:',
        name:'cssPrep',
        choices:[
            {name:'no preprocess',value:'none'},
            {name:'less',value:'less'},
            {name:'sass',value:'sass'}
        ]
    }]
    inquirer.prompt(prompts).then(answer=>{ // 通过用户的输入进行各种操作
        console.log(chalk.green('开始初始化文件\n'))
        console.log(chalk.gray('初始化中...'))
        const gitUrl = 'https://github.com/yanpei2016/zy-temp.git'
        exec(`git clone ${gitUrl}`,{ encoding: 'binary' },(error,stdout,stderr)=>{ // 克隆模板并进入项目根目录
            console.log(chalk.green('模板开始下载'))
            if (error) { // 当有错误时打印出错误并退出操作
                console.log(iconv.decode(new Buffer(stderr, 'binary'), 'cp936'))
                console.log(chalk.red('拷贝文件失败'))
                process.exit()
            }
            console.log(chalk.green('模板下载完毕'))
            // 当配置vuex时进行的操作
            if(answer.useVuex){
                fs.mkdirSync(`${process.cwd()}/${answer.projectName}/src/store/`)
                fs.mkdirSync(`${process.cwd()}/${answer.projectName}/src/store/module/`)
                // fs.mkdirSync(`${process.cwd()}/${answer.projectName}/src/store/modules/module`)
                let moduleFiles = ['index.js','module/actions.js','module/index.js','module/mutations.js','module/state.js']
                moduleFiles.forEach(val=>{
                    let fileData = fs.readFileSync(`${process.cwd()}/templates/vuex/${val}`)
                    fs.writeFileSync(`${process.cwd()}/${answer.projectName}/src/store/${val}`,fileData)
                })
                console.log(chalk.green('vuex配置完成'))
            }
            // 当配置vue-router时进行的操作
            if(answer.useVueRouter){
                fs.mkdirSync(`${process.cwd()}/${answer.projectName}/src/router/`)
                let moduleFiles = ['index.js']
                moduleFiles.forEach(val=>{
                    let fileData = fs.readFileSync(`${process.cwd()}/templates/vue-router/${val}`)
                    fs.writeFileSync(`${process.cwd()}/${answer.projectName}/src/router/${val}`,fileData)
                })
                console.log(chalk.green('vue-router配置完成'))
            }
            let files = ['public/index.html','src/App.vue','src/main.js','package.json']
            new Promise(resolve=>{
                files.forEach((val,index)=>{
                    ejs.renderFile(`${answer.projectName}/${val}`,answer,(err,str)=>{
                        fs.writeFile(`${answer.projectName}/${val}`,str,()=>{
                            if(index===files.length-1){
                                resolve()
                            }
                        })
                    })
                })
            }).then(()=>{
                console.log(chalk.green('初始化完成'))
                console.log(chalk.blue(`cd ${answer.projectName} && yarn install`))
                process.exit()
                // exec(`cd ${answer.projectName} && yarn install`,(err,stdout,stderr)=>{
                //     console.log(chalk.green('依赖包下载完毕'))
                //     if (error) { // 当有错误时打印出错误并退出操作
                //         console.log(chalk.red('拷贝文件失败'))
                //         process.exit()
                //     }
                //     console.log(chalk.green('初始化完成'))
                //     process.exit() // 退出这次命令行操作
                // })
            })
        })
    })
}