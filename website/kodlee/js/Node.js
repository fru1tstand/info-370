/**
 * Represents a single dot on the visualization. Get it? Node JS? hahaha I'm sorry...
 *
 * @param {Number} x The starting x coordinate for this node.
 * @param {Number} y The starting y coordinate for this node.
 * @param {string} color The hex color this node should be.
 * @param {Number} radius The size of this node.
 * @constructor
 */
function Node(x, y, color, radius) {
	/**
	 * @type {Number}
	 */
	this.x = x;

	/**
	 * @type {Number}
	 */
	this.y = y;

	/**
	 * @type {string}
	 */
	this.color = color;

	/**
	 * @type {Number}
	 */
	this.radius = radius;

	/**
	 * @type {{x: Number, y: Number}}
	 */
	this.target = {
		x: 0,
		y: 0
	};

	/**
	 * @type {Number}
	 */
	this.targetOpacity = 0;

	/** @type {Number} */
	this.opacity = 0;
}
