# CDDB REST API

This application serves as a developer-friendly interface to users’ personal CD databases by providing a uniform interface to serve data over the network.

The most important service for the API to provide is a verbose interface for viewing and filtering information from the Available Hifi view in the CD Database. This endpoint is designed to provide a detailed view of every high fidelity audio File or CD that is available at the user’s current location. This view is given its own controller and route path. This provides users with a number of HTTP GET methods for monitoring and clearing errors, as well as searching for music by artist name, CD title, and track title.

The primary musical entities in the database are CDs and Files. Users need to be able to insert, update, or delete these entities as their collections expand and refine. Both CDs and Files are given their own controllers and route paths. They provide HTTP GET PUT POST and DELETE methods.

## Path Name: `Default`

**Path:** `api/v1/`  
**Description:** This default route ties the CD, File, and Hifi routes together. HTTP GET requests to
this route display a welcome message.

## Path Name: `getCDs`

**Path:** `api/v1/cd`  
**Description:** This route uses the CD controller to get all data from the CD table in the database.

## Path Name: `getCDById`

**Path:** `api/v1/cd/:ID`  
**Description:** This route uses the CD controller to get CD data with a matching ID. It joins useful
information like the name of the artist and the tracks on the CD from other tables in the
database.

## Path Name: `updateCD`

**Path:** `api/v1/cd`  
**Description:** This route uses the CD controller to update an existing CD in the database. It
updates the Artist and CD_Artist tables when necessary.

## Path Name: `insertCD`

**Path:** `api/v1/cd`  
**Description:** This route uses the CD controller to insert a new CD into the database. It updates
the Artist and CD_Artist tables when necessary by using a new stored procedure called
Push_CD().
Note: My intention for this method was to use a “Tracks” array in the JSON file in order to
perform all of the necessary track inserts in one request. I put a great deal of effort into
researching and testing different approaches. I could not figure out a way to do this without
creating opportunity for SQL injection or switching to a different nodejs package for mySQL.

## Path Name: `deleteCDById`

**Path:** `api/v1/cd/:ID`  
**Description:** This route uses the CD controller to delete a CD with a matching ID from the
database.It updates the CD_Artist table by using a new stored procedure called Pop_CD().

## Path Name: `getFiles`

**Path:** `api/v1/file`  
**Description:** This route uses the File controller to get all data from the File table in the database.

## Path Name: `getFileByMD5`

**Path:** `api/v1/file/:MD5`  
**Description:** This route uses the File controller to get a File by its MD5 hash.

## Path Name: `updateFile`

**Path:** `api/v1/file/`  
**Description:** This route uses the File controller to update an existing File in the database. Before
making the query, the controller generates a new MD5 hash, constructs a filepath from the base
path, and derives whether or not the file is lossy based on its file extension.
Note: This route is compatible with C:\Windows\style\paths as well as ~/Unix/style/paths.

## Path Name: `insertFile`

**Path:** `api/v1/file/`  
**Description:** This route uses the File controller to insert a new File into the database. Before
making the query, the controller generates a new MD5 hash, constructs a filepath from the base
path, and derives whether or not the file is lossy based on its file extension.
Note: This route is compatible with C:\Windows\style\paths as well as ~/Unix/style/paths.

## Path Name: `deleteFileByMD5`

**Path:** `api/v1/file/:MD5`  
**Description:** This route uses the File controller to delete a file with a matching MD5 hash from
the database.

## Path Name: `getHifi`

**Path:** `api/v1/hifi`  
**Description:** This route uses the Hifi controller to get all available Hifi from the Available_Hifi
view in the database.

## Path Name: `countLossyErrors`

**Path:** `api/v1/hifi/count_errors`  
**Description:** This route uses the Hifi controller to check for ‘fake’ lossless Files (Files that are
marked as lossless but don’t have the bitrate to prove it).

## Path Name: `clearLossyErrors`

**Path:** `api/v1/hifi/clear_errors`  
**Description:** This route uses the Hifi controller to call the Clear_Lossy_Errors() procedure, which
will fix any ‘fake’ lossless Files (Files that are marked as lossless but don’t have the bitrate to
prove it).

## Path Name: `getHifiByArtist`, `getHifiByTrack`, `getHifiByCD`

**Path:** `api/v1/hifi/by_artist` `api/v1/hifi/by_track` `api/v1/hifi/by_cd`  
**Description:** These routes use the Hifi controller to get available Hifi from the Available_Hifi view
in the database, and filter the results by CD title, Track title, or the name of any participating
Artist from the CD.
