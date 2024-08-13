const express = require("express");
const morgan = require("morgan");
const axios = require('axios')
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require('express-rate-limit')

const app = express();

const PORT = 3005;

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	})

app.use(morgan("combined"));
app.use(limiter);

app.use('/bookingservice',async(req,res,next)=>{
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated',{
            headers:{
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data)
        if(response.data.success){
            next();
        }else{
            return res.status(401).json({
                message: "Unauthorize"
            });  
        }
      
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorize"
        })
    }
})

app.use(
  '/bookingservice',
  createProxyMiddleware({
    target: 'http://localhost:3002/bookingservice',
    changeOrigin: true,
  })
);
app.use(
  '/authservice',
  createProxyMiddleware({
    target: 'http://localhost:3001/authservice',
    changeOrigin: true,
  })
);

app.get("/home", (req, res) => {
  return res.json({ message: "OK" });
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
