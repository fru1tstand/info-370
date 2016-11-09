package me.fru1t.info370.database;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Date;

import me.fru1t.info370.Boot;
import me.fru1t.info370.converters.PostPartialToTagConverter;
import me.fru1t.util.DatabaseConnectionPool.Statement;
import me.fru1t.util.SizedStack;

public class StoredProcedures {
	/**
	 * 1 in_post_id INT(11)
	 * 2 in_tag_name VARCHAR(128)
	 */
	private static final String USP_ADD_TAG_TO_POST =
			"{CALL usp_add_tag_to_post(?,?)}";

	private static final int TAG_TO_POST_COMMIT_THRESHOLD = 20000;
	private static final int TOTAL_POSTS = 32199364;
	private static final int COMMIT_PERFORMANCE_HISTORY_SIZE = 100;
	private static SizedStack<Long> performanceHistory = null;
	private static int completedPosts = 0;
	private static int counter = 0;
	private static CallableStatement stmt = null;
	private static long lastCommitTime = 0;
	public static synchronized void addTagToPost(PostPartialToTagConverter.PostPartialConverted processedObject)
			throws InterruptedException {
		Boot.getDatabaseConnectionPool().executeStatement(new Statement() {
			@Override
			public void execute(Connection c) throws SQLException {
				if (stmt == null) {
					stmt = c.prepareCall(USP_ADD_TAG_TO_POST);
					lastCommitTime = (new Date()).getTime();
					performanceHistory = new SizedStack<Long>(Long.class, COMMIT_PERFORMANCE_HISTORY_SIZE);
				}
				completedPosts++;
				for (String tag : processedObject.tags) {
					stmt.setInt(1, processedObject.postId);
					stmt.setString(2, tag);
					stmt.addBatch();
					counter++;
				}

				if (counter > TAG_TO_POST_COMMIT_THRESHOLD) {
					flushTagsToPost();
				}
			}
		});
	}
	public static void flushTagsToPost() throws SQLException {
		stmt.executeBatch();
		counter = 0;
		long thisCommitTime = (new Date()).getTime();
		long performance = thisCommitTime - lastCommitTime;
		performanceHistory.add(performance);
		long avg = getAveragePerformanceHistory();
		int remainingPosts = TOTAL_POSTS - completedPosts;
		double msPerPost = avg * 1.0 / TAG_TO_POST_COMMIT_THRESHOLD;
		lastCommitTime = thisCommitTime;
		Boot.getLogger().log("Commit time: " + performance
				+ "ms; Avg commit time: " + avg
				+ "ms; Completed: " + completedPosts
				+ " of " + TOTAL_POSTS
				+ " (" + getPercent(completedPosts, TOTAL_POSTS, 4)
				+ ") posts; Time remaining: " + timeLeft(msPerPost * remainingPosts));
	}
	
	private static long getAveragePerformanceHistory() {
		long result = 0;
		for (Long i : performanceHistory.getElements()) {
			result += i;
		}
		return (result/performanceHistory.size());
	}
	
	private static String getPercent(int numerator, int denominator, int decimals) {
		return (Math.round(numerator * 100.0 * Math.pow(10, decimals) / denominator) / Math.pow(10, decimals)) + "%";
	}
	private static String timeLeft(double ms) {
		int secs = (int) ms / 1000;
		int mins = (int) secs / 60;
		secs -= mins * 60;
		int hours = (int) mins / 60;
		mins -= hours * 60;
		return hours + ":" + ((mins < 10) ? "0" : "") + mins + ":" + ((secs < 10) ? "0" : "") + secs;
	}
}
