require('dotenv').config()

const express = require('express'), app = express(), PORT = process.env.PORT
const jwt = require('jsonwebtoken')

const posts = require('./Data/Posts')

app.listen(PORT, error => {
  error
    ? console.log(`Server: ${error.message}`)
    : console.log(`Server: Started successfully,
            Listening on 127.0.0.1:${PORT}`)
})

app.use(express.json())

let refreshTokens = []

app.post('/token', (req,res) => {
  const refreshToken = req.body.token
  if (refreshToken === null) res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, username) => {
    if (err) return sendStatus(403)
    const accesToken = generateAccessToken(username)
    res.json({accesToken: accesToken})
  })

})
app.post('/login', (req,res) => {

  const {username} = req.body
  accesToken = generateAccessToken(username)
  const refreshToken = jwt.sign(username,process.env.REFRESH_TOKEN_SECRET )
  refreshTokens.push(refreshToken)
  res.send({accesToken: accesToken, refreshToken: refreshToken})

})
app.delete('/logout', (req,res) => {
  refreshTokens = refreshTokens.filter( token => token !== req.body.token)
  res.sendStatus(204)
})



app.get('/posts', authenticateToken, (req,res) => {
  res.json(posts.filter( post => post.username === req.username))

})

function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token === null) res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, username) => {
    if (err) return res.sendStatus(403)
    req.username = username.username
    next()
  })
}

function generateAccessToken (username){ 
  const token = jwt.sign({username: username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 15 });
  return token
}


app.get('*', (req, res) => {
res.send(`              `)
})

