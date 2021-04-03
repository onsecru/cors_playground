let express = require('express');
let fs = require('fs');
let path = require('path')
let https = require('https');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let app = express();

const default_app_origin = 'https://playground.cors.test:5555';
const default_domain = 'playground.cors.test';
const allowedOrigins = ['https://cors.test','https://pts.playground.cors.test'];

/*Function to determine the allowed origin headers */
let check_allowed_origins = (origin_req_header) => {
  for (let i=0; i < allowedOrigins.length; i++) {
    if (origin_req_header === allowedOrigins[i]) {
     return true;
    }
  }
  return false;
}
/*Function to check for subdomains of default domain - The regex is vulnerable*/ 
let check_subdomains = (origin_req_header) => {
  if (origin_req_header.search(/\.playground.cors.test/) != -1) {
    return true;
  } else {
    return false;
  }
}

/*Function to determine whether a CORS preflight request has been sent*/
let preflightRequest = (req) => {
    const httpMethod = req.method === 'OPTIONS';
    return httpMethod && (req.headers['origin'] != undefined) && (req.headers['access-control-request-method'] != undefined);
};

/*Function to handle CORS requests*/
let corsHandler = (req, res, next) => {
    const origin_req_header = req.header('Origin');
    if (origin_req_header != undefined ) {
      /*  Uncomment the case you'd like to work on and comment the remaining ones. */
      
      //Case 1.- Check the allowed list of origins
      /*if (check_allowed_origins(origin_req_header)) {
        res.set('Access-Control-Allow-Origin', origin_req_header);
      }
      else {
        res.set('Access-Control-Allow-Origin', default_app_origin);
      }*/
      
      //Case 2.- Check to allow subdomains
      /*if (check_subdomains(origin_req_header)) {
        res.set('Access-Control-Allow-Origin', origin_req_header);
      }
      else {
        res.set('Access-Control-Allow-Origin', default_app_origin);
      }*/
       
      //Case 3.- Allow only a specific host
      //res.set('Access-Control-Allow-Origin', default_app_origin);
      
      
      // Case 4.- Allow any host (with *) - not valid in combination with credentials = true
      //res.set('Access-Control-Allow-Origin', '*'); 
      
       
      //Case 5.- Reflects the Origin HTTP request header sent by the client application
      res.set('Access-Control-Allow-Origin', origin_req_header);
      
      // Indicates the browser to send cookies - not valid combination with Access-Control-Allow-Origin: *
      res.set('Access-Control-Allow-Credentials', 'true');
        
      if (preflightRequest(req)) {
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers','CORS-playground');
        res.set('Access-Control-Max-Age', '120');
        res.status(204).end();
        return;
      }
    }
    next();
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(corsHandler);

/*Port number of the HTTP server*/
const server_port = 5555;
/*Account data information - this data is the target or your attack when exploiting CORS*/
const accounts = {
    '1': {'username': 'mduarte', 'Full Name': 'Marta Carolina Duarte Diaz', 'Roles': 'Administrator', 'API-key' : '916f4c31aaa35d6b867dae9a7f54270d'},
    '2': {'username': 'jsmith', 'Full Name': 'Joseph Smith', 'Roles': 'User', 'API-key' : '71694f4302eacf0b9faeef686bc1da31'},
    '3': {'username': 'ppicapiedra', 'Full Name': 'Pedro Picapiedra', 'Roles': 'Operator', 'API-key' : 'e75c2b1971d188a45fe4213d9e48a52a'}
};
const old_accounts = {
  '1': {'username': 'cperez', 'Full Name': 'Carlos Eduardo Perez Mata', 'Roles': 'Administrator', 'API-key' : '916f4c31aaa35d6b867dae9a7f54270d'},
  '2': {'username': 'rmars', '': 'Richard Mars', 'Roles': 'User', 'API-key' : '71694f4302eacf0b9faeef686bc1da31'},
  '3': {'username': 'ppicapiedra', 'Full Name': 'Pedro Picapiedra', 'Roles': 'Operator', 'API-key' : 'e75c2b1971d188a45fe4213d9e48a52a'}
};
/*files to run this app with TLS */
const key = fs.readFileSync(__dirname + '/cert/private.key');
const cert = fs.readFileSync(__dirname + '/cert/certificate.crt');
/*options contains data passed to the http server to load with TLS */
const options = {
    key: key,
    cert: cert
}

/*App initial cookie */
let app_cookie = {'cookie': '5409f19dc52ef413704d0905b6730029'};

app.get('/', function(req, res) {
  if (req.cookies['session'] === app_cookie['cookie']) {
    res.status(200).sendFile('main_page.html', {root: path.join(__dirname, './')});
  } else {
    resp = res.status(200).sendFile('login.html', {root: path.join(__dirname, './')});
  }
});

app.post("/login.html", function(req, res) {
    if (req.body.username === 'mduarte' && req.body.password === 'Pa55w0rd1' ) {
        const randomvalue = Math.floor(Math.random() * 100000000);
        app_cookie['cookie'] = randomvalue.toString();
        /*
        Play it with the attributes of the cookie and under what conditions the cookie is sent by the browser to web server.
        Combine those attribute values with different CORS settings and origins.
        Example:
        res.cookie('session',randomvalue.toString(), {domain: '.playground.cors.test', httpOnly: true, secure: true, sameSite: 'Lax'});
        */
        res.cookie('session',randomvalue.toString(), { httpOnly: true, secure: true, sameSite: 'None'});
        res.status(302).redirect("/main_page.html");
    }
    else {
        res.status(302).redirect("/");
    }
});
app.get('/main_page.html', function(req, res) {
  if (req.cookies['session'] === app_cookie['cookie']) {
    res.status(200).sendFile('main_page.html', {root: path.join(__dirname, './')});
  }
  else {
      res.status(302).redirect("/");
  }
});

/*You can exploit this endpoint with CORS settings 
Access-Control-Allow-Credentials: true and Access-Control-Allow-Credentials: <reflected>*/

app.get('/api/v2/accounts', function(req, res) {
    if (req.cookies['session'] === app_cookie['cookie']) {
        res.json(accounts);
    }
    else {
        res.status(302).redirect("/");
    }
});

/*Old endpoint version that the developer forgot to remove and secure.
You can use this endpoint to practise with CORS settings 
Access-Control-Allow-Origin: */
app.get('/api/v1/accounts', function(req, res) {
      res.json(old_accounts);
});

app.get('/logout', (req, res) => {
    res.clearCookie('session');
    app_cookie['cookie'] = '5409f19dc52ef413704d0905b6730029'
    res.status(302).redirect("/");
});

https.createServer(options, app).listen(server_port, function(){
    console.log('Started server at https://playground.cors.test:' + server_port);  
});