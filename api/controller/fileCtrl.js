const db = require('../database/connection');

const md5 = require('blueimp-md5');

class fileController {
    // +-------------+---------------------------------------+------+-----+---------+-------+
    // | Field       | Type                                  | Null | Key | Default | Extra |
    // +-------------+---------------------------------------+------+-----+---------+-------+
    // | MD5         | char(34)                              | NO   | PRI | NULL    |       |
    // | Track_Title | varchar(255)                          | NO   | PRI | NULL    |       |
    // | CD_ID       | int(10) unsigned                      | NO   | PRI | NULL    |       |
    // | Format      | enum('WAV','AIFF','FLAC','OGG','MP3') | NO   |     | NULL    |       |
    // | Size        | decimal(10,0) unsigned                | NO   |     | NULL    |       |
    // | Path        | varchar(255)                          | NO   | UNI | NULL    |       |
    // | Lossy       | tinyint(1)                            | NO   |     | 0       |       |
    // +-------------+---------------------------------------+------+-----+---------+-------+

    static getFiles(ctx) {
        /**
         * Returns all File data
         */
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM File;`;
            db.query(query, (err, res) => {
                if (err) {
                    ctx.status = 400;
                    ctx.body = err.sqlMessage ?? 'Unknown error!';
                    reject(err);
                }
                ctx.body = res;
                ctx.status = 200;
                resolve();
            });
        });
    }

    static getFileByMD5(ctx) {
        /**
         * Returns a File by its MD5 hash
         */
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM File WHERE MD5 = ?;`;
            db.query({
                sql: query,
                values: [ctx.params.MD5]
            }, (err, res) => {
                if (err) {
                    ctx.status = 400;
                    ctx.body = err.sqlMessage ?? 'Unknown error!';
                    reject(err);
                }
                ctx.body = res;
                ctx.status = 200;
                resolve();
            });
        });
    }

    static updateFile(ctx) {
        /**
         * Update a file by its MD5 hash
         */
        return new Promise((resolve, reject) => {
            const file = ctx.request.body;
            const query = `
                UPDATE File
                SET MD5 = ?,
                    Format = ?,
                    Size = ?,
                    Path = ?,
                    Lossy = ?
                WHERE MD5 = ?;`;
            // set path 'slash' to Windows or Unix format
            const pathDelimiter = file.Path[0] == 'C' ? '\\' : '/';
            db.query({
                sql: query,
                values: [
                    ( // generate md5 hash
                        '0x' + md5(file.Track_Title + file.Format)
                    ),
                    file.Format,
                    file.Size,
                    ( // concatenate to base path
                        file.Path
                        + pathDelimiter + file.Artist_Name
                        + pathDelimiter + file.Album_Title
                        + pathDelimiter + file.Track_Title
                        + '.' + file.Format
                    ),
                    ( // generate lossy boolean as integer
                        (file.Format == 'OGG') + (file.Format == 'MP3')
                    ),
                    file.MD5 // note: this is the old MD5 hash used for search
                ]
            }, (err, res) => {
                if (err) {
                    ctx.status = 400;
                    ctx.body = err.sqlMessage ?? 'Unknown error!';
                    reject(err);
                }
                ctx.body = res;
                ctx.status = 201;
                resolve();
            });
        });
    }

    static insertFile(ctx) {
        /**
         * Insert a new file
         */
        return new Promise((resolve, reject) => {
            const file = ctx.request.body;
            const query = `
            INSERT INTO File (MD5, Track_Title, CD_ID, Format, Size, Path, Lossy)
            VALUES (?, ?, ?, ?, ?, ?, ?);`;
            // check whether path is Windows/Unix
            const pathDelimiter = file.Path[0] == 'C' ? '\\' : '/';
            db.query({
                sql: query,
                values: [
                    ( // generate md5 hash
                        '0x' + md5(file.Track_Title + file.Format)
                    ),
                    file.Track_Title,
                    file.CD_ID,
                    file.Format,
                    file.Size,
                    ( // concatenate to base path
                        file.Path
                        + pathDelimiter + file.Artist_Name
                        + pathDelimiter + file.Album_Title
                        + pathDelimiter + file.Track_Title
                        + '.' + file.Format
                    ),
                    ( // generate lossy boolean as integer
                        (file.Format == 'OGG') + (file.Format == 'MP3')
                    )
                ]
            }, (err, res) => {
                if (err) {
                    ctx.status = 400;
                    ctx.body = err.sqlMessage ?? 'Unknown error!';
                    reject(err);
                }
                ctx.body = res;
                ctx.status = 201;
                resolve();
            });
        });
    }

    static deleteFileByMD5(ctx) {
        /**
         * Deletes a File by its MD5 hash
         */
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM File
                WHERE MD5 = ?;`;
            db.query({
                sql: query,
                values: [ctx.params.MD5]
            }, (err, res) => {
                if (err) {
                    ctx.status = 400;
                    ctx.body = err.sqlMessage ?? 'Unknown error!';
                    reject(err);
                }
                ctx.body = res;
                ctx.body.message = `File with MD5: ${ctx.params.MD5} has been deleted.`;
                ctx.status = 204;
                resolve();
            });
        });
    }
}

module.exports = fileController;
