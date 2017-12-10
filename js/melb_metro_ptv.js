$(document).ready(function() {
	stationClickEvents();
})

function stationClickEvents() {
	$('.line ul li button').on('click', function() {
		if ($('#origin span').is(':empty')) {
			$(this).addClass('start');
			$('#origin span').text(this.textContent);
		} else if (!($('#origin span').is(':empty')) && !($('#destination span').is(':empty'))) {
			$('#origin span').text('');
			$('#destination span').text('');
			$('.line ul li button.start').removeClass('start');
			$('.line ul li button.end').removeClass('end');
		} else {
			$('#destination span').text(this.textContent);
			$(this).addClass('end');
		}
	});

	$('#submit').on('click', function() {
		if (!($('#origin span').is(':empty')) && !($('#destination span').is(':empty'))) {
			var origin = $('#origin span').text();
			var destination = $('#destination span').text();
			if (origin === destination) {
				alert('Your origin and destination are the same station!');
				$('#origin span').text('');
				$('#destination span').text('');	
			} else {
				actionStationClick(origin, destination)
			}
		}
	});

	$('#clear').on('click', function() {
		$('#origin span').text('');
		$('#destination span').text('');
		$('#num_stops span').text('');
		$('#journey span').text('');
		$('.line ul li button.start').removeClass('start');
		$('.line ul li button.end').removeClass('end');
		// clear highlighted buttons
	})
}

function actionStationClick(origin, destination) {
	var ptv = {	
		alamein: ['Flinders Street', 'Richmond', 'East Richmond', 'Burnley', 'Hawthorn', 'Glenferrie'],
		glen_waverly: ['Flagstaff', 'Melbourne Central', 'Parliament', 'Richmond', 'Kooyong', 'Tooronga'],
		sandringham: ['Southern Cross', 'Richmond', 'South Yarra', 'Prahran', 'Windsor']
	}

	var start_train_line = '';
	var end_train_line = '';

	if (origin !== destination) {
		// Find the lines which the origin and destination are on
		for (var line in ptv) {
			// Find the origin line
			if (ptv[line].includes(origin)) {
				start_train_line = line;
				if (destination === 'Richmond') {
					end_train_line = line;
					break;
				}
			}

			// Find th destination line
			if (ptv[line].includes(destination)) {
				end_train_line = line;
				if (origin === 'Richmond') {
					start_train_line = line;
					break;
				}
			}
		}

		// Get start and end indices of stops
		var start_index = ptv[start_train_line].indexOf(origin);
		var end_index = ptv[end_train_line].indexOf(destination);
		var journeyArr = [];

		// If the origin and destination are on the same line
		if (start_train_line === end_train_line) {
			// If travelling from right to left
			if (start_index > end_index) {
				journeyArr.push(ptv[start_train_line].slice(end_index, start_index + 1).reverse());
			} else {
				journeyArr.push(ptv[start_train_line].slice(start_index, end_index + 1));
			}
		} else {
			// Get the index of the Richmond stops on the lines
			var line1_richmond_index = ptv[start_train_line].indexOf('Richmond');
			var line2_richmond_index = ptv[end_train_line].indexOf('Richmond');
			var path1;
			var path2;

			// Slice the sections of the lines
			if ((start_index < line1_richmond_index) && (line2_richmond_index < end_index)) {
				// Right Right
				path1 = ptv[start_train_line].slice(start_index, line1_richmond_index);
				path2 = ptv[end_train_line].slice(line2_richmond_index, end_index + 1);
			} else if ((start_index < line1_richmond_index) && (end_index < line2_richmond_index)) {
				// Right Left
				path1 = ptv[start_train_line].slice(start_index, line1_richmond_index + 1);
				path2 = ptv[end_train_line].slice(end_index, line2_richmond_index);
			} else if ((line1_richmond_index < start_index) && (end_index < line2_richmond_index)) {
				// Left Left
				path1 = ptv[start_train_line].slice(line1_richmond_index, start_index + 1);
				path2 = ptv[end_train_line].slice(end_index, line2_richmond_index);
			} else if ((line1_richmond_index < start_index) && (line2_richmond_index < end_index)) {
				// Left Right
				path1 = ptv[start_train_line].slice(line1_richmond_index + 1, start_index + 1);
				path2 = ptv[end_train_line].slice(line2_richmond_index, end_index + 1);
			}

			// If the lines are going backwards then reverse the order
			if (start_index > line1_richmond_index) { path1.reverse() }
			if (end_index < line2_richmond_index) { path2.reverse() }

			journeyArr.push(path1);
			journeyArr.push(path2);
		}

		// Reduces the array of arrays into a single level array
		journeyArr = journeyArr.reduce((prev,curr) => prev.concat(curr));

		createPath(journeyArr, start_train_line, end_train_line);

		// DEBUG
		// console.log('start line', start_train_line);
		// console.log('end line', end_train_line);

		// console.log('start index', start_index);
		// console.log('end index', end_index);

		// console.log('line1_richmond_index', line1_richmond_index);
		// console.log('line2_richmond_index', line2_richmond_index);

		// console.log('path1', path1);
		// console.log('path2', path2);

		// console.log('origin: ' + origin);
		// console.log('destination: ' + destination);

		// console.log('journeyArr', journeyArr);
		// console.log(numStops + ' stops total');

		// console.log(journeyArr.join(' -----> '));

		if (start_train_line === end_train_line) {
			var numStops = Math.abs(end_index - start_index);
		} else {
			var line1_stops = Math.abs(start_index - line1_richmond_index);
			var line2_stops = Math.abs(end_index - line2_richmond_index);
			var numStops = line1_stops + line2_stops;
		}

		$('#num_stops span').text(numStops + ' stops total');
		$('#journey span').text(journeyArr.join(' -----> '));

	} else {
		console.log('Your origin and destination are the same!');
	}
}

function createPath(pathArr, startLine, endLine) {
	if (pathArr.length > 2) {
		pathArr.shift();
		pathArr.pop();
		var stop = 0;
		// self invoking, recursive call on plotPath function while counting up pathArr, this loops through each element with a 500ms delay
		(function plotPath() {
			setTimeout(function() {
				console.log(pathArr[stop]);
				$('#' + startLine + ' ul li button').filter(function() { 
					return $(this).text() === pathArr[stop];
				}).addClass('highlight');
				$('#' + endLine + ' ul li button').filter(function() { 
					return $(this).text() === pathArr[stop];
				}).addClass('highlight');
				stop++;
				if (stop < pathArr.length) {
					plotPath(stop, pathArr, startLine);
				}
			}, 500)
		})()
	}
}










