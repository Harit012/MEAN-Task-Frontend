const express = require('express');
const app = express();

app.use(express.static('dist/angular-front-end/browser'));

app.get('/*', function(req, res) {
  res.sendFile('index.html', {root: 'dist/angular-front-end/browser'}
);
});

app.listen(4200, () => {
  console.log('Server started on port 4200');
});
