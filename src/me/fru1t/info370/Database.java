package me.fru1t.info370;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class Database {
	public static final String CONNECTION_STRING = "jdbc:mysql://localhost/stackoverflow"
			+ "?user=root"
			+ "&rewriteBatchedStatements=true";
	
	private static Connection connection = null;
	
	public static Connection getConnection() throws SQLException {
		if (connection == null) {
			connection = DriverManager.getConnection(Database.CONNECTION_STRING);
		}
		return connection;
	}
	
	public static PreparedStatement prepareStatement(String query) throws SQLException {
		Connection c = getConnection();
		return c.prepareStatement(query);
	}
}
