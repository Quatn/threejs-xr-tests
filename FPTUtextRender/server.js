const http = require('http')
const fs = require('fs')
const express = require('express')
const app = express()
const path = require('path')
const https = require("https");
const port = 5000

dir = __dirname
console.log(dir)
app.use(express.static(dir ))
app.get('*', function(req, res) {
	console.log(req.url)
	//res.sendFile(path.join(dir + '/XR-Cubes.html'))
	//res.sendFile(dir)
} )
app.listen(port)

https.createServer(
	// Provide the private and public key to the server by reading each
	// file's content with the readFileSync() method.
	{
		key: fs.readFileSync("../encKeys/key.pem"),
		cert: fs.readFileSync("../encKeys/cert.pem"),
	},
	app
)
	.listen(4000, () => {
		console.log("server is runing at port 4000");
	});
