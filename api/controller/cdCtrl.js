const db = require('../database/connection');

class cdController {
    // +----------+------------------+------+-----+---------+----------------+
    // | Field    | Type             | Null | Key | Default | Extra          |
    // +----------+------------------+------+-----+---------+----------------+
    // | ID       | int(10) unsigned | NO   | PRI | NULL    | auto_increment |
    // | Title    | varchar(255)     | YES  |     | NULL    |                |
    // | Year     | year(4)          | YES  |     | NULL    |                |
    // | Location | varchar(255)     | YES  |     | NULL    |                |
    // +----------+------------------+------+-----+---------+----------------+

    static getCDs(ctx) {
        /**
         * Returns all CD data
         */
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM CD;`;
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

    static getCDById(ctx) {
        /**
         * Returns a CD by its ID
         * Returns all tracks from the CD with CD, Track, and Artist data
         */
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    C.ID AS CD_ID, 
                    A.Artist_Name AS Artist, 
                    C.Title AS CD_Title, 
                    C.Year, 
                    C.Location, 
                    T.Title AS Track_Title, 
                    T.Length
                FROM CD AS C
                JOIN Track AS T ON (T.CD_ID = C.ID)
                JOIN CD_Artist AS A ON (A.CD_ID = C.ID)
                WHERE C.ID = ?;`;
            db.query(
                {
                    sql: query,
                    values: [ctx.params.ID]
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

    static updateCD(ctx) {
        /**
         * Update a CD by its CD_ID
         */
        return new Promise((resolve, reject) => {
            const cd = ctx.request.body;
            const query = `
                UPDATE CD AS C, Artist AS A, CD_Artist AS CA
                SET C.Title = ?,
                    C.Year = ?,
                    C.Location = ?,
                    CA.Artist_Name = ?,
                    A.Name = ?,
                    A.Country = ?
                WHERE C.ID = CA.CD_ID
                    AND CA.CD_ID = ?
                    AND A.Name = CA.Artist_Name;`;
            db.query(
                {
                    sql: query,
                    values: [
                        cd.Title,
                        cd.Year,
                        cd.Location,
                        cd.Artist_Name,
                        cd.Artist_Name,
                        cd.Artist_Country,
                        cd.ID
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
                }
            );
        });
    }

    static insertCD(ctx) {
        /**
         * Insert a new cd and all of its tracks and artist info
         * Since this query requires the modification of multiple tables,
         * I implemented a new SQL Procedure to perform these operations.
         */
        return new Promise((resolve, reject) => {
            const cd = ctx.request.body;
            const query = `CALL Push_CD(?, ?, ?, ?, ?)`;
            db.query(
                {
                    sql: query,
                    values: [
                        cd.Artist_Name,
                        cd.Artist_Country,
                        cd.Title,
                        cd.Year,
                        cd.Location
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
                }
            );
        });
    }

    static deleteCDById(ctx) {
        /**
         * Deletes a CD by its ID
         * Since this query requires the modification of multiple tables,
         * I implemented a new SQL Procedure to perform these operations.
         */
        return new Promise((resolve, reject) => {
            const query = `CALL Pop_CD(?)`;
            db.query(
                {
                    sql: query,
                    values: [ctx.params.ID]
                }, (err, res) => {
                    if (err) {
                        ctx.status = 400;
                        ctx.body = err.sqlMessage ?? 'Unknown error!';
                        reject(err);
                    }
                    ctx.body = res;
                    ctx.body.message = `CD with ID: ${ctx.params.ID} has been deleted.`;
                    ctx.status = 204;
                    resolve();
                }
            );
        });
    }
}

module.exports = cdController;
