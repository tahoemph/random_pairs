Random Pairings
===============

This original purpose of this set of programs was to pair up people in an office to
encourage interaction and understanding.  Each month a set of pairs that had never been
chosen before was made.  This was done by hand and became painful.  This introduces
three programs to make that easier:

1) create\_pairs
2) test\_pairs
3) make\_pairs

The idea is that create\_pairs emits a set of unique pairs (using history) as a CSV.
test\_pairs test to see if the set of pairs is unique.  This allows the CSV to be
hand modified and then tested.  make\_pairs writes the history of the pair set chosen.

History is kept in a database specified in a config.json file in the same directory as
the program is run from.  Nominally this is a local sqlite database.

The sqlite database is made up of two tables.

The first table is a set of users.  This table
has the schema of a column of string which represent the names and a column of boolean which
represent if that person is still active in the pairing.

The second table are all the pairs that have been used to this point in two columns with the
first column containing the name which is lexicographically less than the second name.
