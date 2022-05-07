const express = require('express');
const app = express();
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const config = require('./config');
const userRouter = require('./router/user');
const userinfoRouter = require('./router/userinfo');
const port = 3000;


app.use(express.static('avatar'));
app.use(cors());
app.use(express.urlencoded({ extended: false }));//配置解析表单数据的中间件
app.use(express.json());

app.use((req, res, next) => {
    res.cc = function (err, status = 0) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
        })
    }
    next();
})

//解析token的中间件
app.use(jwt({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/api/] }));


app.use('/api', userRouter);
app.use('/my', userinfoRouter);


app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
})