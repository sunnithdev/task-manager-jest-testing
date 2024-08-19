const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3005;

// File path for storing task data
const records = 'json/data.json';

// Use bodyParser middleware for parsing JSON data in requests
app.use(bodyParser.json());

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from respective directories
app.use('/lib', express.static(path.join(__dirname, 'lib')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// Create a route for tasks
app.route('/tasks')
  // Retrieve all tasks
  .get((req, res) => {
    try {
      const data = readDataFromFile();
      res.json(data);
    } catch (error) {
      console.error('Error reading tasks:', error);
      res.status(500).send('Error reading tasks.');
    }
  })
  // Add a new task
  .post((req, res) => {
    try {
      const data = readDataFromFile();
      const { name, description, assignee, dueDate, status } = req.body;

      // Create a new task as a object
      const newTask = {
        taskName: name,
        description: description,
        assignee: assignee,
        dueDate: dueDate,
        status: status
      };

      // Add the new task to the data and save to file
      data.push(newTask);
      saveDataToFile(data);
      res.send('Task added successfully.');
    } catch (error) {
      res.status(500).send('Error adding task.');
    }
  });

// Route for a single task
app.route('/tasks/:id')
  // Retrieve a specific task by ID
  .get((req, res) => {
    try {
      const id = req.params.id;
      const data = readDataFromFile();

      if (id >= 0 && id < data.length) {
        res.json(data[id]);
      } else {
        res.status(404).send('Task not found.');
      }
    } catch (error) {
      res.status(500).send('Error retrieving task.');
    }
  })
  // Update a specific task by ID
  .put((req, res) => {
    try {
      const id = req.params.id;
      const data = readDataFromFile();

      if (id >= 0 && id < data.length) {
        const { name, description, assignee, dueDate, status } = req.body;
        const updatedTask = {
          taskName: name,
          description: description,
          assignee: assignee,
          dueDate: dueDate,
          status: status
        };

        data[id] = updatedTask;
        saveDataToFile(data);
        res.send('Task updated successfully.');
      } else {
        res.status(404).send('Task not found.');
      }
    } catch (error) {
      res.status(500).send('Error updating task.');
    }
  })
  // Delete a specific task by ID
  .delete((req, res) => {
    try {
      const id = req.params.id;
      const data = readDataFromFile();

      if (id >= 0 && id < data.length) {
        data.splice(id, 1);
        saveDataToFile(data);
        res.send('Task deleted successfully.');
      } else {
        res.status(404).send('Task not found.');
      }
    } catch (error) {
      res.status(500).send('Error deleting task.');
    }
  });

//  Read data from file
const readDataFromFile = () => {
  try {
    const data = fs.readFileSync(records, 'utf8');
    const parsedData = JSON.parse(data);

    // Ensure data is stored as an array
    if (!Array.isArray(parsedData)) {
      console.error('Data in file is not an array:', parsedData);
      return [];
    }

    return parsedData;
  } catch (error) {
    console.error('Error reading data from file:', error);
    return [];
  }
};

// Save data to file
const saveDataToFile = (data) => {
  try {
    fs.writeFileSync(records, JSON.stringify(data, null, 2), 'utf8');
    console.log('Data saved to file successfully.');
  } catch (error) {
    console.error('Error saving data to file:', error);
    throw error;
  }
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});