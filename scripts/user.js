const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const pool = require('./db');
const jwt = require('jsonwebtoken');


const secretKey = 'chat-app'; 

router.use(bodyParser.json())



router.post('/auth', (req,res) => {
    const credentials = req.body;
    try{
        pool.query(`SELECT * FROM users WHERE email = '${credentials.email}';`, (err,result) => {
            if(err){
                res.status(403).send({"msg":"Account not found."}) 
            }
            if(result){
               

                delete result.rows[0].password
                const token = jwt.sign(result.rows[0], secretKey, { expiresIn: '12h' });
                res.status(200).send({msg:"ok",token:token})
            }
        })
    }
    catch(e){
        res.status(500).send({"msg":"Server error."})
    }
});

router.post('/register', (req,res) => {
    const user = req.body;
    try{
        pool.query('INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2,$3,$4)', [user.email, user.password, user.firstname,user.lastname], (err, result) => {
            if (err) {
              console.error('Error executing query', err);
              res.status(500).send({"msg":"Server error."})
            } else {
              console.log('Data inserted successfully');
              res.status(200).send({msg:"ok"})
            }
        })
        res.status(200).send({"msg":"ok"})
    }
    catch(e){
        res.status(500).send({"msg":"Server error."})
    }
});


module.exports = router;
