const url = require("url")
var gulp = require('gulp');
var webserver = require('gulp-webserver'); //web服务热启动
var browserify = require('gulp-browserify'); //模块化的打包
var sass = require('gulp-sass'); //sass编译
var autoprefixer = require('gulp-autoprefixer'); //自动添加浏览器前缀
var sequence = require('gulp-sequence'); //gulp启动任务的命令
var chokidar = require('chokidar'); //文件监听
const eslint = require('gulp-eslint');

//js模块化打包
gulp.task("jsModule", () => {
        gulp.src("./src/**/*.js")
            .pipe(browserify({
                insertGlobals: true,
                debug: !gulp.env.production
            }))
            .pipe(gulp.dest("./dist"))
    })
    // js检测
gulp.task("devJsEslint", function() {
        gulp.src("./src/**/*.js")
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.results(results => {
                // Called once for all ESLint results.
                console.log(`Total Results: ${results.length}`);
                console.log(`Total Warnings: ${results.warningCount}`);
                console.log(`Total Errors: ${results.errorCount}`);
            }))

    })
    //sass编译
gulp.task("sass", () => {
        gulp.src("./src/sass/*.scss")
            .pipe(sass())
            .pipe(autoprefixer({
                borwsers: ['last 2 versions', 'Android > 4.0']
            }))
            .pipe(gulp.dest("./dist/css"))
    })
    //css拷贝
gulp.task("cssCopy", () => {
    gulp.src("./src/**/*.css")

    .pipe(autoprefixer({
            borwsers: ['last 2 versions', 'Android > 4.0']
        }))
        .pipe(gulp.dest("./dist"))
})

//static拷贝
gulp.task("staticCopy", () => {
        gulp.src("./src/static/*")
            .pipe(gulp.dest("./dist/static"))
    })
    //html拷贝
gulp.task("htmlCopyServer", ["devJsEslint", "jsModule", "sass"], () => {
        gulp.src("./src/**/*.html")
            .pipe(gulp.dest("./dist"))
            .on('end', () => {
                // 只有监听到html复制完毕，才会启动服务
                sequence(['server'], () => {
                    console.log("服务启动")
                })
            });
    })
    //html拷贝
gulp.task("htmlCopy", ["jsModule", "sass"], () => {
        gulp.src("./src/**/*.html")
            .pipe(gulp.dest("./dist"))
    })
    //启动热服务
gulp.task('server', function() {
    gulp.src("./dist")
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            open: "/page/index.html",
            host: "127.0.0.1",
            port: "8080",
            // middleware: function(req, res, next) {
            //     var pathName = url.parse(req.url).pathname
            //     middlewareData.forEach(function(i) {
            //         switch (i.route) {
            //             case pathName:
            //                 {
            //                     i.handle(req, res, next, url)
            //                 }
            //                 break;
            //         }
            //     })

            //     next()
            // },
        }));
});


gulp.task("taskListen", () => {
    //html文件的监听
    chokidar.watch("./src/page").on("all", () => {
            sequence(['htmlCopy'], () => {
                console.log("html更新成功")
            })
        })
        //sass文件的监听
    chokidar.watch("./src/sass").on("all", () => {
            sequence(['sass'], () => {
                console.log("sass更新成功")
            })
        })
        //css文件的监听
    chokidar.watch("./src/css").on("all", () => {
            sequence(['cssCopy'], () => {
                console.log("css")
            })
        })
        //js文件的监听
    chokidar.watch("./src/js").on("all", () => {
            sequence(['jsModule'], () => {
                console.log("js更新成功")
            })
        })
        //static文件的监听
    chokidar.watch("./src/static").on("all", () => {
        sequence(['staticCopy'], () => {
            console.log("static更新成功")
        })
    })
})

gulp.task("dev", ["htmlCopyServer"], () => {

    sequence(['taskListen'], () => {
        console.log("监听成功")
    })
})