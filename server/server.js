const express = require('express')
const app = express()
const port = process.env.PORT || 8080

// library for signing and verifying JWT tokens
const jwt = require('jsonwebtoken')

const cors = require('cors')

require('dotenv').config()

app.use(express.json())
app.use(cors())

// middleware that deals with auth tokens that we can use for all the protected routes that require auth
const authorize = (req, res, next) => {
  // if no authorization header is provided, respond with error
  if (!req.headers.authorization) return res.status(401).json({ success: false, message: 'This route requires authorization header' });

  // if auth token is provided but missing "Bearer ", respond with error
  if (req.headers.authorization.indexOf('Bearer') === -1) return res.status(401).json({ success: false, message: 'This route requires Bearer token' });

  // because the authorization header comes in "Bearer encrypted-auth-token" format we are only interested in second portion of the token
  const authToken = req.headers.authorization.split(' ')[1];

  // to verify JWT token, we have three arguments: the token, the secret it was signed with and the callback after verifying. The callback comes with two parameters - the error and the decoded token (the payload)
  jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
    // if token has been tampered with or has expired we respond with an error
    if (err) return res.status(401).json({ success: false, message: 'The token is invalid' });

    // if token is verified we are setting it on the request object for an endpoint to use
    req.jwtDecoded = decoded;
    next();
  });
}

// our naive "DB" of the users
const users = [
  {
    id: 1,
    username: 'Nolan',
    password: 'agileprocess'
  },
  {
    id: 2,
    username: 'Mike',
    password: 'stringerbell'
  }
]

const posts = [
  {
    id: 1,
    user_id: 1,
    title: "The empire did nothing wrong",
    content: "Palpatine was just trying to bring order to the galaxy"
  },
  {
    id: 2,
    user_id: 1,
    title: "SkyDome > Rogers Centre",
    content: "It will always be the SkyDome to me"
  },
  {
    id: 3,
    user_id: 2,
    title: "Hamilton isn't so bad!",
    content: "Seriously!"
  },
  {
    id: 4,
    user_id: 2,
    title: "Blockchain",
    content: "That's it, that's the post"
  }
];

// login endpoint
app.post('/login', (req, res) => {
  // get username and password from the request body
  const { username, password } = req.body;

  // find a user in our naive "DB"
  const user = users.find(user => user.username === username);

  // if user is not found, respond with an error
  if (!user) return res.status(403).json({ success: false, message: 'User is not found' });

  // compare the passwords that we have in our "DB" and that the user logged in with
  if (user && user.password === password) {
    // use jwt.sign to create a new JWT token. Takes two arguments, the payload and the secret key. We keep out secret key in ".env" file for safety
    const token = jwt.sign(
      {
        id: user.id,
        // alternative way to set expiration token after 5 minutes
        // exp: Math.floor(Date.now() / 1000) + 300,
        loginTime: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // respond back to a client with the token we just created
    return res.status(200).json({ token });
  } else {
    // if username/password doesn't match we respond with error
    return res.status(403).json({ success: false, message: 'Username/password combination is wrong' })
  }
});

// a protected route, note we are using a second parameter "authorize" which is our middleware for authentication
app.get('/posts', authorize, (req, res) => {
  
  const userId = req.jwtDecoded.id;

  const filteredPosts = posts.filter(post => post.user_id === userId);

  res.json(filteredPosts);
});

app.listen(port, () => {
  console.log(`Listening on ${port}`)
})