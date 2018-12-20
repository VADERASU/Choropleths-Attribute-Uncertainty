var express = require('express'),
    path = require('path'),
    consolidate = require('consolidate');

var isDev = process.env.NODE_ENV !== 'production';
var app = express();
var port = 3000;
app.use(express.static('data'));
app.use(express.static('client'));
app.use(express.static('client/page1/lib'));

app.engine('html', consolidate.ejs);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, './server/views'));

// local variables for all views
app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = true;


var fs = require('fs')
app.use(require('body-parser').urlencoded({limit: '5mb', extended: true}));

let tsnejs = require('./server/routes/TSNE/tsnemanager.js');
let MI = require('./server/routes/erroranalysis/MoranI.js');

app.post("/",function(req, res, next) {
    // parseReqJson(req.body, res, client);
    // let time = new Date()

    console.log(req.body.reqType)
     if(req.body.reqType=="tsne"){
        tsnejs.runtsne(req, res, next)
     }if(req.body.reqType=="MoranI"){
        MI.CalcLMI(req, res, next)
     }if(req.body.reqType=="write"){
        let w_data = new Buffer(req.body.data);

        fs.writeFile(__dirname + '/test2.txt', w_data, {flag: 'a'}, function (err) {
           if(err) {
            console.error(err);
            } else {
               console.log('end');
            }
        });

        let resj = JSON.stringify("done");
        res.send(resj);
     }if(req.body.reqType=="writeevent"){
        let w_data = new Buffer(req.body.data);
        fs.writeFile(__dirname + '/Ccrimeeventdata.txt', w_data, {flag: 'a'}, function (err) {
           if(err) {
            console.error(err);
            } else {
               console.log('end');
            }
        });
     }



    // console.log((new Date()).getTime()-time.getTime())

});







if (isDev) {

    // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
    var webpack = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpackDevConfig = require('./webpack.config.js');

    var compiler = webpack(webpackDevConfig);

    // attach to the compiler & the server
    app.use(webpackDevMiddleware(compiler, {

        // public path should be the same with webpack config
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));

    require('./server/routes')(app);

    // add "reload" to express, see: https://www.npmjs.com/package/reload
    var reload = require('reload');
    var http = require('http');

    var server = http.createServer(app);
    reload(server, app);

    server.listen(8000, function(){
        console.log('App (dev) is now running on port 8000!');
    });
} else {
    // static assets served by express.static() for production
    app.use(express.static(path.join(__dirname, 'public')));
    require('./server/routes')(app);
    app.listen(port, function () {
        console.log('App (production) is now running on port 3000!');
    });
}







// let express = require('express');
// let app = express();
// let http = require('http');
// let path = require('path');
// let util = require('util');
// let bodyParser = require('body-parser');
// let multer = require('multer'); 
// let client = require('./database/connect')
// let db = require('./database/querydb.js');
// let readText = require('./database/readtxt')

// app.use(express.static('./public'));
// app.use(express.static('./database'));
// app.use(express.static('./build'))

// app.use(require('body-parser').urlencoded({limit: '5mb', extended: true}));
// app.get('/', function(req, res) {
//         res.sendFile("index.html");
// });

// function parseReqJson(json, res, client) {
//   if (json.reqType === 'queryPoiByTraj') {
//     db.readText(res);
//   } else if (json.reqType === 'queryDb') {
//     db.query(res, client, json);
//   } else if (json.reqType === 'readText') {
//     readText.readText(res, json.fileName, json.begin, json.readLineLimit);
//   }
// }



// let server = app.listen(3001, function () {
//   let host = server.address().address;
//   let port = server.address().port;

//   console.log('My web is listening at http://%s:%s', host, port);
// });


