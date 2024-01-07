USE srichenb_cs355fa22;

-- Query 01
-- CDs that have yet to be ripped
SELECT 
    A.Artist_Name AS 'Artist',
    C.Title AS 'CD',
    EX.Title AS 'Track',
    C.Location AS 'Location'
FROM ( 
    SELECT CD_ID, Title FROM Track
    EXCEPT
    SELECT CD_ID, Track_Title FROM `File`
) AS EX
JOIN CD AS C ON (C.ID = EX.CD_ID)
JOIN CD_Artist AS A ON (C.ID = A.CD_ID);


-- Query 02
-- Available lossless music that Rick Rubin helped produce
SELECT
    CD_ID AS `CD ID`,
    LEFT(Artist_Group, 32) AS 'Artist Name(s)',
    LEFT(CD_Title, 32) AS 'CD Title',
    LEFT(Track_Title, 32) AS 'Song Title',
    Location AS 'Location of CD',
    LEFT(SUBSTRING_INDEX(Path, 'Music', -1), 64) AS 'Path from Music Folder'
FROM Available_Hifi
WHERE EXISTS (
    SELECT *
    FROM CD_Personnel
    WHERE 
        CD_Personnel.Person = 'Rick Rubin'
        AND Available_Hifi.CD_ID = CD_Personnel.CD_ID
);

-- Query 03
-- CDs featuring John Frusciante outside of the Red Hot Chili Peppers catalog
SELECT * 
FROM CD 
WHERE EXISTS (
    SELECT *
    FROM CD_Personnel
    WHERE 
        CD_Personnel.Person = 'John Frusciante'
        AND CD.ID = CD_Personnel.CD_ID
) AND CD.ID NOT IN (
    SELECT CD_ID
    FROM CD_Artist
    WHERE CD_Artist.Artist_Name = 'Red Hot Chili Peppers'
);

-- Query 04
-- CDs to entertain company for at least an hour and their Track Count
SELECT CD.*, Track_Count(CD.ID) AS 'Track Count', PT.Playtime
FROM (
    SELECT CD_ID, SEC_TO_TIME(SUM(TIME_TO_SEC(Track.`Length`))) AS 'Playtime'
    FROM Track
    GROUP BY CD_ID
    HAVING SUM(TIME_TO_SEC(Track.`Length`)) > 3600 -- 60 seconds * 60 minutes
) AS PT
JOIN CD ON (PT.CD_ID = CD.ID);

-- Query 05
-- all musical personnel in the database in alphabetical order.
SELECT DISTINCT Person
FROM CD_Personnel
ORDER BY Person;

-- Query 06
-- Count Fake Lossy Files
-- Lossless files are only lossless to their source audio! If a "Lossless"
-- file is created from a lossy source file, the result is lossy by nature.
-- These "Lossless" files are fake!
SELECT F.Format AS 'File Format', COUNT(*) AS '# of Lossy Errors'
FROM `File` AS F
JOIN Track AS T ON (T.Title = F.Track_Title AND T.CD_ID = F.CD_ID)
WHERE
    Lossy = False 
    AND (F.Format = 'WAV' OR F.Format = 'AIFF')
    AND Bitrate(F.Size, T.Length) < 1411.200
GROUP BY F.Format;

CALL Clear_Lossy_Errors();
-- Should affect # of rows = '# of Lossy Errors' in previous query