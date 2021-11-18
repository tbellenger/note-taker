const express = require('express');
const { v4 } = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;

const app = express();

let notes = [];

// set the server port and handle static, json and urlencoded
app.set('port', (process.env.PORT || 5000));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// /notes path return notes.html
app.get('/notes', (req, res) => {
  return res.sendFile('/public/notes.html', {root:__dirname});
});

// api call to return all notes in the file
app.get('/api/notes', async (req, res) => {
  notes = await readNotes();
  return res.json(notes)
});

// api call to add a note to the list
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

// api call to delete a note from the list
app.delete('/api/notes/:id', async (req, res) => {
  // data structure is array so need to search through 
  // all items to get the index. Map might be better
  let noteToRemoveIndex = notes.findIndex((note) => note.id == req.params.id);
  console.log('Request to remove ' + req.params.id);
  console.log(notes);
  console.log('Removing index ' + noteToRemoveIndex);
  notes.splice(noteToRemoveIndex, 1);
  console.log(notes);
  await writeNotes(notes);
  return res.send('Received DELETE request');
})

// start the server listening
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

// read notes from db.json
async function readNotes() {
  try {
    const data = await fsPromises.readFile('./db/db.json', {encoding:'utf-8'});
    return JSON.parse(data);
  } catch (err) {
    console.log(err);
    return '';
  }
}

// write notes to db.json
async function writeNotes(data) {
  try {
    await fsPromises.writeFile('./db/db.json', JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }
}
