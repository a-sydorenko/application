#USAGE EXAMPLE

install application

```bash
npm i git+ssh://git@github.com:a-sydorenko/application.git --save
```

```javascript
const http = require('http')
const { Application, HttpError } = require('application')
const app = new Application()

app.pre((req, res, next) => {
  // this middleware will be called before req.on('data', ...) will be assigned

  if (req.headers['content-length'] > 10000) {
    //                        status, message
    return next(new HttpError(413, 'your message here')) // message will 
  }
})

app.use((err, req, res) => {
  res.writeHead(err.status, { 'Content-Type': 'text/plain' })
  res.write(err.message)
  res.end()
})

require('./router')(app) // see tests


http.createServer(app.router)
```