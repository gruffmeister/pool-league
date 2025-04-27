const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });


const express = require('express')
const createTeam = require('./create-team')
const createMatch = require('./create-match')
const updateMatch = require('./update-match')

const app = express()
app.use(express.json());
const port = 3001;

app.get('/', (req, res) => {
    return res.send('Index API Gateway');
})

app.get('/hello', (req, res) => {
    return res.send('HELLO WORLD!');
})

app.get('/get-team', (req, res) => {
    var team = {
        "names" : ["testName1", "testName2"]
    }
    return res.send(team)
})

app.post('/create-team', async (req, res) => {

    userId = req.header("userid")
    data = req.body;
    result = await createTeam(userId, data)

    return res.json(result)
})

app.post('/create-match', async (req, res) => {

    userId = req.header("userid")
    data = req.body;
    result = await createMatch(userId, data)

    return res.json(result)
})

app.post('/update-match', async (req, res) => {

    userId = req.header("userid")
    data = req.body;
    result = await updateMatch(userId, data)

    return res.json(result)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})