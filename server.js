const Express = require('express');

const app = new Express();
const port = process.env.PORT || 8080;

app.use(Express.static('./static'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.info(`==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`)
  }
});
