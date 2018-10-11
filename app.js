const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

var urlencodedParser = bodyParser.urlencoded({extended: false});

app.use('/public', express.static('public'));

app.get('/', function(req, resp) {
  fs.createReadStream(__dirname + '/public/index.html').pipe(resp);
});
//---------------------------------------------------------
app.get('/index.html', function(req, resp) {
  fs.createReadStream(__dirname + '/public/index.html').pipe(resp);
});
//---------------------------------------------------------
app.get('/form.html', function(req, resp) {
  fs.createReadStream(__dirname + '/public/form.html').pipe(resp);
});
//---------------------------------------------------------
app.get('/app.js', function(req, resp) {
  fs.createReadStream(__dirname + '/public/index.js').pipe(resp);
});
//---------------------------------------------------------
app.get('/form.js', function(req, resp) {
  fs.createReadStream(__dirname + '/public/form.js').pipe(resp);
});
//---------------------------------------------------------
app.get('/site.css', function(req, resp) {
  fs.createReadStream(__dirname + '/public/site.css').pipe(resp);
});
//---------------------------------------------------------
app.post("/createState", urlencodedParser, function (req, resp) {
  if(!req.body){
    return resp.sendStatus(400);
  }

  let readJSON = fs.readFileSync('./articles.json');
  let jsonFile = JSON.parse(readJSON);

  let flag = false;

  for(let i = 0; i < jsonFile.Articles.length; i++){
    if(req.body.userId == jsonFile.Articles[i].id){
      flag = true;
      resp.writeHead(404, {'Content-Type': 'text.html; charset=utf-8'});
      fs.createReadStream(__dirname + '/public/404.html').pipe(resp);
    }
  }

  if(!flag){
    jsonFile.Articles.push({id: req.body.userId,
                            title: req.body.userTitle,
                            text: req.body.userText,
                            date: req.body.userDate,
                            author: req.body.userAuthor,
                            page: req.body.userPage});

    fs.writeFileSync('./articles2.json', JSON.stringify(jsonFile));

    resp.send('Successful');
  }
  //resp.send(`${req.body.userId} - ${req.body.userAuthor}`);
});
//---------------------------------------------------------
app.post("/showArticle", urlencodedParser, function (req, resp) {
  if(!req.body){
    return resp.sendStatus(400);
  }

  console.log(req.body.sortType);
  console.log(req.body.sortField);
  console.log(req.body.page.length);
  console.log(req.body.limit);

  let readJSON = fs.readFileSync('./articles.json');
  let jsonFile = JSON.parse(readJSON);

  switch (req.body.sortField) {
    case 'id':
      jsonFile.Articles.sort(comparebyId);
      if(req.body.sortType == 'desc') jsonFile.Articles.reverse();
      break;
    case 'author':
      jsonFile.Articles.sort(comparebyAuthor);
      if(req.body.sortType == 'desc') jsonFile.Articles.reverse();
      break;
    default:
      break;
  }

  let messages = [];
  let message = {};
  let arr;
  let j = 0;

  if(req.body.page.length != 0){
    for(let i = 0; i < jsonFile.Articles.length; i++){
      if(req.body.page == jsonFile.Articles[i].page){
        arr = Array.from(jsonFile.Articles[i].comments);

        while (j < req.body.limit) {
          message.id = arr[j].id;
          message.date = arr[j].date;
          message.author = arr[j].author;
          messages.push(message);
          j++;
        }

        jsonFile.Articles[i].comments = messages;

        resp.send(jsonFile.Articles[i]);
        break;
      }
    }
  } else{
    resp.send(jsonFile.Articles);
  }

  //resp.send(`${req.body.userId} - ${req.body.userAuthor}`);
});
//---------------------------------------------------------
function comparebyId(obj1, obj2){
  return obj1.id - obj2.id;
}
function comparebyAuthor(obj1, obj2){
  return obj1.author - obj2.author;
}
//---------------------------------------------------------
app.listen(3000);

/*
var server = http.createServer(function(req, resp) {
  console.log("URL страницы: " + req.url);
  if(req.url === '/index.html' || req.url === '/'){
    resp.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    fs.createReadStream(__dirname + '/public/index.html').pipe(resp);
  } else if(req.url === '/form.html'){
    resp.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    fs.createReadStream(__dirname + '/public/form.html').pipe(resp);
  } else if(req.url === '/app.js'){
    resp.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    fs.createReadStream(__dirname + '/public/index.js').pipe(resp);
  } else if(req.url === '/form.js'){
    resp.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
    fs.createReadStream(__dirname + '/public/form.js').pipe(resp);
  } else if(req.url === '/site.css'){
    resp.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    fs.createReadStream(__dirname + '/public/site.css').pipe(resp);
  } else if(req.url === '/createState'){
    create();
  } else {
    resp.writeHead(404, {'Content-Type': 'text.html; charset=utf-8'});
    fs.createReadStream(__dirname + '/public/404.html').pipe(resp);
  }
});
*/

//server.listen(3000, '127.0.0.1');
