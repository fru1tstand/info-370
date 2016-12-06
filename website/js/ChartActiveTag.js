/**
 * A simple javascript object object that's used to keep track of currently active tags.
 *
 * @param {Number} placeholderIndex
 */
function ChartActiveTag(placeholderIndex) {
	this.lastUpdateSliceNumber = -1;
	this.tagName = "";
	this.oldUsers = 0;
	this.newUsers = 0;

	this.placeholderIndex = placeholderIndex;
}
