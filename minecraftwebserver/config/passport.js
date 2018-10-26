// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User       = require('../app/models/user');


module.exports = function(passport, nev) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },

    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

	var regExp = /[0-9a-zA-Z][_0-9a-zA-Z-]*@[_0-9a-zA-Z-]+(\.[_0-9a-zA-Z-]+){1,2}$/;
	if(email.length == 0 || req.body.username.length == 0) {
	  return done(null, false, req.flash('signupMessage', '가입양식을 다 기입하지 않았습니다.')); 
	}
	if(!email.match(regExp)){
	  return done(null, false, req.flash('signupMessage', '이메일 형식이 맞지 않습니다.'));
	}

        // asynchronous
        process.nextTick(function() {

            // if the user is not already logged in:
            if (!req.user) {

                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.local.email    = email;
			newUser.local.username = req.body.username;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });

            // if the user is logged in but has no local account...
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    })

/*
    function(req, email, password, done){
	if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

	// asynchronous
        process.nextTick(function() {
          // create the user
          var newUser            = new User();
          newUser.local.email    = email;
          newUser.local.username = req.body.username;
          newUser.local.password = newUser.generateHash(password);

           nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser){
             if(err) console.error(err);
             if(existingPersistentUser){
		console.log('You have already signed up and confirmed your account. Did you forget your password?');
                return done(null);
             }
             if(newTempUser){
                var URL = newTempUser[nev.options.URLFieldName];
                nev.sendVerificationEmail(email, URL, function(err, info){
                    if(err) console.error(err);
		    console.log('An email has been sent to you. Please check it to verify your account.');
                    return done(null, newTempUser);
                })
             } else {
		console.log('You have already signed up. Please check your email to verify your account.');
                return done(null);
             }
          });
	
	});


    })
*/

  );

};
