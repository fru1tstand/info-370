DELIMITER $$
CREATE PROCEDURE `usp_add_tag_to_post` (
	IN in_post_id INT(11),
    IN in_tag_name VARCHAR(128)
)
BEGIN
	DECLARE v_tag_id INT DEFAULT (SELECT `id` FROM `tag` WHERE `name` = in_tag_name);
    
    IF (v_tag_id) IS NULL THEN
		INSERT INTO `tag` (`name`) VALUES (in_tag_name);
        SET v_tag_id = LAST_INSERT_ID();
    END IF;
    
    INSERT INTO post_tag (`post_id`, `tag_id`) VALUES (in_post_id, v_tag_id);
END$$

DELIMITER ;

