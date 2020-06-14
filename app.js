let express = require('express');
let path = require('path');
let app = express();
app.engine('html', require('ejs').renderFile); // http://expressjs.com/en/5x/api.html#app.engine
app.set('view engine', 'ejs');
// this serves all the files in views!!!amazing

//require('./public/views')
app.use(express.static(__dirname + '/public/views'));
app.use(express.static(__dirname + '/public/'));

//app.use(express.static('/views'));

// because app.use already accessed the file
app.get('/style.css', (req, res, next)=> {
  //console.log("why wont you get server here...", req.url);
  next();
});
app.get('*', (req, res, next)=> {
  //console.log("what do we have here", req.url);
  next();
});

app.get('/', (req, res, next)=> {
  //console.log("hi the?????????????????r...", req.url);
  //load html with settings...
  res.sendFile('index.html', {
    root: path.join(__dirname, "./public/views/")
  });
  //res.render('index', {});
  /*    res.render('addedit.html', {
      title: "Notes ("+nmDbEngine+")",
      postpath: '/edit',
      note:note
    });*/
});
app.listen(3030);
