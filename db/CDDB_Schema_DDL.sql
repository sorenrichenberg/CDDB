USE srichenb_cs355fa22;

-- Tables ----------------------------------------------------------------------
DROP TABLE IF EXISTS CD_Personnel;
DROP TABLE IF EXISTS CD_Artist;
DROP TABLE IF EXISTS `File`;
DROP TABLE IF EXISTS Track;
DROP TABLE IF EXISTS CD;
DROP TABLE IF EXISTS Artist;

CREATE TABLE Artist (
    `Name` VARCHAR(64),
    Country CHAR(2) CHECK(Country REGEXP BINARY '[A-Z][A-Z]'), -- ISO 3166 country code
    PRIMARY KEY (`Name`)
);

CREATE TABLE CD (
    ID INT UNSIGNED AUTO_INCREMENT,
    Title VARCHAR(255),
    `Year` YEAR,
    `Location` VARCHAR(255),
    PRIMARY KEY (ID)
) AUTO_INCREMENT = 1600; -- Looks nicer starting high. 16 is a beautiful number.

CREATE TABLE Track (
    Title VARCHAR(255),
    CD_ID INT UNSIGNED,
    `Length` TIME NOT NULL,
    PRIMARY KEY (Title, CD_ID),
    FOREIGN KEY (CD_ID) REFERENCES CD (ID)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `File` (
    MD5 CHAR(34), -- 128 bit value can be stored as 32 character hex (+2 for 0x)
    Track_Title VARCHAR(255),
    CD_ID INT UNSIGNED,
    `Format` ENUM('WAV', 'AIFF', 'FLAC', 'OGG', 'MP3') NOT NULL,
    Size DECIMAL(10) UNSIGNED NOT NULL, -- Maximum possible bits on a CD is 10 digits long, and larger than 32 bits (44100 * 16 * 2 * 80 * 60)
    `Path` VARCHAR(255) UNIQUE NOT NULL,
    Lossy BOOLEAN DEFAULT FALSE NOT NULL,
    PRIMARY KEY (MD5, Track_Title, CD_ID),
    FOREIGN KEY (CD_ID) REFERENCES Track (CD_ID)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (Track_Title) REFERENCES Track (Title)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE CD_Artist (
    CD_ID INT UNSIGNED,
    Artist_Name VARCHAR(64),
    PRIMARY KEY (Artist_Name, CD_ID),
    FOREIGN KEY (Artist_Name) REFERENCES Artist(`Name`)
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    FOREIGN KEY (CD_ID) REFERENCES CD(ID)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE CD_Personnel (
    CD_ID INT UNSIGNED,
    Person VARCHAR(63),
    PRIMARY KEY (CD_ID, Person),
    FOREIGN KEY (CD_ID) REFERENCES CD(ID)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- View, Function, Procedure ---------------------------------------------------

-- Bitrate() Function:
-- This function derives the Bitrate attribute of a File.
-- Parameters:  File_Size - DECIMAL(10) - The number of bits in the file 
--              Track_Length - TIME - The length of the song
-- Returns:     Bitrate - DECIMAL(7, 3) - The bitrate of the file in kilobits
--                  per second
DROP FUNCTION IF EXISTS Bitrate;
DELIMITER //
CREATE OR REPLACE FUNCTION Bitrate(
    File_Size DECIMAL(10) UNSIGNED,
    Track_Length TIME
)
RETURNS DECIMAL(7, 3)
BEGIN
    RETURN File_Size / TIME_TO_SEC(Track_Length) / 1000;
END; //
DELIMITER ;

-- Track_Count() Function:
-- This function derives the Track Count of a CD.
-- Parameters:  Search_ID - INT UNSIGNED - The ID of the CD for tracks to be 
--                  counted
-- Returns:     Track_Count - INT UNSIGNED - The number of tracks on a CD
DROP FUNCTION IF EXISTS Track_Count;
DELIMITER //
CREATE OR REPLACE FUNCTION Track_Count(
    Search_ID INT UNSIGNED
)
RETURNS INT UNSIGNED
BEGIN
    DECLARE Total INT UNSIGNED;
    SELECT COUNT(*) INTO Total FROM Track WHERE CD_ID = Search_ID;
    RETURN Total;
END; //
DELIMITER ;

-- Available_Hifi View:
-- This view shows all lossless music available locally, and where to find it
-- All results are either available via CD in the home library, or via a 
-- lossless file in the Music Folder of the local machine.
DROP VIEW IF EXISTS Available_Hifi;
CREATE OR REPLACE VIEW Available_Hifi AS
SELECT
    C.ID AS CD_ID,
    AG.Artist_Group,
    C.Title AS CD_Title,
    T.Title AS Track_Title,
    C.Location,
    F.Path
FROM ( -- Artist names are concatenated where CDs contain multiple
        SELECT GROUP_CONCAT(Artist_Name) AS Artist_Group, ID
        FROM CD_Artist
        JOIN CD ON CD.ID = CD_Artist.CD_ID
        GROUP BY CD_Artist.CD_ID
    ) AS AG
JOIN CD AS C ON AG.ID = C.ID
JOIN Track AS T ON AG.ID = T.CD_ID
LEFT JOIN `File` AS F ON T.Title = F.Track_Title
WHERE 
    C.Location LIKE 'Home%' 
    OR (F.Path LIKE '~/home/srichenberg/Music/%' AND F.Lossy = 0);
-- The columns produced by this view can be wide. The following template is 
-- helpful for narrowing the output of this view without compromising its data 
-- columns for query use
/*
SELECT
    CD_ID AS `CD ID`,
    LEFT(Artist_Group, 32) AS 'Artist Name(s)',
    LEFT(CD_Title, 32) AS 'CD Title',
    LEFT(Track_Title, 32) AS 'Song Title',
    Location AS 'Location of CD',
    LEFT(SUBSTRING_INDEX(Path, 'Music', -1), 64) AS 'Path from Music Folder'
FROM Available_Hifi;
*/

-- Clear_Lossy_Errors Procedure
-- This procedure changes Lossy to True on every file in a lossless format that
-- does not have the bitrate (1411.200 kbps for CD quality) to back that up.
DROP PROCEDURE IF EXISTS Clear_Lossy_Errors;
DELIMITER //
CREATE PROCEDURE Clear_Lossy_Errors()
BEGIN
    UPDATE `File` AS F
    JOIN Track AS T ON (T.Title = F.Track_Title AND T.CD_ID = F.CD_ID)
    SET F.Lossy = True
    WHERE 
        Lossy = False 
        AND (F.Format = 'WAV' OR F.Format = 'AIFF')
        AND Bitrate(F.Size, T.Length) < 1411.200;
END //
DELIMITER ;

-- Push_CD Procedure (Created for Project02 )
-- This procedure inserts a CD and all necessary artist info
DROP PROCEDURE IF EXISTS Push_CD;
DELIMITER //
CREATE PROCEDURE Push_CD(
    IN Artist_Name VARCHAR(64),
    IN Artist_Country CHAR(2),
    IN CD_Title VARCHAR(255),
    IN CD_Year YEAR,
    IN CD_Location VARCHAR(255)
)
BEGIN
START TRANSACTION;
    INSERT IGNORE INTO Artist VALUES (Artist_Name, Artist_Country);
    INSERT INTO CD (Title, `Year`, `Location`) VALUES (CD_Title, CD_Year, CD_Location);
    SET @current_album = LAST_INSERT_ID();
    INSERT IGNORE INTO CD_Artist VALUES (@current_album, Artist_Name);
COMMIT;
END //
DELIMITER ;

-- Pop_CD Procedure (Created for Project02 )
-- This procedure removes a CD and related table data
DROP PROCEDURE IF EXISTS Pop_CD;
DELIMITER //
CREATE PROCEDURE Pop_CD(
    IN IN_ID INT UNSIGNED
)
BEGIN
START TRANSACTION;
    DELETE FROM CD_Personnel WHERE CD_ID = IN_ID;
    DELETE FROM CD_Artist WHERE CD_ID = IN_ID;
    DELETE FROM CD WHERE ID = IN_ID;
COMMIT;
END //
DELIMITER ;
    
