#USAGE EXAMPLE

install application

```bash
npm i git+ssh://git@github.com:a-sydorenko/application.git --save
```

```javascript
const http = require('http')
const Application = require('application')
const app = new Application()

require('./router')(app) // see tests

http
  .createServer(app.router)
  .on('event', () => {})
```