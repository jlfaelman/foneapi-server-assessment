const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const {server, io} = require('./io');

router.use(bodyParser.json())


// load rooms 
router.post('/rooms',async (req,res) => {
    try{
        const body = req.body;
        await pool.query('BEGIN');

        let  query = await pool.query(`SELECT * FROM room WHERE "from" = '${body.id}'`);
        if (query.rows.length === 0 ) query = await pool.query(`SELECT * FROM room WHERE "to" = '${body.id}'`);
        for (const q of query.rows){
            const from = await pool.query(`SELECT "first_name", "last_name" FROM users WHERE "id" = '${q.from}'`);
            const to = await pool.query(`SELECT "first_name", "last_name" FROM users WHERE "id" = '${q.to}'`);
            q.from_name = `${from.rows[0].first_name} ${from.rows[0].last_name}`;
            q.to_name = `${to.rows[0].first_name} ${to.rows[0].last_name}`;

        }
        await pool.query('COMMIT');

        res.status(200).send({msg:"ok",rooms:query.rows})
    }
    catch(e){
        await pool.query('ROLLBACK');
        console.log(e) 
        res.status(500).send({"msg":"Server error.",err:e})
    }
})
// add rooms 
router.post('/rooms/add', async  (req,res) => {

    try{
        const body = req.body;
        const contact = await pool.query(`SELECT id FROM users WHERE email='${body.to}'`)
        if(await pool.query(`SELECT id FROM room WHERE "from" ='${body.from}' AND "to" = '${contact.rows[0].id}'`) || await pool.query(`SELECT id FROM room WHERE from ='${contact.rows[0].id}' AND to = '${body.from}'`)){
            res.status(400).send({"msg":"Duplicate."});
        }

        console.log( [body.from, contact.rows[0].id, generateRoom()])
        pool.query(`INSERT INTO room ("from", "to", "room_id") VALUES ($1,$2,$3)`,[body.from, contact.rows[0].id, generateRoom()], (err,result) => {
            if(err){
                console.log(err)
                res.status(400).send({"msg":"Operation Failed."});
            }
            if(result){
                console.log(result)
                res.status(200).send({msg:"ok",rooms:result.rows});
            }
        })


    } catch(e){
        await pool.query('ROLLBACK');
        console.log(e)
        res.status(500).send({"msg":"Server error.",err:e});
    }
})

// load chats
router.post('/rooms/get', (req,res) => {
    try{
        const body = req.body;

        pool.query(`SELECT * FROM chat WHERE "room" = '${body.id}' `, (err,result) => {
            if(err){
                console.log(err)
                res.status(403).send({"msg":"Chats not found."});
            }
            if(result){
                res.status(200).send({msg:"ok",chats:result.rows});
            }
        })
    } catch(e){
        res.status(500).send({"msg":"Server error.",err:e});
    }
})

function generateRoom() {
    const timestamp = Date.now().toString(36); 
    const randomString = Math.random().toString(36).substr(2, 5); 
  
    return `room_${timestamp}${randomString}`;
}

module.exports = router;
