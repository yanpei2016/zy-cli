const inquirer = require('inquirer')  // 命令行问询插件
const iconv = require('iconv-lite'); // 编码格式化
const chalk =require('chalk')  // log信息  颜色
const ora = require('ora'); // 命令行 loading
const {exec} = require('child_process') // nodejs  里面的  promise
chalk.level = 3 // 设置chalk等级为3  支持的颜色 0 all  disabled; 1 16种 ； 2 256种； 3  1亿6千万种
const fs = require('fs') // nodejs  文件系统菜单
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
        message:'ui组件：',
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
        const spinner = ora({
            text: 'Loading Template',
            spinner:{
                interval: 80, // Optional
                // frames: ['!', '@', '#', '$', '%', '^', '&', '*']
                // "frames": [
                //     "▓",
                //     "▒",
                //     "░"
                // ]
                "frames": [
                    "⠋",
                    "⠙",
                    "⠹",
                    "⠸",
                    "⠼",
                    "⠴",
                    "⠦",
                    "⠧",
                    "⠇",
                    "⠏"
                ]
            }
        }).start();
        const gitUrl = 'https://github.com/yanpei2016/zy-temp.git'
        exec(`git clone ${gitUrl}`,{ encoding: 'binary' },(error,stdout,stderr)=>{ // 克隆模板并进入项目根目录
            if (error) { // 当有错误时打印出错误并退出操作
                console.log(iconv.decode(new Buffer(stderr, 'binary'), 'cp936'))
                console.log(chalk.red('模板下载失败，请检查网络后再下载'))
                process.exit()
            }
            spinner.succeed('Loading template successed')
            // 修改下载文件目录文案
            fs.renameSync(process.cwd()+'\\zy-temp',process.cwd()+`/${answer.projectName}`)
            // 当配置vuex时进行的操作
            if(answer.useVuex){
                fs.mkdirSync(`${process.cwd()}/${answer.projectName}/src/store/`)
                fs.mkdirSync(`${process.cwd()}/${answer.projectName}/src/store/module/`)
                let moduleFiles = ['index.js','module/index.js']
                moduleFiles.forEach(val=>{
                    let fileData = fs.readFileSync(__dirname+`/../templates/vuex/${val}`)
                    fs.writeFileSync(`${process.cwd()}/${answer.projectName}/src/store/${val}`,fileData)
                })
                spinner.succeed('Loading vuex successed')
            }
            // 当配置vue-router时进行的操作
            if(answer.useVueRouter){
                fs.mkdirSync(`${process.cwd()}/${answer.projectName}/src/router/`)
                let moduleFiles = ['index.js']
                moduleFiles.forEach(val=>{
                    let fileData = fs.readFileSync(__dirname+`/../templates/vue-router/${val}`)
                    fs.writeFileSync(`${process.cwd()}/${answer.projectName}/src/router/${val}`,fileData)
                })
                spinner.succeed('Loading vue-router successed')
            }
            let files = ['public/index.html','src/App.vue','src/main.js','src/components/HelloWorld.vue','package.json','vue.config.js','babel.config.js']
            new Promise(resolve=>{
                files.forEach((val,index)=>{
                    ejs.renderFile(`${answer.projectName}/${val}`,answer,(err,str)=>{
                        debugger
                        fs.writeFile(`${answer.projectName}/${val}`,str,()=>{
                            if(index===files.length-1){
                                resolve()
                            }
                        })
                    })
                })
            }).then(()=>{
                spinner.succeed('format template successed')
                spinner.stop()
                const downloadNodemodules = ora({
                    text: 'download node_modules',
                    spinner:{
                        interval: 80, // Optional
                        // frames: ['!', '@', '#', '$', '%', '^', '&', '*']
                        "frames": [
                            "▓",
                            "▒",
                            "░"
                        ]
                    }
                }).start();

                exec(`cd ${answer.projectName} && yarn install`,(err,stdout,stderr)=>{
                    if (error) { // 当有错误时打印出错误并退出操作
                        downloadNodemodules.fail('node_modules downLoad fail')
                        downloadNodemodules.stop()
                        process.exit()
                    }
                    downloadNodemodules.succeed('node_modules downLoad successed')
                    downloadNodemodules.stop()
                    console.log(chalk.blue(`cd ${answer.projectName} && yarn serve`))
                    process.exit() // 退出这次命令行操作
                })
            })
        })
    })
}