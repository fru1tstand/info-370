/**
 * Contains the logic for the visualization.
 */
(function() {
	var data = data2;

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
	var NODE_PADDING_PX = 1;

	var VIS_WIDTH_PX = 850;
	var VIS_HEIGHT_PX = 800;
	var VIS_CIRCLE_SIZE_PX = 340;

	var CENTER_FOCUS_X = VIS_WIDTH_PX / 2;
	var CENTER_FOCUS_Y = VIS_HEIGHT_PX / 2;

	var NODE_SPEED_SCALE = 0.4;

	/** Used when creating new nodes, so that they're not all centered and aligned.
	 * Makes for a more appealing aniamtion */
	var NODE_START_FUDGE_FACTOR_PX = 10;

	// Fairly absolutely constants
	var NUM_PLACEHOLDERS = 16;
	var THETA = 2 * Math.PI / (NUM_PLACEHOLDERS - 1);

	var CENTER_PLACEHOLDER_INDEX = 0;
	var CENTER_PLACEHOLDER_NAME = "StackOverflow";


	// Temporary variables
	var i = 0, j = 0;


	// Create chart placeholders
	/** @type {ChartPlaceholder[]} */
	var chartPlaceholders = [];

	// Define the center placeholder
	chartPlaceholders[CENTER_PLACEHOLDER_INDEX] = new ChartPlaceholder(
			CENTER_PLACEHOLDER_INDEX,
			CENTER_FOCUS_X,
			CENTER_FOCUS_Y
	);
	/** @type {ChartPlaceholder} */
	var VIS_CENTER_PLACEHOLDER = chartPlaceholders[CENTER_PLACEHOLDER_INDEX];
	VIS_CENTER_PLACEHOLDER.setIncomingNodeCallback(function(/** @type {!Node} */ node) {
		// When a node is heading to the center, we want to opacity to reach 0.
		node.targetOpacity = 0;
	});
	VIS_CENTER_PLACEHOLDER.setDisplayString(CENTER_PLACEHOLDER_NAME);

	// Define the rest of the placeholders
	for (i = 1; i < NUM_PLACEHOLDERS; i++) {
		chartPlaceholders[i] = new ChartPlaceholder(
				i,
				VIS_CIRCLE_SIZE_PX * Math.cos(i * THETA) + CENTER_FOCUS_X,
				VIS_CIRCLE_SIZE_PX * Math.sin(i * THETA) + CENTER_FOCUS_Y);
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

	var nodesLayer = svg.append('g');
	var textLayer = svg.append('g');

	// Creates a D3 force layout that helps with the animation and collisions
	var force = d3.layout.force()
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
	currentSlice[CENTER_PLACEHOLDER_NAME] = new ChartActiveTag(CENTER_PLACEHOLDER_INDEX);
	currentSlice[CENTER_PLACEHOLDER_NAME].tagName = CENTER_PLACEHOLDER_NAME;
	for (i = 1; i < NUM_PLACEHOLDERS; i++) {
		// This i value is very important as it is what dictates which placeholder the tag will display on.
		currentSlice[i] = new ChartActiveTag(i);
	}

	// Is and always will hold references to all nodes
	var nodes = nodesLayer.selectAll("circle");
	var nodesData = [];

	// Add text onto the SVG
	var labels = textLayer.selectAll("text")
			.data(chartPlaceholders)
			.enter()
			.append("text")
			.attr("class", "tag-label")
			.attr("x", function(chartPlaceholder) {
				if (chartPlaceholder.getIndex() == CENTER_PLACEHOLDER_INDEX) {
					return CENTER_FOCUS_X;
				}
				return VIS_CIRCLE_SIZE_PX * Math.cos(chartPlaceholder.getIndex() * THETA) + CENTER_FOCUS_X;
			})
			.attr("y", function(chartPlaceholder) {
				if (chartPlaceholder.getIndex() == CENTER_PLACEHOLDER_INDEX) {
					return CENTER_FOCUS_Y;
				}
				return VIS_CIRCLE_SIZE_PX * Math.sin(chartPlaceholder.getIndex() * THETA) + CENTER_FOCUS_Y;
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

		// fake update other
		currentSlice[CENTER_PLACEHOLDER_NAME].lastUpdateSliceNumber = sliceNumber;

		// Check for old tags and while we're at it, update the chart placeholders
		for (tagName in currentSlice) {
			if (!currentSlice.hasOwnProperty(tagName)) {
				continue;
			}

			var currentTagToUpdate = currentSlice[tagName];
			var placeholder = chartPlaceholders[currentTagToUpdate.placeholderIndex];

			// If the tag is old, swap it with a queued new tag
			if (currentSlice[tagName].lastUpdateSliceNumber != sliceNumber && newTags.length != 0) {
				var nextNewTag = /** @type {ChartActiveTag} */ newTags.pop();
				// Make sure to swap over that placeholder index to keep it in order!!!
				nextNewTag.placeholderIndex = currentTagToUpdate.placeholderIndex;

				delete currentSlice[tagName];
				currentSlice[nextNewTag.tagName] = nextNewTag;
				currentTagToUpdate = nextNewTag;

				// Update the name
				placeholder.setDisplayString(currentTagToUpdate.tagName);

				// Return our users from whence they came from
				VIS_CENTER_PLACEHOLDER
						.addOldUserNodes(placeholder.removeOldUserNodes(placeholder.getOldUserNodesCount()));
				VIS_CENTER_PLACEHOLDER
						.addNewUserNodes(placeholder.removeNewUserNodes(placeholder.getNewUserNodesCount()));
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
							VIS_CENTER_PLACEHOLDER.getFocusPointX() + Math.random() * NODE_START_FUDGE_FACTOR_PX,
							VIS_CENTER_PLACEHOLDER.getFocusPointY() + Math.random() * NODE_START_FUDGE_FACTOR_PX,
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
							VIS_CENTER_PLACEHOLDER.getFocusPointX() + Math.random() * NODE_START_FUDGE_FACTOR_PX,
							VIS_CENTER_PLACEHOLDER.getFocusPointY() + Math.random() * NODE_START_FUDGE_FACTOR_PX,
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
		nodesLayer.selectAll("circle").data(allNodes).exit().remove();

		// Then we call #enter and introduce the new nodes that should appear
		nodesLayer.selectAll("circle") // Get all existing circles
				.data(allNodes) // Merge them with the underlying data
				.enter() // Select the ones that don't exist in the vis
				.append("circle") // Add the <circle> tag
				.attr("r", function(node) { return node.radius; }) // Set its size
				.style("fill", function(node) { return node.color; }); // And color

		// Then we update the nodes global variable for use later
		nodes = nodesLayer.selectAll("circle");
		nodesData = allNodes;

		// Update the labels on the board
		textLayer.selectAll("text")
				.data(chartPlaceholders)
				.select("tspan")
				.text(function(chartPlaceholder) {
					return chartPlaceholder.getDisplayString();
				});
	}

	/**
	 * This function is called every animation frame to move the nodes and perform collision calculations.
	 */
	function tick(e) {
		var delta = NODE_SPEED_SCALE * e.alpha;
		var x, y;

		forAllActiveNodes(function(/** @type {!Node} */ node) {
			x = node.x + (node.target.x - node.x) * (delta );
			y = node.y + (node.target.y - node.y) * (delta );
			node.x = (isNaN(x) ? node.x : x);
			node.y = (isNaN(y) ? node.y : y);
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
			var r = d.radius + NODE_SIZE_PX + NODE_PADDING_PX,
					nx1 = d.x - r,
					nx2 = d.x + r,
					ny1 = d.y - r,
					ny2 = d.y + r;
			quadtree.visit(function (quad, x1, y1, x2, y2) {
				if (quad.point && (quad.point !== d)) {
					var x = d.x - quad.point.x,
							y = d.y - quad.point.y,
							l = Math.sqrt(x * x + y * y),
							r = d.radius + quad.point.radius + (d.act !== quad.point.act) * NODE_PADDING_PX;
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
	var currentSliceIndex = -1;
	var maxDebugTicks = 10000000;
	var info = document.getElementById('info');
	var sliceElement = document.getElementById('slice');
	var titleElement = document.getElementById('title');
	var sliceRangeElement = document.getElementById('slice-range');
	var dataNum = 2;
	var dataMaxTicks = 180;
	var refreshRate = 500;
	var startingWeek = 0;
	var startingYear = 2010;
	var animationTimerInt = null;

	sliceElement.onkeydown = function(e) {
		if (e.keyCode == 13) {
			currentSliceIndex = this.value;
			doNextStep(true);
		}
	};
	sliceRangeElement.oninput = function() {
		currentSliceIndex = this.value;
		doNextStep(true);
	};
	document.getElementById('data-toggle').onclick = function() {
		if (dataNum == 2) {
			data = data3;
			dataNum = 3;
			dataMaxTicks = 181;
			startingYear = 2010;
			startingWeek = 0;
		} else if (dataNum == 3) {
			data = data4;
			dataNum = 4;
			dataMaxTicks = 219;
			startingYear = 2008;
			startingWeek = 30;
		} else if (dataNum == 4) {
			data = data2;
			dataNum = 2;
			dataMaxTicks = 180;
			startingYear = 2010;
			startingWeek = 0;
		}
		if (currentSliceIndex >= dataMaxTicks) {
			currentSliceIndex = 0;
		}
		sliceRangeElement.max = dataMaxTicks - 1;
		doNextStep(true);
	};
	document.getElementById('speed-toggle').onkeydown = function(e) {
		if (e.keyCode == 13) { //enter key
			refreshRate = this.value;
		}
	};
	document.getElementById('pause').onclick = function() {
		if (isAutomaticallyPlaying) {
			isAutomaticallyPlaying = false;
		} else {
			isAutomaticallyPlaying = true;
			doNextStep(false);
		}
	};
	document.getElementById('step-back-1').onclick = function() {
		isAutomaticallyPlaying = false;
		currentSliceIndex--;
		if (currentSliceIndex < 0) {
			currentSliceIndex = dataMaxTicks - 1;
		}
		sliceElement.value = currentSliceIndex;
		doNextStep(true);
	};
	document.getElementById('step-forward-1').onclick = function() {
		isAutomaticallyPlaying = false;
		sliceElement.value = currentSliceIndex;
		currentSliceIndex++;
		doNextStep(true);
	};

	function doNextStep(forceStep) {
		if (!isAutomaticallyPlaying && !forceStep) {
			return;
		}

		if (currentSliceIndex >= dataMaxTicks) {
			currentSliceIndex = 0;
		}

		updateSlice((forceStep) ? currentSliceIndex : ++currentSliceIndex);
		sliceElement.value = currentSliceIndex;
		sliceRangeElement.value = currentSliceIndex;
		updateTitle();

		if (!forceStep) {
			setTimeout(function() { doNextStep(false); }, refreshRate);
		}
		force.resume();
	}
	doNextStep(false);

	function doD3Refresh() {
		info.innerHTML = "Showing " + nodes.size() + " nodes with data set " + dataNum;
		force.resume();
		setTimeout(doD3Refresh, 100);
	}
	doD3Refresh();

	function updateTitle() {
		titleElement.innerHTML =
				(startingYear + Math.floor((currentSliceIndex * 2 + startingWeek) / 54))
				+ " week " +
				+ ((startingWeek + currentSliceIndex * 2) % 54);
	}
} ());
