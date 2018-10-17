var fs = require('fs');
var path = require('path');
var Recaptcha = require('express-recaptcha').Recaptcha;

var recaptcha = new Recaptcha('6Lf56nQUAAAAAKfIT8SH6lWpELPMqUvzGguacfWm', '6Lf56nQUAAAAAKkXBUm9Mz22aLa-JjNh0bt-2XsA');

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/workspace', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', recaptcha.middleware.render, function(req, res) {
            res.render('signup.ejs', { 
		message: req.flash('signupMessage'),
		captcha : req.recaptcha
	    });
        });

        // process the signup form
        app.post('/signup', recaptcha.middleware.verify, captchaVerification, passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
	    failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


// ADD NEW =============================

    app.get('/email-verification/:URL', function(req, res){
        var url = req.params.URL;
        nev.confirmTempUser(url, function(err, user){
          console.log("confirmed user " + user);
          if(err) console.log(err);
          if (user) {
            nev.sendConfirmationEmail(user.email, function(err, info) {
                if (err) {
                    return res.status(404).send('ERROR: sending confirmation email FAILED');
                }
                res.send({
                    msg: 'CONFIRMED!',
                    info: info
                });
            });
          } else {
            return res.status(404).send('ERROR: confirming temp user FAILED');
          }
        });
    });


app.get('/workspace', isLoggedIn, function(req, res) {
        res.render('workspace.ejs', {
            user : req.user
        });
    });


app.post('/jscode', function(req, res, next) {
    let body = '';
    req.on('data', data => {
	minecraftid = req.user.local.username;
        body += data.toString();
        fs.writeFile(path.join(__dirname + "/../../scriptcraft/plugins/users/" + minecraftid +"_client.js"), body, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }).on('end', () => {
        res.end('ok');
    });
});




}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}

//google recaptcha statement
function captchaVerification(req, res, next) {
    if (req.recaptcha.error) {
        req.flash('signupMessage','reCAPTCHA가 올바르지 않습니다.');
        res.redirect('/signup');
    } else {
        return next();
    }
}
