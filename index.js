require('dotenv').config();

const port = process.env.PORT;
const cors = require('cors');
const db = require('./scripts/db');
const bodyParser = require('body-parser');
const user = require('./scripts/user');
const chat = require('./scripts/chat');
const {server, io, app} = require('./scripts/io');

app.use(cors());
app.use(bodyParser.json())
app.use('/user', user)
app.use('/chat', chat)
app.get('/', (req, res) => {
  res.send('Hello, World!');
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});