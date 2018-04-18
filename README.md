# FreeSpeed

# TODOS

Front End: Alex Yu, Russell Dodd

1. Login Page
2. Create Account Page
3. Upload Data Page
4. Main Page

----------------------
Back-end: James Fife, Sathya Anisetti

1. Design a SQLite3 DB
2. Create program to parse data + upload to DB
3. Authentication stuff
4. Send data to front-end

Data:
data-id, store Per-stroke Data columns, person-workout-id

person-workout-id, start-times

workout-id, person-workout-id, boat-id

boat-name, boat-size, boat-id

name (potentially add stats columns weights) person-id

---------------------------------------------------------------------
TABLES
1. Users:
id, username, password, permission, name
permission is 1 if coach, 0 o/w

2. Boats:
id, size, name

3. Workout:
id, date, type

5. Workout-User-Boat:
id, workout id, user id, boat id, start-time

6. Data:
id, workout-user-boat-id, per-stroke data columns
--------------------------------------------------------------------

Request workout for a certain day
