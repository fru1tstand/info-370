package me.fru1t.info370;

public class Util {
	public static String stringOrDefault(String in, String def) {
		return (in == null) ? def : in;
	}
	
	public static int intOrDefault(String in, int def) {
		return (in == null) ? def : Integer.parseInt(in);
	}
}
