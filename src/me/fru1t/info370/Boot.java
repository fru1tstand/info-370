package me.fru1t.info370;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Date;

import me.fru1t.info370.converters.PostPartialToTagConverter;
import me.fru1t.info370.database.StoredProcedures;
import me.fru1t.info370.database.producers.PostPartialProducer;
import me.fru1t.info370.database.producers.PostPartialProducer.PostPartial;
import me.fru1t.info370.processes.ConvertProcess;
import me.fru1t.util.DatabaseConnectionPool;
import me.fru1t.util.Logger;

public class Boot {
	private static final String LOCAL_SQL_CONNECTION_STRING =
			"jdbc:mysql://localhost/stackoverflow"
			+ "?user=root"
			+ "&rewriteBatchedStatements=true";
	private static DatabaseConnectionPool dbcp = null;
	private static Logger logger = null;
	
	public static void main(String[] args) throws SQLException {
		// This was used to add users to the database
		// (new UserProcess()).run();
		//
		// This was used to add the posts to the database
		// (new PostProcess()).run();
		
		// Now we sanitize the tags for each post and normalize them in the database
		(new ConvertProcess<PostPartial>(
				new PostPartialProducer(),
				new PostPartialToTagConverter())).run();
		StoredProcedures.flushTagsToPost();
	}
	
	public static DatabaseConnectionPool getDatabaseConnectionPool() {
		if (dbcp == null) {
			dbcp = new DatabaseConnectionPool(LOCAL_SQL_CONNECTION_STRING, getLogger());
		}
		return dbcp;
	}
	
	public static Logger getLogger() {
		if (logger == null) {
			logger = new Logger();
			try {
				logger.logToFile(Long.toString((new Date()).getTime()), ".log");
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return logger;
	}
}
