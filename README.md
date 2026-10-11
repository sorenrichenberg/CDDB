# CDDB

A relational database and REST API for tracking CDs and the audio files ripped from them.

I built this for CS355 Database Management Systems at Sonoma State University in 2022. It uses MySQL for the database and Node.js with Koa for the API.

## What it does

- Tracks CDs, artists, songs, personnel, and ripped files.
- Finds unripped tracks and locally available high-fidelity audio.
- Provides API endpoints for managing CDs and files, searching for music, and checking for mislabeled lossless files.

## Repository

- [Database](db/): Schema, sample data, and example queries.
- [API](api/): REST API and endpoint documentation.
- [Tools](tools/): Database helpers and sample curl requests.

The database names, paths, and connection settings reflect the original course environment.
