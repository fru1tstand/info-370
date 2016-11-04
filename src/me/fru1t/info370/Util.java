package me.fru1t.info370;

import java.text.ParseException;
import java.text.SimpleDateFormat;

public class Util {
	public static final SimpleDateFormat STACK_OVERFLOW_DATE_FORMAT =
			new SimpleDateFormat("yyyy-MM-dd kk:mm:ss.SSS");
	
	
	public static String stringOrDefault(String in, String def) {
		return (in == null) ? def : in;
	}
	
	/**
	 * Parses a given int from a string, defaulting to def when null is passed.
	 * 
	 * @param in
	 * @param def
	 * @return
	 */
	public static int pi(String in, int def) {
		return (in == null) ? def : Integer.parseInt(in);
	}
	
	/**
	 * Returns a unix timestamp from the given stackoverflow string. Or -1 if null or an error occured.
	 * 
	 * @param datetime
	 * @return
	 */
	public static int getUnixDate(String datetime) {
		// Do a little formatting
		if (datetime == null) {
			return -1;
		}
		
		try {
			return (int) (STACK_OVERFLOW_DATE_FORMAT.parse(datetime.replace("T", " ")).getTime() / 1000);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return -1;
	}
}
