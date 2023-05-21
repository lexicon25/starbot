-- Letters Pack
SELECT * FROM the_list WHERE CHAR_LENGTH() = 1;   -- gets single numbers as well if that ever exists (unlikely)

-- Creator Pack
SELECT * FROM the_list WHERE name IN (SELECT creator FROM Demon);
