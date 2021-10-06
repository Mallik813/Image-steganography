const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
var fs = require('fs');
var path = require('path');
const steg = require('../public/steganography.min');

// var multer = require('multer');
// var upload = multer({ dest: 'uploads/' });

var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'routes/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

const { jwtSecret } = require('../config');

const User = require('../models/user');
const Post = require('../models/posts');
const DB = require('../keys');

router.get('/', (req, res) => {
  if (!req.session.user) {
    res.statusCode = 200
    res.render("register")
  } else {
    res.status = 401
    res.redirect("/dashboard?logout+first")
  }
});
router.get('/home', async (req, res) => {
  if (req.session.user) {
    const posts = await Post.find({}).sort({_id:-1});
    // console.log(posts, "posts");

    res.statusCode = 200
    res.render("home", {posts: posts, user: req.session.user})
  } else {
    res.status = 401
    res.redirect("/register?login+first")
  }
});
router.get('/register', (req, res) => {
  if (!req.session.user) {
    res.statusCode = 200
    res.render("register")
  } else {
    res.status = 401
    res.redirect("/dashboard?logout+first")
  }
});
router.get('/dashboard', (req, res) => {
  if (req.session.user){
    res.render('dashboard', {
      user: req.session.user,
    })}
  else
    res.redirect('/login?login+to+view');
});


router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;

  // console.log(req.body);
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    const user = await User.findOne({ email });
    
    if (user) {
      errors.push({ msg: 'Email already exists' });
      res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
    } else {
        const hash = await bcrypt.hash(password, 10);

        const newUser = new User({name, email, password: hash});
        newUser.save((err, data) => {
          if (err) console.log(err);
          // else console.log(data);
          // res.render("login", {msg: "Registered successfully"})
          else res.redirect('/login');
        })
    }
  }
});
router.get('/login', (req, res) => {
  if (!req.session.user) {
    res.statusCode = 200
    res.render("login")
  } else {
    res.status = 401
    res.redirect("/dashboard?logout+first")
  }
});
router.get('/getPost/:id/:email', async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  const user = await User.findOne({ email: req.params.email });
  if (post) {
    res.render("post", { post, user });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const result = bcrypt.compareSync(password, user.password)
    if (result) {
      req.session.user = user
      res.redirect('/home?login+success');
    } else {
      res.render('login', { error: "Incorrect password", email });
    }
  } else {
    res.render('login', { error: "email doesnot exist" });
  }
});


router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy(() => {
      res.status = 200;
      res.redirect('/login?logout+success');
    })
  } else {
    res.status(400).send("you are not logged in")
  }
})


router.post('/post', upload.single('image'), async (req, res) => {
  const { text, code } = req.body;
  // console.log(req.body)
  const email =  (req.body.email === req.session.user.email) ? '' : req.body.email;
  const newPost = new Post({
    text,
    email,
    username: req.session.user.name,
    by: req.session.user._id,
    img: {
      data:code,
      // data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
  });
  // console.log(typeof(fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))))
  newPost.save((err, data) => {
    // console.log(data);
    if (err) console.log(err);
    // else console.log(data);
    // res.render("login", {msg: "Registered successfully"})
  })
  const user = await User.findOne({ email: req.session.user.email });
  const orgUser = await User.findOne({ email });
  if (orgUser) {
    orgUser.notifications.push({ id: req.session.user._id, name:req.session.user.name, email: req.session.user.email, postID: newPost._id });
    orgUser.save();
  }
        newPost.save((err, data) => {
          if (err) console.log(err);
          // else console.log(data);
          // res.render("login", {msg: "Registered successfully"})
        })
  // console.log(newPost._id);
  user.posts.push({post: newPost._id});  
  user.save();
  // orgUser.notifications.push({ post: newPost._id });  
  // orgUser.save();
  res.redirect('/home?post+created');

});
// router.get('/verify', (req, res) => res.render('verify'));
// router.post('/encrypt', upload.single('avatar'), (req, res) => {
//   const { name, details } = req.body;
//   // const img = req.file;
//   // console.log(name);
//   if (name) {
//     const token = jwt.sign(name, jwtSecret.privKey, {
//       algorithm: 'ES512',
//       // expiresIn: '30d',
//     });

//     // upload.single('uploaded_file');

//     res.render('welcome', { token });
//   }
//   else res.render('welcome', { token: "please fill the form" });
//   // console.log(token);
// });

// router.post('/decrypt', (req, res) => {
//   const { token } = req.body;
//   // console.log(name);
//   if (token) {
//     const name = jwt.verify(token, jwtSecret.pubKey);
//     res.render('verify', { name });
//   }
//   else res.render('welcome', { token: "please fill the form" });
//   // console.log(token);
// });

module.exports = router;

