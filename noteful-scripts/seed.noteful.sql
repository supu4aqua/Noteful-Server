-- TRUNCATE all tables to ensure that there are no
-- data in them so we start with a fresh set of data
TRUNCATE folders, notes RESTART IDENTITY CASCADE;

INSERT INTO folders
  (id, name)
  VALUES
    (101, 'Important'),
    (102, 'Super'),
    (103, 'Spangley');
 

 INSERT INTO notes
  (id, name, modified, folderId, content)
  VALUES
    (1001, 'Dogs', '3/4/2019', 101, 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui. Velit ex animi reiciendis quasi. Suscipit totam delectus ut voluptas aut qui rerum. Non veniam eius molestiae rerum quam.\n \rUnde qui aperiam praesentium alias. Aut temporibus id quidem recusandae voluptatem ut eum. Consequatur asperiores et in quisquam corporis maxime dolorem soluta. Et officiis id est quia sunt qui iste reiciendis saepe.'),
    (1002, 'Plan christmas party', '11/20/2019', 101, 'Content for 1002'),
    (1003, 'Remove old stock', '4/6/2019', 102, 'Conetnt for Remove old Stock'),
    (1004, 'Watch paint dry', '2/11/2019', 103, 'Conetnt for Watch paint dry');

