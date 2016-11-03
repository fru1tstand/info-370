package me.fru1t.info370.tables;

/**
 * Represents a row from the User table. Example entries from the XML:
 * 
 * <row Id="823" Reputation="3747" CreationDate="2008-08-09T05:00:46.467" DisplayName="ryantm" LastAccessDate="2016-08-31T21:43:16.497" WebsiteUrl="http://www.ryantm.com" Location="United States" AboutMe="&lt;p&gt;I am a programmer and engineer.&lt;/p&gt;&#xA;" Views="227" UpVotes="381" DownVotes="21" Age="31" AccountId="630" />
 * <row Id="825" Reputation="83741" CreationDate="2008-08-09T05:18:45.103" DisplayName="Pat Notz" LastAccessDate="2015-03-02T20:48:56.050" WebsiteUrl="" Location="" AboutMe="" Views="1541" UpVotes="775" DownVotes="10" AccountId="631" />
 * <row Id="826" Reputation="7927" CreationDate="2008-08-09T05:24:54.297" DisplayName="Andrew" LastAccessDate="2016-08-23T08:44:13.043" WebsiteUrl="http://andrewlighten.com" Location="Central Victoria, Australia" AboutMe="Programmer. Photographer. Father of two. Life is good." Views="874" UpVotes="962" DownVotes="75" Age="49" AccountId="632" />
 * <row Id="828" Reputation="1528" CreationDate="2008-08-09T06:12:41.267" DisplayName="Matt Cummings" LastAccessDate="2016-04-26T19:35:33.023" WebsiteUrl="http://www.smurf.com/" Location="California" AboutMe="I'm a firm believer in the fact that you can make babies faster if you add more women.  F. Brooks is, obviously, a little confused about the topic of &quot;multi-threading.&quot;" Views="154" UpVotes="117" DownVotes="4" Age="43" AccountId="633" />
 * <row Id="829" Reputation="102" CreationDate="2008-08-09T06:18:18.320" DisplayName="SkullDuggerT" LastAccessDate="2009-02-12T20:52:12.817" WebsiteUrl="http://www.sharevis.com" Location="San Luis Obispo, CA" AboutMe="A developer working from home in the Central Coast of California." Views="24" UpVotes="29" DownVotes="0" Age="46" AccountId="634" />
 */
public class User {
	public String Id;
	public String Reputation;
	public String CreationDate;
	public String DisplayName;
	public String Location;
	public String Views;
	public String UpVotes;
	public String DownVotes;
	public String Age;
}
