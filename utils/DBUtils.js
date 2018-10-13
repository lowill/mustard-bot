const sqlite = require('sqlite3').verbose();

class Connection {

  constructor(dbname='mustard_bot') {
    this.db = new sqlite.Database(dbname);
  }

  run(sql, args) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, args, (err) => {
        if(err === null) {
          resolve();
        }
        else {
          reject(err);
        }
      })
    });
  }

  get(sql, args) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, args, (err, row) => {
        if(err === null) {
          resolve(row);
        }
        else {
          reject(err);
        }
      });
    });
  }

  all(sql, args) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, args, (err, rows) => {
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