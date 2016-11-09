package me.fru1t.info370.processes;

import java.sql.PreparedStatement;

import me.fru1t.info370.Database;
import me.fru1t.info370.XmlRowReader;
import me.fru1t.info370.tables.User;

public class UserProcess implements Runnable {
	private static final String USER_XML_FILE_LOCATION =
			"D:\\stack\\stackoverflow\\stackoverflow.com-Users\\Users.xml";

	@Override
	public void run() {
		try {
			PreparedStatement stmt = Database.prepareStatement(User.MYSQL_INSERT);
			long rows = 0;
			
			XmlRowReader<User> reader = new XmlRowReader<User>(USER_XML_FILE_LOCATION, User.class);
			while (!reader.isComplete()) {
				User u = reader.next();
				if (u != null) {
					
					try {
						stmt.setInt(User.COLUMN_ID, u.getId());
					} catch (NumberFormatException e) {
						e.printStackTrace();
						continue;
					}
					
					stmt.setInt(User.COLUMN_REPUTATION, u.getReputation());
					stmt.setInt(User.COLUMN_CREATION_DATE, u.getCreationDate());
					stmt.setString(User.COLUMN_DISPLAY_NAME, u.getDisplayName());
					stmt.setString(User.COLUMN_LOCATION, u.getLocation());
					stmt.setInt(User.COLUMN_VIEWS, u.getViews());
					stmt.setInt(User.COLUMN_UPVOTES, u.getUpVotes());
					stmt.setInt(User.COLUMN_DOWNVOTES, u.getDownVotes());
					stmt.setInt(User.COLUMN_AGE, u.getAge());
					stmt.addBatch();
					
					if (rows++ % 20000 == 0) {
						System.out.println("Commiting row " + rows);
						stmt.executeBatch();
					}
				}
			}
			
			System.out.println("Final commit at row " + rows);
			stmt.executeBatch();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
