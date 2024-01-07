#!/bin/bash
./login_mdb.sh < ../db/CDDB_Schema_DDL.sql
./login_mdb.sh < ../db/CDDB_Data_Insert.sql
echo "CDDB database has been reset"