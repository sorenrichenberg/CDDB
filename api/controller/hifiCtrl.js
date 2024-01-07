const db = require('../database/connection');

class hifiController {
    // +--------------+------------------+------+-----+---------+-------+
    // | Field        | Type             | Null | Key | Default | Extra |
    // +--------------+------------------+------+-----+---------+-------+
    // | CD_ID        | int(10) unsigned | NO   |     | 0       |       |
    // | Artist_Group | mediumtext       | YES  |     | NULL    |       |
    // | CD_Title     | varchar(255)     | YES  |     | NULL    |       |
    // | Track_Title  | varchar(255)     | NO   |     | NULL    |       |
    // | Location     | varchar(255)     | YES  |     | NULL    |       |
    // | Path         | varchar(255)     | YES  |     | NULL    |       |
    // +--------------+------------------+------+-----+---------+-------+

    static getHifi(ctx) {
        /**
         * Returns all locally available hifi
         */
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Available_Hifi;`;
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

    static getHifiByArtist(ctx) {
        /**
         * Filter available hifi by Artist Name. 
         * Wildcard matching to accomodate non-atomic Artist_Group column
         */
        return new Promise((resolve, reject) => {
            const query = `
                SELECT *
                FROM Available_Hifi
                WHERE Artist_Group LIKE CONCAT('%', ?, '%');`;
            db.query(
                {
                    sql: query,
                    values: [ctx.params.Artist_Name]
                }, (err, res) => {
                    if (err) {
                        ctx.status = 400;
                        ctx.body = err.sqlMessage ?? 'Unknown error!';
                        reject(err);
                    }
                    ctx.body = res;
                    ctx.status = 200;
                    resolve();
                }
            );
        });
    }

    static getHifiByTrack(ctx) {
        /**
         * Filter available hifi by Track Title
         */
        return new Promise((resolve, reject) => {
            const query = `
                SELECT *
                FROM Available_Hifi
                WHERE Track_Title LIKE ?;`;
            db.query(
                {
                    sql: query,
                    values: [ctx.params.Track_Title]
                }, (err, res) => {
                    if (err) {
                        ctx.status = 400;
                        ctx.body = err.sqlMessage ?? 'Unknown error!';
                        reject(err);
                    }
                    ctx.body = res;
                    ctx.status = 200;
                    resolve();
                }
            );
        });
    }

    static getHifiByCD(ctx) {
        /**
         * Filter available hifi by CD Title
         */
        return new Promise((resolve, reject) => {
            const query = `
                SELECT *
                FROM Available_Hifi
                WHERE CD_Title LIKE ?;`;
            db.query(
                {
                    sql: query,
                    values: [ctx.params.CD_Title]
                }, (err, res) => {
                    if (err) {
                        ctx.status = 400;
                        ctx.body = err.sqlMessage ?? 'Unknown error!';
                        reject(err);
                    }
                    ctx.body = res;
                    ctx.status = 200;
                    resolve();
                }
            );
        });
    }

    static clearLossyErrors(ctx) {
        /**
         * Update 'fake' lossy files and change their flag to false
         */
        return new Promise((resolve, reject) => {
            const query = `CALL Clear_Lossy_Errors;`;
            db.query(query, (err, res) => {
                if (err) {
                    ctx.status = 400;
                    ctx.body = err.sqlMessage ?? 'Unknown error!';
                    reject(err);
                }
                ctx.body = res;
                ctx.body.message = `${ctx.body.affectedRows} lossy errors cleared.`;
                ctx.status = 200;
                resolve();
            });
        });
    }

    static countLossyErrors(ctx) {
        /**
         * Count 'fake' lossless files and their file types
         */
        return new Promise((resolve, reject) => {
            const query = `
                SELECT F.Format AS 'File Format', COUNT(*) AS 'Lossy Errors'
                FROM File AS F
                JOIN Track AS T ON (T.Title = F.Track_Title AND T.CD_ID = F.CD_ID)
                WHERE
                    Lossy = False 
                    AND (F.Format = 'WAV' OR F.Format = 'AIFF')
                    AND Bitrate(F.Size, T.Length) < 1411.200
                GROUP BY F.Format;`;
            db.query(query, (err, res) => {
                if (err) {
                    ctx.status = 400;
                    ctx.body = err.sqlMessage ?? 'Unknown error!';
                    reject(err);
                }
                ctx.body = res;
                ctx.body.message = `${ctx.body.affectedRows} lossy errors detected.`;
                ctx.status = 200;
                resolve();
            });
        });
    }
}

module.exports = hifiController;
