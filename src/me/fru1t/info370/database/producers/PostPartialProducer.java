package me.fru1t.info370.database.producers;

import me.fru1t.info370.Boot;
import me.fru1t.util.concurrent.DatabaseProducer;

public class PostPartialProducer extends DatabaseProducer<PostPartialProducer.PostPartial, Integer> {
	/**
	 * A partial collection of columns from the Post table.
	 */
	public static class PostPartial extends DatabaseProducer.Row<Integer> {
		public static final String COLUMN_TAGS = "tags";
		
		/** VARCHAR(128) */
		public String tags;
	}

	public static final int DEFAULT_BUFFER_SIZE = 10000;
	private static final String ID_COLUMN_NAME = "`post`.`id`";
	private static final String QUERY_BASE =
			"SELECT"
			+ " `id` AS `" + PostPartial.COLUMN_ID
			+ "`, `tags` AS `" + PostPartial.COLUMN_TAGS
			+ "` FROM `post` "
			+ "WHERE 1 = 1 ";

	public PostPartialProducer() {
		super(ID_COLUMN_NAME, PostPartial.class, Boot.getDatabaseConnectionPool(),
				DEFAULT_BUFFER_SIZE, Boot.getLogger());
	}

	@Override
	protected String getUnboundedQuery() {
		return QUERY_BASE;
	}
}
