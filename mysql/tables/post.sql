CREATE TABLE `post` (
  `id` INT(11) NOT NULL,
  `post_type_id` INT NULL,
  `accepted_answer_id` INT NULL,
  `parent_id` INT NULL,
  `owner_user_id` INT NULL,
  `creation_date` INT(10) NULL,
  `last_edit_date` INT(10) NULL,
  `last_activity_date` INT(10) NULL,
  `view_count` INT NULL,
  `answer_count` INT NULL,
  `comment_count` INT NULL,
  `favorite_count` INT NULL,
  `score` INT NULL,
  `tags` VARCHAR(250) NULL,
  `title` VARCHAR(250) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_post_post_type_idx` (`post_type_id` ASC),
  INDEX `fk_post_user_idx` (`owner_user_id` ASC),
  CONSTRAINT `fk_post_post_type`
    FOREIGN KEY (`post_type_id`)
    REFERENCES `post_type` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_post_user`
    FOREIGN KEY (`owner_user_id`)
    REFERENCES `user` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
ALTER TABLE `post` 
ADD INDEX `fk_post_accepted_answer_idx` (`accepted_answer_id` ASC),
ADD INDEX `fk_post_parent_idx` (`parent_id` ASC);
ALTER TABLE `post` 
ADD CONSTRAINT `fk_post_accepted_answer`
  FOREIGN KEY (`accepted_answer_id`)
  REFERENCES `post` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
ADD CONSTRAINT `fk_post_parent`
  FOREIGN KEY (`parent_id`)
  REFERENCES `post` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
