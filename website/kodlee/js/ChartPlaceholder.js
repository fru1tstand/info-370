/**
 * Defines a chart placeholder (what will control nodes [dots], and text displayed on the visualisation).
 *
 * @param {Number} index The index number of this chart placeholder.
 * @param {Number} focusPointX
 * @param {Number} focusPointY
 * @constructor
 */
function ChartPlaceholder(index, focusPointX, focusPointY) {
	var CHART_PLACEHOLDER_ID_PREFIX = "chart-placeholder-";

	/**
	 * Holds a reference to this chart placeholder's index number.
	 *
	 * @type {Number}
	 * @private
	 */
	this.index_ = index;

	/**
	 * A callback that is executed for every node passed to add*UserNode().
	 *
	 * @type {?function(!Node)}
	 */
	this.incomingNodeCallback_ = null;

	/**
	 * Stores the center point of this placeholder.
	 *
	 * @type {!{x: Number, y: Number}}
	 * @private
	 */
	this.focusPoint_ = {
		/** @type {Number} */
		x: focusPointX,

		/** @type {Number} */
		y: focusPointY
	};

	/**
	 * What this placeholder should display.
	 *
	 * @type {string}
	 * @private
	 */
	this.displayString_ = "";

	/**
	 * The nodes that belong to this placeholder.
	 *
	 * @type {!Node[]}
	 * @private
	 */
	this.oldUserNodes_ = [];

	/**
	 * The nodes that belong to this placeholder.
	 *
	 * @type {!Node[]}
	 * @private
	 */
	this.newUserNodes_ = [];


	/**
	 * Gets this chart placeholder's index number.
	 *
	 * @returns {Number}
	 */
	this.getIndex = function() {
		return this.index_;
	};

	/**
	 * Gets this chart placeholder's string to render.
	 *
	 * @returns {string}
	 */
	this.getDisplayString = function() {
		return this.displayString_;
	};

	/**
	 * Updates this chart placeholder's display string.
	 *
	 * @param {string} displayString
	 */
	this.setDisplayString = function(displayString) {
		this.displayString_ = displayString;
	};

	/**
	 * Returns this placeholder's old user nodes.
	 *
	 * @returns {!Node[]}
	 */
	this.getOldUserNodes = function() {
		return this.oldUserNodes_;
	};

	/**
	 * Returns this placeholder's new user nodes.
	 *
	 * @returns {!Node[]}
	 */
	this.getNewUserNodes = function() {
		return this.newUserNodes_;
	};

	/**
	 * Returns the number of new user nodes this chart placeholder currently owns.
	 *
	 * @returns {Number}
	 */
	this.getNewUserNodesCount = function() {
		return this.newUserNodes_.length;
	};

	/**
	 * Returns the number of old user nodes this chart placeholder currently owns.
	 *
	 * @returns {Number}
	 */
	this.getOldUserNodesCount = function() {
		return this.oldUserNodes_.length;
	};

	/**
	 * Adds the given node objects to this chart placement's new user nodes list.
	 *
	 * @param {!Node[]} nodes
	 */
	this.addNewUserNodes = function(nodes) {
		console.log("Adding a node to " + this.displayString_);
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].target = this.focusPoint_;
			if (!!this.incomingNodeCallback_) {
				this.incomingNodeCallback_(nodes[i]);
			}
			this.newUserNodes_.push(nodes[i]);
		}
	};

	/**
	 * Adds the given nodes objects to this chart placement's old user nodes list.
	 * @param {!Node[]} nodes
	 */
	this.addOldUserNodes = function(nodes) {
		console.log("Adding a node to " + this.displayString_);
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].target = this.focusPoint_;
			if (!!this.incomingNodeCallback_) {
				this.incomingNodeCallback_(nodes[i]);
			}
			this.oldUserNodes_.push(nodes[i]);
		}
	};

	/**
	 * Removes and returns the given number of new user nodes from this chart placeholder.
	 *
	 * @param numberToRemove
	 * @returns {!Node[]}
	 */
	this.removeNewUserNodes = function(numberToRemove) {
		console.log("Removing a node to " + this.displayString_ + "; " + numberToRemove);
		numberToRemove = (numberToRemove > this.getNewUserNodesCount()) ? this.getNewUserNodesCount() : numberToRemove;
		var result = this.newUserNodes_.slice(0, numberToRemove);
		this.newUserNodes_ = this.newUserNodes_.slice(numberToRemove);
		return result;
	};

	/**
	 * Removes and returns the given number of old user nodes form this chart placeholder.
	 *
	 * @param numberToRemove
	 * @returns {!Node[]}
	 */
	this.removeOldUserNodes = function(numberToRemove) {
		console.log("Removing a node to " + this.displayString_ + "; " + numberToRemove);
		numberToRemove = (numberToRemove > this.getOldUserNodesCount()) ? this.getOldUserNodesCount() : numberToRemove;
		var result = this.oldUserNodes_.slice(0, numberToRemove);
		this.oldUserNodes_ = this.oldUserNodes_.slice(numberToRemove);
		return result;
	};

	/**
	 * @returns {Number}
	 */
	this.getFocusPointX = function() {
		return this.focusPoint_.x;
	};

	/**
	 * @returns {Number}
	 */
	this.getFocusPointY = function() {
		return this.focusPoint_.y;
	};

	/**
	 * Sets a function to be called for every node that is added to this placeholder.
	 *
	 * @param {?function(!Node)} callback
	 */
	this.setIncomingNodeCallback = function(callback) {
		this.incomingNodeCallback_ = callback;
	};

	/**
	 * Removes all nodes that can't be seen (eg. Opacity: 0)
	 */
	this.purgeHiddenNodes = function() {
		var result = [];
		this.newUserNodes_.forEach(function(node) {
			if (node.opacity != 0) {
				result.append(node);
			}
		});
		this.newUserNodes_ = result;

		result = [];
		this.oldUserNodes_.forEach(function(node) {
			if (node.opacity != 0) {
				result.append(node);
			}
		});
		this.oldUserNodes_ = result;
	}
}
