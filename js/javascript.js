// TODO: disk io chart
// TODO: per cpu utilization
// TODO: memory usage per process
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.tooltips.intersect = false;
var defaults = {
	responsive: true,
	maintainAspectRatio: false,
	hover: {
		mode: 'nearest',
		intersect: false
	},
	tooltips: {
		mode: 'nearest',
		intersect: false
	}
};

var colors = ['#5cbbe6', '#b6d957', '#fac364', '#8cd3ff', '#da98cb',
	'#f2d249', '#92b9c6', '#ccc5a8', '#52bacc', '#dcdb46', '#98aafb'];

var colorsAlpha = ['rgba(92,187,230,.2)', 'rgba(182,217,87,.2)', 'rgba(250,195,100,.2)', 'rgba(140,211,255,.2)', 'rgba(218,152,203,.2)',
	'rgba(242,210,73,.2)', 'rgba(146,185,198,.2)', 'rgba(204,197,168,.2)', 'rgba(82,186,204,.2)', 'rgba(220,219,70,.2)', 'rgba(152,170,251,.2)'];

(function(undefined) {

	const BYTES = {
		B: 1,
		KB: 1024,
		MB: 1048576,
		GB: 1073741824,
		TB: 1099511627776
	};

	window.Convert = {

		fromBytes: function(data) {
			if (data >= BYTES.TB) {
				return result = Math.ceil((data / BYTES.TB).toFixed(2) * 100) / 100 + ' TB';
			} else if (data >= BYTES.GB) {
				return result = Math.ceil((data / BYTES.GB).toFixed(2) * 10) / 10 + ' GB';
			} else if (data >= BYTES.MB) {
				return result = Math.ceil((data / BYTES.MB).toFixed(2) * 2) / 2 + ' MB';
			} else if (data >= BYTES.KB) {
				return result = Math.round((data / BYTES.KB).toFixed(2) * 2) / 2 + ' KB';
			} else {
				return result = data + ' B';
			}
		}

	}

}());

var ChartModule = (function() {

	var length = 20;

	const BYTES = {
		B: 1,
		KB: 1024,
		MB: 1048576,
		GB: 1073741824,
		TB: 1099511627776
	};

	return {

		init: function(ctx, type) {
			this.button = document.querySelector('div[data-name="' + ctx + '"]');
			this.header = document.getElementById(ctx + '-header');
			this.span = document.getElementById(ctx + '-span');
			ctx = document.getElementById(ctx + '-chart');
			return new Chart(ctx, {
				type: type,
				data: this.data.call(this),
				options: this.options.call(this)
			});
		},

		options: {

			horizontalbar: function() {
				return {
					legend: {
						display: false
					},
					scales: {
						xAxes: [{
							ticks: {
								beginAtZero: false
							}
						}]
					}
				};
			},

			line: function() {
				return {
					scales: {
						xAxes: [{
							ticks: {
								display: false
							}
						}],
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					},
					tooltips: {
						mode: 'index'
					}
				};
			}

		},

		ticks: {

			bytes: function() {
				return function(data) {
					if (data >= BYTES.TB) {
						return result = Math.ceil((data / BYTES.TB).toFixed(2) * 100) / 100 + ' TB';
					} else if (data >= BYTES.GB) {
						return result = Math.ceil((data / BYTES.GB).toFixed(2) * 10) / 10 + ' GB';
					} else if (data >= BYTES.MB) {
						return result = Math.ceil((data / BYTES.MB).toFixed(2) * 2) / 2 + ' MB';
					} else if (data >= BYTES.KB) {
						return result = Math.round((data / BYTES.KB).toFixed(2) * 2) / 2 + ' KB';
					} else {
						return result = data + ' B';
					}
				}
			}

		},

		tooltip: {

			dual: function(obj) {
				return {
					label: function(tooltipItem) {
						if (tooltipItem.datasetIndex === 0) {
							return obj.tooltipText_in[tooltipItem.index];
						} else if (tooltipItem.datasetIndex === 1) {
							return obj.tooltipText_out[tooltipItem.index];
						}
					},
					title: function(tooltipItem, data) {
						return data.labels[tooltipItem[0].index];
					}
				};
			},

			percent: function(obj) {
				return {
					label: function(tooltipItem, data) {
						let dataset = data.datasets[tooltipItem.datasetIndex];
						let total = dataset.data.reduce((pre, cur) => pre + cur);
						let currentValue = dataset.data[tooltipItem.index];
						let percentage = Math.floor(((currentValue / total) * 100) + 0.5);
						return obj.tooltipText[tooltipItem.index] + ' ' + percentage + '%';
					},
					title: function(tooltipItem, data) {
						return data.labels[tooltipItem[0].index];
					}
				};
			},

			temp: function(obj) {
				return {
					label: function(tooltipItem, data) {
						let dataset = data.datasets[tooltipItem.datasetIndex];
						let currentValue = dataset.data[tooltipItem.index];
						return currentValue + " \u2103";
					},
					title: function(tooltipItem) {
						if (obj.tooltipText) {
							return obj.tooltipText[tooltipItem[0].index];
						} else {
							return obj.labels[tooltipItem[0].index];
						}
					}
				};
			}

		},

		updateDataPoint: function(obj, data, label, text) {
			if (text) { obj.button.textContent = text; }
			let do_shift = false;
			obj.chart.data.datasets.forEach((v, i) => {
				if (v.data.length > length) {
					v.data.shift();
					do_shift = true;
				}
				v.data.push(data[i]);
			});
			do_shift ? obj.chart.data.labels.shift() : '';
			obj.chart.data.labels.push(label);
			obj.chart.update();
		},

		updateDataObject: function(obj, data, label) {
			if (obj.chart.data.datasets[0].data.length > length) {
				obj.chart.data.labels.shift();
				obj.chart.data.datasets[0].data.shift();
				obj.chart.data.datasets[1].data.shift();
				obj.tooltipText_in.shift();
				obj.tooltipText_out.shift();
			}
			obj.chart.data.labels.push(label);
			if (data.hasOwnProperty('bytes_in') || data.hasOwnProperty('bytes_out')) {
				obj.chart.data.datasets[0].data.push(data['bytes_in']);
				obj.chart.data.datasets[1].data.push(data['bytes_out']);
				obj.tooltipText_in.push(data['formatted_in']);
				obj.tooltipText_out.push(data['formatted_out']);
			} else {
				obj.chart.data.datasets[0].data.push(data['input_voltage']['actual']);
				obj.chart.data.datasets[1].data.push(data['battery_voltage']['actual']);
				obj.tooltipText_in.push(data['input_voltage']['actual']);
				obj.tooltipText_out.push(data['battery_voltage']['actual']);
			}

			obj.chart.update();
		},

		replaceData: function(obj, data) {
			obj.chart.data.datasets[0].data = data;
			obj.chart.update();
		},

		replaceDataArray: function(obj, data) {
			obj.labels = [];
			obj.dataPoints = [];
			obj.tooltipText = [];
			data.forEach(v => {
				obj.labels.push(v.title);
				obj.dataPoints.push(v.bytes);
				obj.tooltipText.push(v.formatted);
			});
			if (obj.hasOwnProperty('chart')) {
				obj.chart.update();
			}
		},

		replaceDataObject: function(obj, data, tt) {
			obj.chart.data.datasets[0].data = [];
			tt ? obj.tooltipText = [] : '';
			for (let key in data) {
				obj.chart.data.datasets[0].data.push(data[key]['bytes'] || data[key]);
				tt ? obj.tooltipText.push(data[key]['formatted']) : '';
			}
			obj.chart.update();
		}

	};

}());

/**
 * Cpu load average chart
 */
(function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('cpu-load-average-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
	};

	function update() {
		Xhr.request({ url: 'php/cpu/cpu.loadaverage.php' })
			.then(r => {
				document.querySelector('[data-name="cpu-load-average"]').textContent = r['clock'];
				chart.config.data.datasets.forEach((v, i) => {
					v.data.push({
						x: Date.now(),
						y: r['data'][i]
					});
				});
				chart.update({ preservation: true });
			})
			.catch(e => console.error(e));
	};

	let config = {
		type: 'line',
		data: {
			datasets: [
				{
					label: '1 Min',
					data: [],
					backgroundColor: colorsAlpha[0],
					borderColor: colors[0],
					pointBorderColor: colors[0],
					pointHoverBorderColor: colors[0]
				},
				{
					label: '5 Min',
					data: [],
					backgroundColor: colorsAlpha[1],
					borderColor: colors[1],
					pointBorderColor: colors[1],
					pointHoverBorderColor: colors[1]
				},
				{
					label: '15 Min',
					data: [],
					backgroundColor: colorsAlpha[2],
					borderColor: colors[2],
					pointBorderColor: colors[2],
					pointHoverBorderColor: colors[2]
				}
			]
		},
		options: {
			scales: {
				xAxes: [{
					type: 'realtime',
					realtime: {
						duration: 30000,
						refresh: 5000,
						delay: 5000,
						onRefresh: update
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			},
			plugins: {
				streaming: {
					frameRate: 30
				}
			},
			tooltips: {
				mode: 'index'
			}
		}
	};

	init();

}());

/**
 * Cpu temperature chart
 */
(function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('cpu-temperature-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
		setInterval(() => update(), 5000);
	};

	function update() {
		Xhr.request({ url: 'php/cpu/cpu.temperature.php' })
			.then(r => {
				// chart.data.datasets[0].labels = r['data'].reduce((a, b, i) => a.push('CPU ' + i), []);
				chart.data.datasets[0].data = r['data'];
				chart.update();
			})
			.catch(e => console.error(e));
	};

	let config = {
		type: 'horizontalBar',
		data: {
			labels: ['CPU 1', 'CPU 2', 'CPU 3', 'CPU 4', 'CPU 5', 'CPU 6', 'CPU 7', 'CPU 8'],
			// labels: [],
			datasets: [{
				data: [],
				backgroundColor: colors
			}]
		},
		options: {
			legend: {
				display: false
			},
			scales: {
				xAxes: [{
					ticks: {
						beginAtZero: false,
						min: 30,
						max: 100
					}
				}]
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						let dataset = data.datasets[tooltipItem.datasetIndex];
						let currentValue = dataset.data[tooltipItem.index];
						return currentValue + " \u2103";
					},
					title: function(tooltipItem, data) {
						return data.labels[tooltipItem[0].index];
					}
				}
			}
		}
	};

	init();

}());

/**
 * Disk bandwidth chart
 */
(function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('disk-bandwidth-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
	}

	function update() {
		Xhr.request({ url: 'php/disk/disk.bandwidth.php' })
			.then(r => {
				let data = chart.config.data;
				data.datasets[0].data.push({
					x: Date.now(),
					y: r.data.bytes_out
				});
				data.datasets[1].data.push({
					x: Date.now(),
					y: r.data.bytes_in
				});
				chart.update({ preservation: true });
			})
			.catch(e => console.error(e));
	}

	let config = {
		type: 'line',
		data: {
			datasets: [
				{
					label: 'Read',
					data: [],
					backgroundColor: colorsAlpha[0],
					borderColor: colors[0],
					pointBorderColor: colors[0],
					pointHoverBorderColor: colors[0]
				},
				{
					label: 'Write',
					data: [],
					backgroundColor: colorsAlpha[1],
					borderColor: colors[1],
					pointBorderColor: colors[1],
					pointHoverBorderColor: colors[1]
				}
			]
		},
		options: {
			scales: {
				xAxes: [{
					type: 'realtime',
					realtime: {
						duration: 30000,
						refresh: 5000,
						delay: 5000,
						onRefresh: update
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: Convert.fromBytes
					}
				}]
			},
			plugins: {
				streaming: {
					frameRate: 30
				}
			},
			tooltips: {
				mode: 'index',
				callbacks: {
					label: function(tooltipItem, data) {
						let formatted = Convert.fromBytes(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y);
						return `${data.datasets[tooltipItem.datasetIndex].label}: ${formatted}`;
					}
				}
			}
		}
	};

	init();

}());

/**
 * Disk temperature chart
 */
(function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('disk-temperature-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
		setInterval(() => update(), 5000);
	}

	function update() {
		Xhr.request({ url: 'php/disk/disk.temperature.php' })
			.then(r => {
				chart.data.datasets[0].data = r['data'];
				chart.update();
			})
			.catch(e => console.error(e));
	}

	let config = {
		type: 'horizontalBar',
		data: {
			labels: ['da0', 'ada0', 'ada1', 'ada2', 'ada3', 'ada4', 'ada5'],
			datasets: [{
				data: [],
				backgroundColor: colors
			}]
		},
		options: {
			legend: {
				display: false
			},
			scales: {
				xAxes: [{
					ticks: {
						beginAtZero: false,
						min: 20,
						max: 50
					}
				}]
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						let dataset = data.datasets[tooltipItem.datasetIndex];
						let currentValue = dataset.data[tooltipItem.index];
						return currentValue + " \u2103";
					},
					title: function(tooltipItem, data) {
						return data.labels[tooltipItem[0].index];
					}
				}
			}
		}
	};

	init();

}());

/**
 * Disk usage chart
 */
(function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('disk-usage-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
		// setInterval(() => update(), 5000);
	}

	function update() {
		Xhr.request({ url: 'php/disk/disk.usage.php' })
			.then(r => {
				document.querySelector('[data-name="disk-usage"]').textContent = r['total'];
				for (let key in r.data) {
					chart.data.labels.push(key);
					chart.data.datasets[0].data.push(r.data[key].used_ds)
				}
				// chart.data.datasets[0].data = r.data.used_ds;
				chart.update();
			})
			.catch(e => console.error(e));
	}

	let config = {
		type: 'pie',
		data: {
			labels: [],
			datasets: [{
				data: [],
				backgroundColor: colors
			}]
		},
		options: {
			animation: {
				animateRotate: true
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						let dataset = data.datasets[tooltipItem.datasetIndex];
						let total = dataset.data.reduce((pre, cur) => pre + cur);
						let currentValue = dataset.data[tooltipItem.index];
						let percentage = Math.floor(((currentValue / total) * 100) + 0.5);
						return `${Convert.fromBytes(currentValue)} ${percentage}%`;
					},
					title: function(tooltipItem, data) {
						return data.labels[tooltipItem[0].index];
					}
				}
			}
		}
	};

	init();

}());

/**
 * Memory usage chart
 */
(function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('memory-usage-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
		// setInterval(() => update(), 10000);
	}

	function update() {
		Xhr.request({ url: 'php/memory/memory.usage.php'})
			.then(r => {
				document.querySelector('[data-name="memory-usage"]').textContent = Convert.fromBytes(r.total);
				for (let key in r.data) {
					chart.data.labels.push(key);
					chart.data.datasets[0].data.push(r.data[key].bytes)
				}
				chart.update();
			})
			.catch(e => console.error(e))
	}

	let config = {
		type: 'pie',
		data: {
			labels: [],
			datasets: [{
				data: [],
				backgroundColor: colors
			}]
		},
		options: {
			animation: {
				animateRotate: true
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						let dataset = data.datasets[tooltipItem.datasetIndex];
						let total = dataset.data.reduce((pre, cur) => pre + cur);
						let currentValue = dataset.data[tooltipItem.index];
						let percentage = Math.floor(((currentValue / total) * 100) + 0.5);
						return `${Convert.fromBytes(currentValue)} ${percentage}%`;
					},
					title: function(tooltipItem, data) {
						return data.labels[tooltipItem[0].index];
					}
				}
			}
		}
	};

	init();

}());

var Memory = {

	usage: {

		init: function(r, aux) {
			ChartModule.replaceDataArray(this, r);
			this.chart = ChartModule.init.call(this, 'memory-usage', 'pie');
			this.button.textContent = aux;
		},

		data: function() {
			return {
				labels: this.labels,
				datasets: [{
					data: this.dataPoints,
					backgroundColor: colors
				}]
			};
		},

		options: function() {
			return {
				animation: {
					animateRotate: true
				},
				tooltips: {
					callbacks: ChartModule.tooltip.percent(this)
				}
			};
		}

	}

};

var Network = {

	bandwidth: {

		dataPoints: [],
		tooltipText_in: [],
		tooltipText_out: [],

		init: function(r) {
			this.dataPoints = r['all'];
			this.tooltipText_in.push(this.dataPoints['formatted_in']);
			this.tooltipText_out.push(this.dataPoints['formatted_out']);
			this.chart = ChartModule.init.call(this, 'txrx-current', 'line');
			this.chart.options.tooltips.callbacks = ChartModule.tooltip.dual(this);
			this.chart.options.scales.yAxes[0].ticks.callback = ChartModule.ticks.bytes();
			this.chart.update();
		},

		data: function() {
			return {
				datasets: [
					{
						label: 'In',
						data: [this.dataPoints['bytes_in']],
						backgroundColor: 'rgba(220, 219, 70, .2)',
						borderColor: '#dcdb46',
						pointBorderColor: '#dcdb46',
						pointHoverBorderColor: '#dcdb46'
					},
					{
						label: 'Out',
						data: [this.dataPoints['bytes_out']],
						backgroundColor: 'rgba(152, 170, 251, .2)',
						borderColor: '#98aafb',
						pointBorderColor: '#98aafb',
						pointHoverBorderColor: '#98aafb'
					}
				]
			};
		},

		options: function() {
			return ChartModule.options.line();
		}

	}

};

var System = {

	processes: {

		fields: [
			{ 'title': 'User', 'field': 'user' },
			// {'title': 'PID', 'field': 'pid'},
			{ 'title': 'Time', 'field': 'time' },
			{ 'title': 'TC', 'field': 'nlwp' },
			{ 'title': 'CPU', 'field': 'pcpu' },
			{ 'title': 'Mem', 'field': 'pmem' },
			{ 'title': 'CMD', 'field': 'comm' }
			// {'title': 'Data Size', 'field': 'dsiz'}
			// {'title': 'Elapsed', 'field': 'etimes'}
		],

		init: function(r, aux) {
			Table.createHorizontal(System.specs.parse, 'top-processes', this.fields, r);
			document.querySelector('div[data-name="top-processes"]').textContent = aux + ' Total';
		}

	},

	specs: {

		fields: [
			{ 'title': 'Hostname', 'field': 'hostname' },
			{ 'title': 'OS', 'field': 'os' },
			{ 'title': 'Version', 'field': 'os_version' },
			{ 'title': 'Kernel', 'field': 'kernel_version' },
			{ 'title': 'Platform OS', 'field': 'platform_os' },
			{ 'title': 'CPU Model', 'field': 'cpu_model' },
			{ 'title': 'Motherboard', 'field': 'motherboard' },
			{ 'title': 'System', 'field': 'system' },
			{ 'title': 'System BIOS', 'field': 'system_bios' },
			{ 'title': 'System Uptime', 'field': 'system_uptime' },
			{ 'title': 'Disk Interface', 'field': 'disk_interface' },
			{ 'title': 'Network Interface', 'field': 'network_interface' },
			{ 'title': 'USB Interface', 'field': 'usb_interface' },
			{ 'title': 'UPS Info', 'field': 'ups_info' }
		],

		init: function(r) {
			Table.createVertical(this.parse, 'system-specs', this.fields, r);
		},

		parse: function(fieldValue, response) {
			return response[fieldValue.field];
		}

	}

};

var Ups = {

	info: {

		labels: [],
		dataPoints: [],
		tooltipText_in: [],
		tooltipText_out: [],

		init: function(r) {
			this.dataPoints = r;
			this.tooltipText_in.push(r['input_voltage']['actual']);
			this.tooltipText_out.push(r['battery_voltage']['actual']);
			this.chart = ChartModule.init.call(this, 'ups-info', 'line');
			this.chart.options.tooltips.callbacks = ChartModule.tooltip.dual(this);
			this.chart.update();
		},

		data: function() {
			return {
				datasets: [
					{
						label: 'Input Voltage',
						data: [this.dataPoints['input_voltage']['actual']],
						backgroundColor: 'rgba(220, 219, 70, .2)',
						borderColor: '#dcdb46',
						pointBorderColor: '#dcdb46',
						pointHoverBorderColor: '#dcdb46'
					},
					{
						label: 'Battery Voltage',
						data: [this.dataPoints['battery_voltage']['actual']],
						backgroundColor: 'rgba(152, 170, 251, .2)',
						borderColor: '#98aafb',
						pointBorderColor: '#98aafb',
						pointHoverBorderColor: '#98aafb'
					}
				]
			}
		},

		options: function() {
			return ChartModule.options.line();
		}
	}

};

var Table = {

	clearPalette: function(el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
	},

	createVertical: function(callback, element, fields, response) {
		let el = document.getElementById(element);
		this.clearPalette(el);
		let table = document.createElement('table');
		table.classList.add('vertical', 'slds-table');
		let count = 0;
		fields.forEach(fieldValue => {
			let dataInsert = callback(fieldValue, response);
			if (dataInsert && dataInsert !== '') {
				let row = table.insertRow(count);
				let cell1 = row.insertCell(0);
				let cell2 = row.insertCell(1);
				cell1.innerHTML = fieldValue.title;
				cell2.innerHTML = dataInsert;
				count++;
			}
		});
		el.appendChild(table);
		requestAnimationFrame(() => el.classList.add('fade-in'));
	},

	createHorizontal: function(callback, element, fields, response) {
		let el = document.getElementById(element);
		this.clearPalette(el);
		let table = document.createElement('table');
		table.classList.add('horizontal', 'slds-table');
		let df = document.createDocumentFragment();
		// Create the table head
		let tr_thead = document.createElement('tr');
		fields.forEach(v => {
			let th = document.createElement('th');
			th.appendChild(document.createTextNode(v.title));
			tr_thead.appendChild(th);
		});
		df.appendChild(tr_thead);
		// Create the table data
		response.forEach(responseValue => {
			let tr_tbody = document.createElement('tr');
			fields.forEach(fieldValue => {
				let dataInsert = callback(fieldValue, responseValue);
				let td = document.createElement('td');
				td.appendChild(document.createTextNode(dataInsert));
				tr_tbody.appendChild(td);
			});
			df.appendChild(tr_tbody);
		});
		table.appendChild(df);
		el.appendChild(table);
		requestAnimationFrame(() => el.classList.add('fade-in'));
	}

}; // Close Table Object

var App = {

	initialRequests: ['init', 'disk', 'mem', 'poll'],
	updateRequests: ['poll'],
	longPollRequests: ['disk', 'mem'],

	init: function() {
		// The inital requests
		this.initialRequests.forEach(v => {
			Xhr.request({ 'url': 'php/functions.php?type=' + v })
				.then(r => this.modulesInit(r, v))
				.catch(e => console.error(e));
		});
		// The update requests
		updateData = () => {
			this.updateRequests.forEach(v => {
				Xhr.request({ 'url': 'php/functions.php?type=' + v })
					.then(r => this.modulesUpdate(r, v))
					.catch(e => console.error(e));
			});
		};
		setInterval(() => updateData(), 5000);
		// Long Poll Requests
		longPoll = () => {
			this.longPollRequests.forEach(v => {
				Xhr.request({ 'url': 'php/functions.php?type=' + v })
					.then(r => this.modulesUpdate(r, v))
					.catch(e => console.error(e));
			});
		};
		setInterval(() => longPoll(), 60000);
	},

	currentTime: function() {
		return new Date().toLocaleTimeString('en-US').split(' ')[0];
	},

	modulesInit: function(r, type) {
		switch (type) {
			case 'disk':
				// Disk.temp.init(r['disk_temps'], r['disk_info']);
				Ups.info.init(r['ups_stats']);
				break;
			case 'mem':
				// Memory.usage.init(r['memory_usage'], r['memory_total']);
				break;
			case 'poll':
				// Disk.bandwidth.init(r['disk_io_stats']);
				Network.bandwidth.init(r['txrx_current']);
				break;
			case 'init':
				System.specs.init(r);
				System.processes.init(r['top_processes'], r['process_count']);
				// Cpu.loadAverage.init(r['cpu_load_average'], r['cpu_frequency']);
				// Cpu.temp.init(r['cpu_temps']);
				// Disk.usage.init(r['dataset_usage']);
		}
	},

	modulesUpdate: function(r, type) {
		switch (type) {
			case 'disk':
				// ChartModule.replaceDataObject(Disk.temp, r['disk_temps']);
				// Disk.usage.init(r['dataset_usage']);
				ChartModule.updateDataObject(Ups.info, r['ups_stats'], this.currentTime());
				break;
			case 'mem':
				// ChartModule.replaceDataArray(Memory.usage, r['memory_usage'], true);
				// Memory.usage.update(r['memory_usage']);
				break;
			case 'poll':
				// ChartModule.updateDataObject(Disk.bandwidth, r['disk_io_stats']['bw'], this.currentTime());
				ChartModule.updateDataObject(Network.bandwidth, r['txrx_current']['all'], this.currentTime());
				System.processes.init(r['top_processes'], r['process_count']);
			// ChartModule.updateDataPoint(Cpu.loadAverage, r['cpu_load_average'], this.currentTime(), r['cpu_frequency']);
			// ChartModule.replaceData(Cpu.temp, r['cpu_temps']);
		}
	},

	switchViews: function(toChart, element, fromText, toText) {
		let button = document.querySelector('div[data-name="' + element + '"]');
		let header = document.getElementById(element + '-header');
		let doSwitch = true;
		button.addEventListener('click', () => {
			if (doSwitch === true) {
				this.chart.data.datasets[0].data = toChart.dataPoints;
				this.chart.options.tooltips.callbacks = toChart.tooltipCallback();
				header.textContent = toText;
				doSwitch = false;
			} else {
				this.chart.data.datasets[0].data = this.dataPoints;
				this.chart.options.tooltips.callbacks = this.tooltipCallback();
				header.textContent = fromText;
				doSwitch = true;
			}
			this.chart.update();
		})
	}
} // Close App Object

if (!navigator.userAgent.match(/bot|spider/gi)) {
	App.init();
	// Object.assign(Chart.defaults.global, defaults);
}
