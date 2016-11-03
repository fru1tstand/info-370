CREATE TABLE `user` (
   `id` int(11) NOT NULL,
   `reputation` int(11) DEFAULT NULL,
   `creation_date` int(10) DEFAULT NULL,
   `display_name` varchar(128) DEFAULT NULL,
   `location` varchar(128) DEFAULT NULL,
   `views` int(11) DEFAULT NULL,
   `upvotes` int(11) DEFAULT NULL,
   `downvotes` int(11) DEFAULT NULL,
   `age` int(11) DEFAULT NULL,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8