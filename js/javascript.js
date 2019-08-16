// TODO: disk io chart
// TODO: memory usage per process
// TODO: global adjust of framerate, frequency, duration
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.tooltips.intersect = false;

var config = {};
document.querySelectorAll('.slds-vertical-tabs__content').forEach(v => {
	config[v.id] = [];
	v.querySelectorAll('.container__chart').forEach(w => {
		config[v.id].push(w.id);
	});
});
console.dir(config);
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

var Convert = (function(undefined) {

	const BYTES = {
		B: 1,
		KB: 1024,
		MB: 1048576,
		GB: 1073741824,
		TB: 1099511627776
	};

	return {

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

	};

}());

var ChartModule = (function(undefined) {

	var length = 20;

	function play(chart) {
		chart.options.plugins.streaming.pause = false;
		chart.update({ duration: 0 });
	}

	function pause(chart) {
		chart.options.plugins.streaming.pause = true;
		chart.update({ duration: 0 });
	}

	var tooltip = {

		percentage: function() {
			return {
				label: function(tooltipItem, data) {
					let dataset = data.datasets[tooltipItem.datasetIndex];
					let total = dataset.data.reduce((pre, cur) => pre + cur);
					let currentValue = dataset.data[tooltipItem.index];
					let percentage = Math.floor(((currentValue / total) * 100) + 0.5);
					return `${Convert.fromBytes(currentValue)} ${percentage}%`;
				},
				labelColor: function(tooltipItem, chart) {
					return {
						backgroundColor: colors[tooltipItem.index]
					}
				},
				title: function(tooltipItem, data) {
					return data.labels[tooltipItem[0].index];
				}
			};
		},

		temperature: function() {
			return {
				label: function(tooltipItem, data) {
					let dataset = data.datasets[tooltipItem.datasetIndex];
					let currentValue = dataset.data[tooltipItem.index];
					return currentValue + " \u2103";
				},
				labelColor: function(tooltipItem, chart) {
					return {
						backgroundColor: colors[tooltipItem.index]
					}
				},
				title: function(tooltipItem, data) {
					return data.labels[tooltipItem[0].index];
				}
			};
		},

	}

	return {

		play: play,
		pause: pause,
		tooltip: tooltip

	};

}());

/**
 * Cpu load average chart
 */
var CpuLoadAverageChart = (function(undefined) {

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
						y: r.data[i]
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
						duration: 60000,
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
			// plugins: {
			// 	streaming: {
			// 		frameRate: 30
			// 	}
			// },
			tooltips: {
				mode: 'index',
				labelColor: function(tooltipItem, chart) {
					return {
						backgroundColor: colors[tooltipItem.datasetIndex]
					}
				}
			}
		}
	};

	init();

}());

/**
 * Cpu temperature chart
 */
var CpuTemperatureChart = (function(undefined) {

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
				document.querySelector('[data-name="cpu-temperature"]').textContent = r.avg + " \u2103";
				chart.data.labels = Object.keys(r.data);
				chart.data.datasets[0].data = Object.values(r.data);
				chart.update();
			})
			.catch(e => console.error(e));
	};

	let config = {
		type: 'horizontalBar',
		data: {
			labels: [],
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
				callbacks: ChartModule.tooltip.temperature()
			}
		}
	};

	init();

}());

/**
 * Disk bandwidth chart
 */
var DiskBandwidthChart = (function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('disk-bandwidth-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
	}

	function update() {
		Xhr.request({ url: 'php/disk/disk.bandwidth.php' })
			.then(r => {
				document.querySelector('[data-name="disk-bandwidth"]').textContent = Convert.fromBytes(r.total);
				let data = chart.config.data;
				data.datasets[0].data.push({
					x: Date.now(),
					y: r.data.read
				});
				data.datasets[1].data.push({
					x: Date.now(),
					y: r.data.write
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
						duration: 60000,
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
					},
					labelColor: function(tooltipItem, chart) {
						return {
							backgroundColor: colors[tooltipItem.datasetIndex]
						}
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
var DiskTemperatureChart = (function(undefined) {

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
				document.querySelector('[data-name="disk-temperature"]').textContent = r.avg + " \u2103";
				chart.data.labels = Object.keys(r.data);
				chart.data.datasets[0].data = Object.values(r.data);
				chart.update();
			})
			.catch(e => console.error(e));
	}

	let config = {
		type: 'horizontalBar',
		data: {
			labels: [],
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
					labelColor: function(tooltipItem, chart) {
						return {
							backgroundColor: colors[tooltipItem.index]
						}
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
var DiskUsageChart = (function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('disk-usage-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
		setInterval(() => update(), 60000);
	}

	function update() {
		Xhr.request({ url: 'php/disk/disk.usage.php' })
			.then(r => {
				document.querySelector('[data-name="disk-usage"]').textContent = r.total;
				for (let key in r.data) {
					chart.data.labels.push(key);
					chart.data.datasets[0].data.push(r.data[key].used_ds)
				}
				chart.data.labels.length = Object.keys(r.data).length;
				chart.data.datasets[0].data.length = Object.keys(r.data).length;
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
					labelColor: function(tooltipItem, chart) {
						return {
							backgroundColor: colors[tooltipItem.index]
						}
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
var MemoryUsageChart = (function(undefined) {

	let chart;
	let interval;

	function init() {
		let ctx = document.getElementById('memory-usage-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
		interval = setInterval(() => update(), 60000);
	}

	function update() {
		Xhr.request({ url: 'php/memory/memory.usage.php' })
			.then(r => {
				document.querySelector('[data-name="memory-usage"]').innerHTML = `${Convert.fromBytes(r.usage)}</br>${Convert.fromBytes(r.total)}`;
				chart.data.labels = Object.keys(r.data);
				chart.data.datasets[0].data = Object.values(r.data);
				chart.update();
			})
			.catch(e => console.error(e))
	}

	function pause() {
		clearInterval(interval);
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
				callbacks: ChartModule.tooltip.percentage()
			}
		}
	};

	init();

	return {
		init: init,
		play: init,
		pause: pause
	};

}());

/**
 * Network bandwidth chart
 */
var NetworkBandwidthChart = (function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('network-bandwidth-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
	}

	function update() {
		Xhr.request({ url: 'php/network/network.bandwidth.php' })
			.then(r => {
				document.querySelector('[data-name="network-bandwidth"]').textContent = Convert.fromBytes(r.data.ix0.total);
				let data = chart.config.data;
				data.datasets[0].data.push({
					x: Date.now(),
					y: r.data.ix0.bytes_out
				});
				data.datasets[1].data.push({
					x: Date.now(),
					y: r.data.ix0.bytes_in
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
					label: 'In',
					data: [],
					backgroundColor: colorsAlpha[0],
					borderColor: colors[0],
					pointBorderColor: colors[0],
					pointHoverBorderColor: colors[0]
				},
				{
					label: 'Out',
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
						duration: 60000,
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
					},
					labelColor: function(tooltipItem, chart) {
						return {
							backgroundColor: colors[tooltipItem.datasetIndex]
						}
					}
				}
			}
		}
	};

	init();

	// return {
	// 	init: init,
	// 	play: ChartModule.play(chart),
	// 	pause: ChartModule.pause(chart)
	// };

}());

/**
 * UPS usage chart
 */
var UpsUsageChart = (function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('ups-info-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update();
	}

	function update() {
		Xhr.request({ url: 'php/ups/ups.usage.php' })
			.then(r => {
				document.querySelector('[data-name="ups-info"]').textContent = r.status;
				let data = chart.config.data;
				data.datasets[0].data.push({
					x: Date.now(),
					y: r.data.input_voltage
				});
				data.datasets[1].data.push({
					x: Date.now(),
					y: r.data.battery_voltage
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
					label: 'Input Voltage',
					data: [],
					backgroundColor: colorsAlpha[0],
					borderColor: colors[0],
					pointBorderColor: colors[0],
					pointHoverBorderColor: colors[0]
				},
				{
					label: 'Battery Voltage',
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
						duration: 60000,
						refresh: 10000,
						delay: 10000,
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
				mode: 'index',
				labelColor: function(tooltipItem, chart) {
					return {
						backgroundColor: colors[tooltipItem.datasetIndex]
					}
				}
			}
		}
	};

	init();

	// return {
	// 	init: init,
	// 	play: ChartModule.play(chart),
	// 	pause: ChartModule.pause(chart)
	// };

}());

/**
 * System process table
 */
var SystemProcessTable = (function(undefined) {

	let interval;

	function init() {
		update();
		interval = setInterval(() => update(), 5000);
	}

	function update() {
		Xhr.request({ url: 'php/system/system.processes.php' })
			.then(r => {
				document.querySelector('[data-name="system-processes"]').textContent = r.total;
				Table.createHorizontal('system-processes', r.data);
			})
			.catch(e => console.error(e))
	}

	function pause() {
		clearInterval(interval);
	}

	init();

	return {
		init: init,
		play: init,
		pause: pause
	};

}());

/**
 * System info table
 */
var SystemInfoTable = (function() {

	function init() {
		Xhr.request({ url: 'php/system/system.info.php' })
			.then(r => Table.createVertical('system-info', r))
			.catch(e => console.error(e));
	}

	init();

}());

/**
 * Cpu usage per core chart
 */
var CpuUsagePerCoreChart = (function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('cpu-usage-per-core-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update(true);
	};

	function update(init) {
		Xhr.request({ url: 'php/cpu/cpu.usagepercore.php' })
			.then(r => {
				document.querySelector('[data-name="cpu-usage-per-core"]').textContent = `${r.total} %`;
				if (init === true) {
					Object.keys(r.data).forEach((v, i) => {
						chart.config.data.datasets.push({
							label: v,
							data: [],
							backgroundColor: colorsAlpha[i],
							borderColor: colors[i],
							pointBorderColor: colors[i],
							pointHoverBorderColor: colors[i]
						});
					});
				}
				chart.config.data.datasets.forEach((v, i) => {
					v.data.push({
						x: Date.now(),
						y: Object.values(r.data)[i]
					});
				});
				chart.update({ preservation: true });
			})
			.catch(e => console.error(e));
	};

	let config = {
		type: 'line',
		data: {
			datasets: []
		},
		options: {
			scales: {
				xAxes: [{
					type: 'realtime',
					realtime: {
						duration: 60000,
						refresh: 10000,
						delay: 10000,
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
				mode: 'index',
				labelColor: function(tooltipItem, chart) {
					return {
						backgroundColor: colors[tooltipItem.datasetIndex]
					}
				},
				itemSort: function(a, b) {
					return b.value - a.value;
				}
			}
		}
	};

	init();

}());

/**
 * Memory usage by type chart
 */
var MemoryUsageByTypeChart = (function(undefined) {

	let chart;

	function init() {
		let ctx = document.getElementById('memory-usage-by-type-chart').getContext('2d');
		chart = new Chart(ctx, config);
		update(true);
	};

	function update(init) {
		Xhr.request({ url: 'php/memory/memory.usage.php' })
			.then(r => {
				if (init === true) {
					Object.keys(r.data).forEach((v, i) => {
						chart.config.data.datasets.push({
							label: v,
							data: [],
							backgroundColor: colorsAlpha[i],
							borderColor: colors[i],
							pointBorderColor: colors[i],
							pointHoverBorderColor: colors[i]
						});
					});
				}
				chart.config.data.datasets.forEach((v, i) => {
					v.data.push({
						x: Date.now(),
						y: Object.values(r.data)[i]
					});
				});
				chart.update({ preservation: true });
			})
			.catch(e => console.error(e));
	};

	let config = {
		type: 'line',
		data: {
			datasets: []
		},
		options: {
			scales: {
				xAxes: [{
					type: 'realtime',
					realtime: {
						duration: 60000,
						refresh: 10000,
						delay: 10000,
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
					},
					labelColor: function(tooltipItem, chart) {
						return {
							backgroundColor: colors[tooltipItem.datasetIndex]
						}
					}
				},
				itemSort: function(a, b) {
					return b.value - a.value;
				}
			}
		}
	};

	init();

}());

var Table = (function(undefined) {

	function clearPalette(el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
	}

	function createHorizontal(element, response) {
		let el = document.getElementById(element);
		clearPalette(el);
		let table = document.createElement('table');
		let tbody = document.createElement('tbody');
		table.classList.add('slds-table', 'slds-table_bordered', 'slds-table_striped');
		let df = document.createDocumentFragment();
		// Create the table head
		let tr_thead = document.createElement('tr');
		Object.keys(response[0]).forEach(v => {
			let th = document.createElement('th');
			th.appendChild(document.createTextNode(v));
			tr_thead.appendChild(th);
		});
		df.appendChild(tr_thead);
		// Create the table data
		response.forEach(responseValue => {
			let tr_tbody = document.createElement('tr');
			Object.values(responseValue).forEach(v => {
				let td = document.createElement('td');
				td.appendChild(document.createTextNode(v));
				tr_tbody.appendChild(td);
			});
			df.appendChild(tr_tbody);
		});
		tbody.appendChild(df);
		table.appendChild(tbody);
		el.appendChild(table);
		requestAnimationFrame(() => el.classList.add('fade-in'));
	}

	function createVertical(element, response) {
		let el = document.getElementById(element);
		clearPalette(el);
		let table = document.createElement('table');
		table.classList.add('slds-table', 'slds-table_bordered');
		let count = 0;
		for (let key in response) {
			let row = table.insertRow(count);
			let th = document.createElement('th');
			row.appendChild(th);
			let cell2 = row.insertCell(1);
			th.textContent = key;
			cell2.textContent = response[key];
			count++;
		};
		el.appendChild(table);
		requestAnimationFrame(() => el.classList.add('fade-in'));
	}

	return {
		createHorizontal: createHorizontal,
		createVertical: createVertical
	};

}());

var App = {

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

}
