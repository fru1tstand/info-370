package me.fru1t.info370;

import java.io.FileNotFoundException;

import me.fru1t.info370.tables.User;

public class Boot {
	public static void main(String[] args) throws FileNotFoundException {
		XmlRowReader<User> reader = new XmlRowReader<User>("D:\\stack\\stackoverflow\\stackoverflow.com-Users\\Users.xml", User.class);
		while (!reader.isComplete()) {
			User u = reader.next();
			if (u != null) {

				System.out.println(u.toString());
			}
		}
	}
}
