const express = require('express');
const nodemailer = require('nodemailer');
const boolean = require('boolean');
const http = require('http');



const E = process.env;
const PORT = parseInt(E['PORT']||'8000', 10);
const TRANSPORTHOST = E['TRANSPORTHOST']||'smtp.gmail.com';
const TRANSPORTPORT = parseInt(E['TRANSPORTPORT']||'587', 10);
const TRANSPORTSECURE = boolean(E['TRANSPORTSECURE']||'false');
const TRANSPORTUSER = E['TRANSPORTUSER']||'';
const TRANSPORTPASS = E['TRANSPORTPASS']||'';
const MAILFROM = E['MAILFROM']||'';
const MAILTO = E['MAILTO']||'';
const MAILSUBJECT = E['MAILSUBJECT']||'';
const MAILTEXT = E['MAILTEXT']||'';
const MAILHTML = E['MAILHTML']||'';
const SOURCE = E['SOURCE']||'';
const DATARATE = parseInt(E['DATARATE']||'1000', 10);
const DISTANCEMIN = parseInt(E['DISTANCEMIN']||'200', 10);
const app = express();
const server = http.createServer(app);



function emailSend(mail, transport) {
  var transporter = nodemailer.createTransport(Object.assign({
    host: TRANSPORTHOST, port: TRANSPORTPORT, secure: TRANSPORTSECURE,
    auth: {user: TRANSPORTUSER, pass: TRANSPORTPASS},
  }, transport));
  mail = Object.assign({
    from: MAILFROM,
    to: MAILTO,
    subject: MAILSUBJECT,
    text: MAILTEXT,
    html: MAILHTML,
  });
  console.log('emailSend()', mail);
  return transporter.sendMail(mail);
}

function onData(data) {
  var {distance, mail, transport} = data;
  if(distance>=DISTANCEMIN) return;
  mail = Object.assign({content: JSON.stringify(res.body, null, 2)}, mail);
  return emailSend(mail, transport);
}

async function onInterval() {
  if(!SOURCE) return;
  var res = await needle('get', SOURCE);
  console.log('SOURCE', SOURCE, res.body);
  return onData(res.body);
}
setInterval(onInterval, DATARATE);



app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  Object.assign(req.body, req.params);
  var {ip, method, url, body} = req;
  if(method!=='GET') console.log(ip, method, url, body);
  next();
});

app.post('/status', (req, res) => {
  onData(req.body);
});
app.post('/email', (req, res, next) => {
  var {mail, transport} = req.body;
  emailSend(mail, transport).then((ans) => res.json(ans), next);
});

app.use((err, req, res, next) => {
  console.log(err, err.stack);
  res.status(err.statusCode||500).send(err.json||err);
});
server.listen(PORT, () => {
  console.log('EMERGENCYNOTIFICATIONSERVICE running on '+PORT);
});
