package me.fru1t.info370.processes;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;

import me.fru1t.info370.Database;
import me.fru1t.info370.XmlRowReader;
import me.fru1t.info370.tables.Post;

public class PostProcess implements Runnable {
	private static final String POST_XML_FILE_LOCATION =
			"D:\\stack\\stackoverflow\\stackoverflow.com-Posts\\Posts.xml";

	@Override
	public void run() {
		try {
			XmlRowReader<Post> reader;
				reader = new XmlRowReader<Post>(POST_XML_FILE_LOCATION, Post.class);
	
			long rows = 0;
			PreparedStatement stmt = Database.prepareStatement(Post.MYSQL_INSERT);
			
			while (!reader.isComplete()) {
				Post p = reader.next();
				if (p != null) {
					try {
						stmt.setInt(Post.COL_ID, p.getId());
						stmt.setInt(Post.COL_POST_TYPE_ID, p.getPostTypeId());
					} catch (NumberFormatException e) {
						System.out.println("Skipped row " + p.toString());
						continue;
					}
					
					int acceptedAnswerId = p.getAcceptedAnswerId();
					if (acceptedAnswerId == -1) {
						stmt.setNull(Post.COL_ACCEPTED_ANSWER_ID, Types.INTEGER);
					} else {
						stmt.setInt(Post.COL_ACCEPTED_ANSWER_ID, acceptedAnswerId);
					}
					
					int parentId = p.getParentId();
					if (parentId == -1) {
						stmt.setNull(Post.COL_PARENT_ID, Types.INTEGER);
					} else {
						stmt.setInt(Post.COL_PARENT_ID, parentId);
					}
		
					stmt.setInt(Post.COL_OWNER_USER_ID, p.getOwnerUserId());
					stmt.setInt(Post.COL_CREATION_DATE, p.getCreationDate());
					stmt.setInt(Post.COL_LAST_EDIT_DATE, p.getLastEditDate());
					stmt.setInt(Post.COL_LAST_ACTIVITY_DATE, p.getLastActivityDate());
					stmt.setInt(Post.COL_VIEW_COUNT, p.getViewCount());
					stmt.setInt(Post.COL_ANSWER_COUNT, p.getAnswerCount());
					stmt.setInt(Post.COL_COMMENT_COUNT, p.getCommentCount());
					stmt.setInt(Post.COL_FAVORITE_COUNT, p.getFavoriteCount());
					stmt.setInt(Post.COL_SCORE, p.getScore());
					stmt.setString(Post.COL_TAGS, p.getTags());
					stmt.setString(Post.COL_TITLE, p.getTitle());
					
					stmt.addBatch();
					
					if (rows++ % 20000 == 0) {
						System.out.println("Committing row " + p.getId() + " (" + rows + " rows)");
						try {
							stmt.executeBatch();
						} catch (SQLException e) {
							System.out.println("Failed to mysql on " + e.getMessage());
						}
					}
				}
			}
		
			stmt.executeBatch();
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

}
