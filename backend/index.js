require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors');
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL)
const messages = require('./messages.js');
connection.query('CREATE TABLE entry (id INT AUTO_INCREMENT PRIMARY KEY,word NVARCHAR(255),definition NVARCHAR(5000),word_language NVARCHAR(255), definition_language NVARCHAR(255))', (err, rows) => {
    console.log('Connected to PlanetScale!')
});


app.use(cors({
    origin: '*',
    allowedHeaders: '*', // 'Content-Type,Authorization',
}));

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/languages', (req, res) => {
    connection.query('select * from language;', (err, rows) => {
        if (err) {
            res.status(500).send({ error: messages.LANGUAGE_ERROR })
        } else {
            res.status(200).json({ languages: rows })
        }
    })
})

app.post('/definitions', (req, res) => {
    const body = req.body; // Use 'const' to declare 'body'

    connection.query('SELECT * FROM entry WHERE word = ?;', [body.word], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: messages.SERVER_ERROR });
        }

        if (rows.length > 0) { // Check the length of the 'rows' array
            connection.query('SELECT count(*) as total FROM entry;', (err, rows) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ error: messages.SERVER_ERROR });
                } else {
                    return res.status(409).json({ msg: messages.EXISTS, total: rows[0].total });
                }
            });
        } else {
            connection.query('INSERT INTO entry (word, definition, word_language, definition_language) VALUES (?, ?, ?, ?);', [body.word, body.definition, body.word_language, body.definition_language], (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ error: messages.SERVER_ERROR });
                }

                connection.query('SELECT count(*) as total FROM entry;', (err, rows) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ error: messages.SERVER_ERROR });
                    } else {
                        return res.status(201).json({ msg: messages.CREATED, entry: body, total: rows[0].total });
                    }
                });
            });
        }
    });
});

app.patch("/update", (req, res) => {
    const body = req.body;

    connection.query("UPDATE entry SET definition = ?, definition_language = ? WHERE word = ?;", [body.definition, body.definition_language, body.word], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: messages.SERVER_ERROR });
        }

        connection.query("SELECT count(*) as total FROM entry;", (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ error: messages.SERVER_ERROR });
            } else {
                return res.status(200).json({ msg: messages.UPDATED, entry: body, total: rows[0].total });
            }
        });
    });
});

app.delete("/delete", (req, res) => {
    connection.query("SELECT * FROM entry WHERE word = ?;", [req.query.word], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: messages.SERVER_ERROR });
        }

        if (rows.length === 0) {
            return handleWordNotFound(req, res);
        }

        deleteEntry(req.query.word, res);
    });

    function handleWordNotFound(req, res) {
        connection.query('SELECT count(*) as total FROM entry;', (err, rows) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ error: messages.SERVER_ERROR });
            }
            res.status(404).json({ msg: messages.NOT_EXISTS, total: rows[0].total });
        });
    }

    function deleteEntry(word, res) {
        connection.query("DELETE FROM entry WHERE word = ?;", [word], (err) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ error: messages.SERVER_ERROR });
            }

            connection.query("SELECT count(*) as total FROM entry;", (err, rows) => {
                if (err) {
                    return res.status(500).send({ error: messages.SERVER_ERROR });
                }
                res.status(200).json({ msg: messages.DELETED, total: rows[0].total });
            });
        });
    }
});


app.get("/definitions", (req, res) => {
    
    connection.query("SELECT * FROM entry WHERE word = ?;", [req.query.word], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ error: messages.SERVER_ERROR });
        }

        if (rows.length === 0) {
            return res.status(404).json({ msg: messages.NOT_EXISTS });
        }else{
            return res.status(200).json({ msg: rows[0].definition });
        }
    });
})

app.listen(3000, () => console.log('Server is running on port 3000!'))