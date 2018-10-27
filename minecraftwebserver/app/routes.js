var fs = require('fs');
var path = require('path');
var Recaptcha = require('express-recaptcha').Recaptcha;
// load up the user model
var User       = require('./models/user');
var async = require('async');
var crypto = require('crypto');
var ExpressBrute = require('express-brute');
 
var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store);

const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');

require('dotenv').config();

var recaptcha = new Recaptcha('6Lf56nQUAAAAAKfIT8SH6lWpELPMqUvzGguacfWm', process.env.RECAPTCHA_SECRET);

const config = {
  mailer: {
    service: 'Gmail',
    host: 'localhost',
    port: '465',
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASS,
  },
};



module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs', {
	  user : req.user
	});
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

    // EDIT =================================
    app.get('/edit', isLoggedIn, function(req, res) {

	res.render('edit.ejs', {
	    user : req.user
	});
    });

    app.post('/edit', function(req, res, next) {

	async.waterfall([
          function(done) {
            User.findOne({ 'local.username' : req.user.local.username }, function(err, user) {
            if (!user) {
              req.flash('error', 'edit username error.');
              console.log('error edit username');
              return res.redirect('back');
            }

            user.local.username = req.body.username;

            user.save(function(err) {
              req.logIn(user, function(err) {
                req.flash('success', 'Success! Your Minecraft Username has been changed.');
                done(err, user);
              });
            });
          });
        }
      ], function(err) {
          res.redirect('/profile');
      });

    });

    // FORGOT ========================================
    app.get('/forgot', function(req, res) {

	res.render('forgot.ejs', {
	    user : req.user,
	    message: req.flash('emailMessage')
	});

    });

    app.post('/forgot', function(req, res, next) {


	async.waterfall([

    	  function(done) {
      	    crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },

        function(token, done) {
          User.findOne({ 'local.email': req.body.email }, function(err, user) {
            if (!user) {
              req.flash('emailMessage', '해당 이메일 주소가있는 계정이 없습니다.');
	      console.log('mail not defined');
              return res.redirect('/forgot');
            }

            user.local.resetPasswordToken = token;
            user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function(err) {
              done(err, token, user);
            });
          });
        },
        function(token, user, done) {
	try{
	  const transporter = nodemailer.createTransport(smtpPool({
          service: config.mailer.service,
  	  host: config.mailer.host,
  	  port: config.mailer.port,
  	  auth: {
    	    user: config.mailer.user,
    	    pass: config.mailer.password,
  	  },
  	  tls: {
    	    rejectUnauthorize: false,
 	  },
  	 maxConnections: 5,
  	 maxMessages: 10,
        }));
	const mailOptions = {
  	  from : 'CoalaSW < coalasoftware@gmail.com >',
 	  to : user.local.email,
  	  subject : 'Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'

	};
	// 메일을 전송하는 부분
	transporter.sendMail(mailOptions, (err, res) => {
	  console.log('email sent');
	  req.flash('emailMessage', '전자 메일이 ' + user.local.email + ' 로 전송되었습니다.');
        done(err, 'done');

	  transporter.close();
	});
} catch(e) { return done(null, false, req.flash('d', 'fdf')); };
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });

    });


    // RESET ===================================================
    app.get('/reset/:token', function(req, res) {

	User.findOne({ 'local.resetPasswordToken' : req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
    	  if (!user) {
      	    req.flash('error', '비밀번호 재설정 토큰이 잘못되었거나 만료되었습니다.');
	    console.log('error token');
      	    return res.redirect('/forgot');
    	  }
    	  res.render('reset', {
      	    user: req.user,
	    token: req.params.token
    	  });
  	});

    });

    app.post('/reset/:token', function(req, res) {

	async.waterfall([
    	  function(done) {
      	    User.findOne({ 'local.resetPasswordToken' : req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
	      console.log('error reset');
              return res.redirect('back');
            } 
	    if (req.body.password != req.body.confirmed) {
	      console.log('new password and confirm password does not match');
	      return res.redirect('back');
	    }

            user.local.password = user.generateHash(req.body.password);
            user.local.resetPasswordToken = undefined;
            user.local.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
		req.flash('success', 'Success! Your password has been changed.');
                done(err, user);
              });
            });
          });
        }
      ], function(err) {
 	  res.redirect('/');
      });

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
        app.post('/login', bruteforce.prevent, passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
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


// WORKSPACE =========================================

    app.get('/workspace', isLoggedIn, function(req, res) {
        res.render('workspace.ejs', {
            user : req.user
        });
    });


// CONTENTS ===============================================

    app.get('/contents/:id', isLoggedIn, function(req, res) {

	var title = "";
	switch (req.params.id) {
	  case '0':
	    title = "예\xa0제";
	    break;
	  case '1':
	    title = "텔\xa0레\xa0포\xa0트 이\xa0용\xa0하\xa0기";
	    break;
	  case '2':
	    title = "보\xa0물\xa0찾\xa0기";
            break; 
	  case '3':
	    title = "울\xa0타\xa0리 만\xa0들\xa0기";
            break; 
	  case '4':
	    title = "대\xa0규\xa0모\xa0밀\xa0밭 만\xa0들\xa0기";
            break; 
	  case '5':
	    title = "사\xa0냥\xa0하\xa0고 돌\xa0아\xa0오\xa0기";
            break; 
	  case '6':
	    title = "주\xa0크\xa0박\xa0스 만\xa0들\xa0기";
            break; 
	  case '7':
	    title = "롤\xa0러\xa0코\xa0스\xa0터 만\xa0들\xa0기";
            break; 
	  case '8':
	    title = "요\xa0새 만\xa0들\xa0기";
            break; 
	}
        res.render('contents/'+ req.params.id +'.ejs', {
            user : req.user, title : title
        });
    });



// SAVE FILE ===============================================

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
  try {
    if (req.recaptcha.error) {
        req.flash('signupMessage','reCAPTCHA가 올바르지 않습니다.');
        res.redirect('/signup');
    } else {
        return next();
    }
  } catch(e) { console.log(e) };
}
