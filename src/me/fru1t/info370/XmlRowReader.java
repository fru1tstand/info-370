package me.fru1t.info370;

import java.io.File;
import java.io.FileNotFoundException;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.eclipse.jdt.annotation.Nullable;

/**
 * Parses an XML file line by line, assuming a <row> tag exists per line of input.
 */
public class XmlRowReader<I> {
	private static final String XML_ATTRIBUTE_DELIMETER = "=";
	private static final String FILE_ENCODING = "UTF-8";
	private static final String ROW_START = "<row";
	private static final Pattern XML_DELIMETER = Pattern.compile("([a-zA-Z]+=\"[^\"]+\")");
	
	private Scanner fileScanner;
	private boolean isComplete;
	
	private Class<I> tableClass;
	private HashMap<String, Field> tableColumns;
	
	public XmlRowReader(String file, Class<I> rowClass) throws FileNotFoundException {
		fileScanner = new Scanner(new File(file), FILE_ENCODING);
		isComplete = false;
		this.tableClass = rowClass;

		// Use reflection to get all declared fields in the row class
		tableColumns = new HashMap<>();
		Field[] fields = rowClass.getDeclaredFields();
		for (Field field : fields) {
			tableColumns.put(field.getName(), field);
		}
	}
	
	/**
	 * Returns the next row of XML in the form of an instance of the given class. Returns null
	 * if the line isn't a row, or the file has been read through.
	 * 
	 * @return
	 */
	@Nullable
	public I next() {
		// Has the file been read through?
		if (isComplete || !fileScanner.hasNextLine()) {
			isComplete = true;
			System.out.println("Completed");
			return null;
		}
		
		// Get the next line
		String row = fileScanner.nextLine().trim();
		
		// Make sure the line is a row
		if (!row.substring(0, 4).equals(ROW_START)) {
			System.out.println("Skipped " + row);
			return null;
		}
		
		try {
			Matcher xmlMatcher = XML_DELIMETER.matcher(row);
			I result = tableClass.newInstance();
			
			while (xmlMatcher.find()) {
				String[] attrParts = xmlMatcher.group().split(XML_ATTRIBUTE_DELIMETER);
				
				if (tableColumns.containsKey(attrParts[0])) {
					// Set our result instance's field to the stuff between the quotes.
					tableColumns.get(attrParts[0]).set(result, attrParts[1].substring(1, attrParts[1].length() - 1));
				}
			}
			
			return result;
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		System.out.println("Failed to make instance of " + row);
		return null;
	}
	
	/**
	 * Returns if there are no more lines in the file to go through.
	 * 
	 * @return
	 */
	public boolean isComplete() {
		return isComplete;
	}
}
