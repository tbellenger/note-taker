const express = require('express');
const { v4 } = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;

const app = express();

let notes = [];

app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/notes', (req, res) => {
  return res.sendFile('/public/notes.html', {root:__dirname});
});

app.get('/api/notes', async (req, res) => {
  notes = JSON.parse(await readNotes());
  return res.send(Object.values(notes));
});

app.post('/api/notes', async (req, res) => {
  const uuid = v4();
  const note = {
    id: uuid,
    title: req.body.title,
    text: req.body.text
  }
  notes.push(note);
  await writeNotes(notes);
  return res.send(note);
})

app.delete('/api/notes/:id', async (req, res) => {
  let noteToRemoveIndex = notes.findIndex((note, index) => {
    if (note.id == req.params.id) {
      return index;
    }
  });
  notes.splice(noteToRemoveIndex, 1);
  console.log(notes);
  await writeNotes(notes);
  return res.send('Received DELETE request');
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

async function readNotes() {
  try {
    const data = await fsPromises.readFile('./db/db.json', {encoding:'utf-8'});
    return data;
  } catch (err) {
    console.log(err);
    return '';
  }
}

async function writeNotes(data) {
  try {
    await fsPromises.writeFile('./db/db.json', JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }
}
