-- Letters Pack
SELECT * FROM the_list WHERE name LIKE '_' ORDER BY name;

-- Creator Pack
SELECT * FROM the_list WHERE name IN (SELECT creator FROM Demon);

-- Season Pack
SELECT * FROM the_list WHERE name LIKE '%season%' OR name LIKE '%winter%' OR name LIKE '%spring%' OR name LIKE '%autumn%' OR name LIKE '%summer%';
