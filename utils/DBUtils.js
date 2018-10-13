const sqlite = require('sqlite3').verbose();

class Connection {

  constructor(dbname='mustard_bot.sqlite') {
    this.db = new sqlite.Database(dbname);
  }

  run(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if(err === null) {
          resolve();
        }
        else {
          reject(err);
        }
      })
    });
  }

  get(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if(err === null) {
          resolve(row);
        }
        else {
          reject(err);
        }
      });
    });
  }

  all(sql, params) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if(err === null) {
          resolve(rows);
        }
        else {
          reject(err);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close(err => {
        if(err === null) {
          resolve();
        }
        else {
          reject(err);
        }
      });
    });
  }

}

module.exports.Connection = Connection;