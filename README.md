# newsreader
Node.js RSS/Atom News Aggregator

![alt screenshot](http://cloud.chemel.fr/public/screenshot-newsreader.png
)

## Install

```bash

# Clone repository
git clone https://github.com/chemel/newsreader.git

cd newsreader

# Install dependencies
npm install

# Edit config.json and setup your database
nano config/config.json

# Init database tables
NODE_ENV=production node_modules/.bin/sequelize db:migrate

```

## Usage

```bash

# Start the server (listen on port 3000)
NODE_ENV=production npm start

# Open your web browser
firefox http://localhost:3000/

```
