/**
 * Contains the logic for the visualization.
 */
(function() {
	// Sanity check
	if (typeof ChartPlaceholder == 'undefined') {
		throw "ChartPlaceholder wasn't found and is a required dependency.";
	}
	if (typeof Node == 'undefined') {
		throw "Node wasn't found and is a require dependency.";
	}
	if (typeof data == 'undefined') {
		throw "No data was given";
	}


	// Constants
	// Adjustable params
	var COLORS = {
		OLD_USER: "#e0d400",
		NEW_USER: "#1c8af9"
	};
	var NODE_SIZE_PX = 3;

	// Fairly absolutely constants
	/**
	 * The total number of labels that will be present.
	 *
	 * @define {number}
	 */
	var NUM_PLACEHOLDERS = 16;

	/**
	 * The angle at which each sequential placeholder should be at.
	 *
	 * @define {number}
	 */
	var THETA = 2 * Math.PI / (NUM_PLACEHOLDERS - 1);

	/**
	 * The circle size used to create chart placeholders.
	 *
	 * @define {number}
	 */
	var CIRCLE_SIZE_PX = 340;

	/**
	 * @type {number}
	 */
	var VIS_PADDING_PX = 1;

	/** @define {number} */
	var VIS_WIDTH_PX = 780;
	/** @define {number} */
	var VIS_HEIGHT_PX = 800;

	/** @define {number} */
	var VIS_CENTER_FOCUS_X = 380;
	/** @define {number} */
	var VIS_CENTER_FOCUS_Y = 365;

	var VIS_CENTER_PLACEHOLDER_INDEX = 0;
	var VIS_CENTER_PLACEHOLDER_NAME = "other";


	// Temporary variables
	var i = 0, j = 0;


	// Create chart placeholders
	/** @type {ChartPlaceholder[]} */
	var chartPlaceholders = [];

	// Define the center placeholder
	chartPlaceholders[VIS_CENTER_PLACEHOLDER_INDEX] = new ChartPlaceholder(
			VIS_CENTER_PLACEHOLDER_INDEX,
			VIS_CENTER_FOCUS_X,
			VIS_CENTER_FOCUS_Y
	);
	/** @type {ChartPlaceholder} */
	var VIS_CENTER_PLACEHOLDER = chartPlaceholders[VIS_CENTER_PLACEHOLDER_INDEX];
	VIS_CENTER_PLACEHOLDER.setIncomingNodeCallback(function(/** @type {!Node} */ node) {
		// When a node is heading to the center, we want to opacity to reach 0.
		node.targetOpacity = 0;
	});
	VIS_CENTER_PLACEHOLDER.setDisplayString(VIS_CENTER_PLACEHOLDER_NAME);

	// Define the rest of the placeholders
	for (i = 1; i < NUM_PLACEHOLDERS; i++) {
		chartPlaceholders[i] = new ChartPlaceholder(
				i,
				CIRCLE_SIZE_PX * Math.cos(i * THETA) + VIS_CENTER_FOCUS_X,
				CIRCLE_SIZE_PX * Math.sin(i * THETA) + VIS_CENTER_FOCUS_Y);
		chartPlaceholders[i].setIncomingNodeCallback(function(/** @type {!Node} */ node) {
			// When a node is heading out to any other tag, we want the opacity to reach 1.
			node.targetOpacity = 1;
		});
	}


	// D3 initialization logic
	// Creates an SVG in the DOM
	var svg = d3.select("#chart").append("svg")
			.attr("width", VIS_WIDTH_PX)
			.attr("height", VIS_HEIGHT_PX);

	// Creates a D3 force layout that helps with the animation and collisions
	d3.layout.force()
			.size([VIS_WIDTH_PX, VIS_HEIGHT_PX])
			.gravity(0)
			.charge(0)
			.friction(.9)
			.on("tick", tick)
			.start();

	/**
	 * Holds the currently displaying tag in an object mapped from "tagName" => ChartActiveTag objects.
	 *
	 * @type {Object.<string, ChartActiveTag>}
	 */
	var currentSlice = { };

	// Fill out current slice information with "other" and filler.
	currentSlice[VIS_CENTER_PLACEHOLDER_NAME] = new ChartActiveTag(VIS_CENTER_PLACEHOLDER_INDEX);
	currentSlice[VIS_CENTER_PLACEHOLDER_NAME].tagName = VIS_CENTER_PLACEHOLDER_NAME;
	for (i = 1; i < NUM_PLACEHOLDERS; i++) {
		// This i value is very important as it is what dictates which placeholder the tag will display on.
		currentSlice[i] = new ChartActiveTag(i);
	}

	// Is and always will hold references to all nodes
	var nodes = svg.selectAll("circle");
	var nodesData = [];

	// Add text onto the SVG
	var labels = svg.selectAll("text")
			.data(chartPlaceholders)
			.enter()
			.append("text")
			.attr("class", "tag-label")
			.attr("x", function(chartPlaceholder) {
				if (chartPlaceholder.getIndex() == VIS_CENTER_PLACEHOLDER_INDEX) {
					return VIS_CENTER_FOCUS_X;
				}
				return CIRCLE_SIZE_PX * Math.cos(chartPlaceholder.getIndex() * THETA) + VIS_CENTER_FOCUS_X;
			})
			.attr("y", function(chartPlaceholder) {
				if (chartPlaceholder.getIndex() == VIS_CENTER_PLACEHOLDER_INDEX) {
					return VIS_CENTER_FOCUS_Y;
				}
				return CIRCLE_SIZE_PX * Math.sin(chartPlaceholder.getIndex() * THETA) + VIS_CENTER_FOCUS_Y;
			});
	labels.append("tspan")
			.attr("x", function() { return d3.select(this.parentNode).attr("x"); })
			.attr("text-anchor", "middle")
			.text("Test");


	// Helper functions for core logic
	/**
	 * Performs the given function for each active node.
	 *
	 * @param {!function(Node)} callable
	 */
	function forAllActiveNodes(callable) {
		chartPlaceholders.forEach(function(placeholder) {
			placeholder.getOldUserNodes().forEach(function(node) {
				callable(node);
			});
			placeholder.getNewUserNodes().forEach(function(node) {
				callable(node);
			})
		});
	}

	/**
	 * Performs an update operation on the currently displaying data, given a new slice.
	 * @param {Number} sliceNumber
	 */
	function updateSlice(sliceNumber) {
		var newSlice = data[sliceNumber];
		/** @type {!ChartActiveTag[]} */
		var newTags = [];
		var tagName = "";

		// Check and update existing tags
		for (tagName in newSlice) {
			if (!newSlice.hasOwnProperty(tagName)) {
				continue;
			}

			var tagToUpdate = null;
			if (tagName in currentSlice) {
				// Simply fetch the tag to update if it exists
				tagToUpdate = currentSlice[tagName]
			} else {
				// Create a new tag, and add it to the queue
				tagToUpdate = new ChartActiveTag(-1);
				newTags.push(tagToUpdate);
			}

			// Perform the updates
			tagToUpdate.lastUpdateSliceNumber = sliceNumber;
			tagToUpdate.oldUsers = newSlice[tagName].old;
			tagToUpdate.newUsers = newSlice[tagName].new;
			tagToUpdate.tagName = tagName;
		}

		// Check for old tags and while we're at it, update the chart placeholders
		for (tagName in currentSlice) {
			if (!currentSlice.hasOwnProperty(tagName)) {
				continue;
			}

			var currentTagToUpdate = currentSlice[tagName];
			var placeholder = chartPlaceholders[currentTagToUpdate.placeholderIndex];

			// If the tag is old, swap it with a queued new tag
			if (currentSlice[tagName].lastUpdateSliceNumber != sliceNumber) {
				var nextNewTag = /** @type {ChartActiveTag} */ newTags.pop();
				// Make sure to swap over that placeholder index to keep it in order!!!
				nextNewTag.placeholderIndex = currentTagToUpdate.placeholderIndex;

				delete currentSlice[tagName];
				currentSlice[nextNewTag.tagName] = nextNewTag;
				currentTagToUpdate = nextNewTag;

				// Update the name
				placeholder.setDisplayString(currentTagToUpdate.tagName);
			}

			// Add or remove nodes in the underlying data structure first
			var oldUserDelta = currentTagToUpdate.oldUsers - placeholder.getOldUserNodesCount();
			var newUserDelta = currentTagToUpdate.newUsers - placeholder.getNewUserNodesCount();
			var newNodes = [];

			// Deal with old users
			if (oldUserDelta > 0) {
				// Simply create old user nodes that start from the center
				newNodes = [];
				for (j = 0; j < oldUserDelta; j++) {
					newNodes.push(new Node(
							VIS_CENTER_PLACEHOLDER.getFocusPointX(),
							VIS_CENTER_PLACEHOLDER.getFocusPointY(),
							COLORS.OLD_USER,
							NODE_SIZE_PX));
				}
				placeholder.addOldUserNodes(newNodes);
			} else if (oldUserDelta < 0) {
				// Remove old user nodes from the placeholder and put them into the center
				VIS_CENTER_PLACEHOLDER.addOldUserNodes(placeholder.removeOldUserNodes(Math.abs(oldUserDelta)));
			}

			// Deal with new users
			if (newUserDelta > 0) {
				// Simply create new nodes that start from the center
				newNodes = [];
				for (j = 0; j < newUserDelta; j++) {
					newNodes.push(new Node(
							VIS_CENTER_PLACEHOLDER.getFocusPointX(),
							VIS_CENTER_PLACEHOLDER.getFocusPointY(),
							COLORS.NEW_USER,
							NODE_SIZE_PX));
				}
				placeholder.addNewUserNodes(newNodes);
			} else if (newUserDelta < 0) {
				// Remove new user nodes from the placeholder and put them into the center
				VIS_CENTER_PLACEHOLDER.addNewUserNodes(placeholder.removeNewUserNodes(Math.abs(newUserDelta)));
			}
		}


		// Update the nodes on the vis
		// First, remove nodes that we can't see from 'other'
		VIS_CENTER_PLACEHOLDER.purgeHiddenNodes();

		// Then grab a list of all active nodes from the chart placeholders
		var allNodes = [];
		forAllActiveNodes(function(node) {
			allNodes.push(node);
		});

		// Then we call #exit() on d3 which removes the nodes that should go away
		svg.selectAll("circle").data(allNodes).exit().remove();

		// Then we call #enter and introduce the new nodes that should appear
		svg.selectAll("circle") // Get all existing circles
				.data(allNodes) // Merge them with the underlying data
				.enter() // Select the ones that don't exist in the vis
				.append("circle") // Add the <circle> tag
				.attr("r", function(node) { return node.radius; }) // Set its size
				.style("fill", function(node) { return node.color; }); // And color

		// Then we update the nodes global variable for use later
		nodes = svg.selectAll("circle");
		nodesData = allNodes;

		// Update the labels on the board
		svg.selectAll("text")
				.data(chartPlaceholders)
				.select("tspan")
				.text(function(chartPlaceholder) {
					return chartPlaceholder.getDisplayString();
				});
	}

	/**
	 * This function is called every animation frame to move the nodes and perform collision calculations.
	 *
	 * @param e
	 */
	function tick(e) {
		var delta = 0.04 * e.alpha;

		forAllActiveNodes(function(/** @type {!Node} */ node) {
			node.x += (node.target.x - node.x) * delta;
			node.y += (node.target.y - node.y) * delta;

			if (node.opacity != node.targetOpacity) {
				node.opacity += (node.targetOpacity - node.opacity) * delta;
			}
		});

		nodes
				.each(collide(.5))
				.style("fill", function(node) { return node.color; })
				.style("opacity", function(node) { return node.opacity; })
				.attr("cx", function(node) { return node.x; })
				.attr("cy", function(node) { return node.y; });
	}

	/**
	 * Magic. Copied from souirce.
	 * @param alpha
	 * @returns {Function}
	 */
	function collide(alpha) {
		var quadtree = d3.geom.quadtree(nodesData);
		return function(d) {
			var r = d.radius + NODE_SIZE_PX + VIS_PADDING_PX,
					nx1 = d.x - r,
					nx2 = d.x + r,
					ny1 = d.y - r,
					ny2 = d.y + r;
			quadtree.visit(function (quad, x1, y1, x2, y2) {
				if (quad.point && (quad.point !== d)) {
					var x = d.x - quad.point.x,
							y = d.y - quad.point.y,
							l = Math.sqrt(x * x + y * y),
							r = d.radius + quad.point.radius + (d.act !== quad.point.act) * VIS_PADDING_PX;
					if (l < r) {
						l = (l - r) / l * alpha;
						d.x -= x *= l;
						d.y -= y *= l;
						quad.point.x += x;
						quad.point.y += y;
					}
				}
				return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			});
		}
	}


	// Vis controls
	var isAutomaticallyPlaying = true;
	var currentSliceIndex = 0;
	var maxDebugTicks = 5;
	function doNextStep() {
		if (!isAutomaticallyPlaying || currentSliceIndex > maxDebugTicks) {
			return;
		}
		updateSlice(currentSliceIndex++);
		if (currentSliceIndex > data.length) {
			currentSliceIndex = 0;
		}

		setTimeout(doNextStep, 5000);
	}
	doNextStep();
} ());
