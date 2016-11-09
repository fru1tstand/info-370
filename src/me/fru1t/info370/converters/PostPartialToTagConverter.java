package me.fru1t.info370.converters;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import me.fru1t.info370.Boot;
import me.fru1t.info370.database.StoredProcedures;
import me.fru1t.info370.database.producers.PostPartialProducer;
import me.fru1t.util.Consumer;

/**
 * Decompresses tags from PostPartial objects into an array as a PostPartialConverted object.
 */
public class PostPartialToTagConverter extends Consumer<PostPartialProducer.PostPartial> {
	public static class PostPartialConverted {
		public int postId;
		public ArrayList<String> tags;
		
		public PostPartialConverted(int postId) {
			this.postId = postId;
			tags = new ArrayList<>();
		}
	}
	
	private static final Pattern TAG_PATTERN = Pattern.compile("&lt;([^&]+)&gt;");
	
	@Override
	public void eat(PostPartialProducer.PostPartial food) {
		PostPartialConverted result = new PostPartialConverted(food.id);
		if (food.tags == null) {
			return;
		}
		Matcher m = TAG_PATTERN.matcher(food.tags);
		while (m.find()) {
			result.tags.add(m.group(1));
		}
		try {
			StoredProcedures.addTagToPost(result);
		} catch (InterruptedException e) {
			Boot.getLogger().log(e);
		}
	}
}
