const express = require('express');
const nodemailer = require('nodemailer');
const boolean = require('boolean');
const http = require('http');



const E = process.env;
const PORT = parseInt(E['PORT']||'8000', 10);
const MAILHOST = E['MAILHOST']||'smtp.gmail.com';
const MAILPORT = parseInt(E['MAILPORT']||'587', 10);
const MAILSECURE = boolean(E['MAILSECURE']||'false');
const MAILUSER = E['MAILUSER']||'';
const MAILPASS = E['MAILPASS']||'';
const app = express();
const server = http.createServer(app);



function emailSend(mail, transport) {
  var transporter = nodemailer.createTransport(Object.assign({
    host: MAILHOST, port: MAILPORT, secure: MAILSECURE,
    auth: {user: MAILUSER, pass: MAILPASS}
  }, transport));
  return transporter.sendMail(mail);
}



app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  Object.assign(req.body, req.params);
  var {ip, method, url, body} = req;
  if(method!=='GET') console.log(ip, method, url, body);
  next();
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
