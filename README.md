# Mustard Bot

A helper bot designed for Salt and Pepper crew playing Granblue Fantasy.

Uses [Discord.js](https://discord.js.org/#/).

## Requirements
1. NodeJS (Latest should be fine)
2. git

I recommend setting up a virtualenv and nodeenv.

### OS X:
1. ``pip install virtualenv``
2. ``pip install nodeenv``
3. ``mkdir ~/virtualenv/``
4. ``virtualenv ~/virtualenv/develop``
5. ``nodeenv ~/virtualenv/develop/nodeenv``

#### Optional (strongly recommended):
Add the following to your ~/.bash_profile or ~/.bashrc file.
```
ve-develop() {
  source ~/virtualenv/develop/bin/activate
  . ~/virtualenv/develop/nodeenv
}
```

Restart bash ``exec bash`` or open a new terminal.
Now you can enter your development environment by typing ``ve-develop`` (this is autocomplete friendly).

## Installation
1. Clone this repository ``git clone https://github.com/lowill/mustard-bot.git``
2. ``cd mustard-bot && npm install``
3. Create a file named ``config.json`` in the project's root directory.  Use ``config.json.template`` as a reference to populate its fields.
4. Create a file named ``channels.json`` in the project's root directory.  Use ``channels.json.template`` as a reference to populate its fields.
  ** Sorry, I currently have the following string literal 'salt-lobby' strewn throughout the project.  This a reference to a channelKey in ``channels.json`` and you will likely want to change that value.  I plan to refactor this.