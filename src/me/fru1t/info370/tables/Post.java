package me.fru1t.info370.tables;

import static me.fru1t.info370.Util.pi;
import static me.fru1t.info370.Util.getUnixDate;

/**
 * Represents a complete row within the Post table.
 */
public class Post {
	public static final String MYSQL_INSERT = 
			"INSERT INTO post (id, post_type_id, "
			+ "accepted_answer_id, parent_id, owner_user_id, creation_date, "
			+ "last_edit_date , last_activity_date, view_count, answer_count, "
			+ "comment_count, favorite_count, score, tags, title)"
			+ "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
	
	public static final int COL_ID = 1;
	public static final int COL_POST_TYPE_ID = 2;
	public static final int COL_ACCEPTED_ANSWER_ID = 3;
	public static final int COL_PARENT_ID = 4;
	public static final int COL_OWNER_USER_ID = 5;
	public static final int COL_CREATION_DATE = 6;
	public static final int COL_LAST_EDIT_DATE = 7;
	public static final int COL_LAST_ACTIVITY_DATE = 8;
	public static final int COL_VIEW_COUNT = 9;
	public static final int COL_ANSWER_COUNT = 10;
	public static final int COL_COMMENT_COUNT = 11;
	public static final int COL_FAVORITE_COUNT = 12;
	public static final int COL_SCORE = 13;
	public static final int COL_TAGS = 14;
	public static final int COL_TITLE = 15;
	
	public String Id;
	public String PostTypeId;
	public String AcceptedAnswerId;
	public String ParentId;
	public String CreationDate;
	public String Score;
	public String ViewCount;
	public String OwnerUserId;
	public String LastEditDate;
	public String LastActivityDate;
	public String AnswerCount;
	public String CommentCount;
	public String FavoriteCount;
	public String Tags;
	public String Title;
	
	public int getId() {
		// Error if not present
		return Integer.parseInt(Id);
	}
	
	public int getPostTypeId() {
		// Error if not present
		return Integer.parseInt(PostTypeId);
	}
	
	public Integer getAcceptedAnswerId() {
		return pi(AcceptedAnswerId, -1);
	}
	
	public Integer getParentId() {
		return pi(ParentId, -1);
	}
	
	public int getCreationDate() {
		return getUnixDate(CreationDate);
	}
	
	public int getScore() {
		return pi(Score, 0);
	}
	
	public int getViewCount() {
		return pi(ViewCount, 0);
	}
	
	public int getOwnerUserId() {
		return pi(OwnerUserId, -1); // -1 is community
	}
	
	public int getLastEditDate() {
		return getUnixDate(LastEditDate);
	}
	
	public int getLastActivityDate() {
		return getUnixDate(LastActivityDate);
	}
	
	public int getAnswerCount() {
		return pi(AnswerCount, 0);
	}
	
	public int getCommentCount() {
		return pi(CommentCount, 0);
	}
	
	public int getFavoriteCount() {
		return pi(FavoriteCount, 0);
	}
	
	public String getTags() {
		return Tags;
	}
	
	public String getTitle() {
		return Title;
	}

	@Override
	public String toString() {
		return "Post [Id=" + Id + ", PostTypeId=" + PostTypeId + ", AcceptedAnswerId=" + AcceptedAnswerId
				+ ", ParentId=" + ParentId + ", CreationDate=" + CreationDate + ", Score=" + Score + ", ViewCount="
				+ ViewCount + ", OwnerUserId=" + OwnerUserId + ", LastEditDate=" + LastEditDate + ", LastActivityDate="
				+ LastActivityDate + ", AnswerCount=" + AnswerCount + ", CommentCount=" + CommentCount
				+ ", FavoriteCount=" + FavoriteCount + ", Tags=" + Tags + ", Title=" + Title + "]";
	}
	
	
}
