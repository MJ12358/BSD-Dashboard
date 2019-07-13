// TODO: disk io chart
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;

var colors = ['#5cbbe6', '#b6d957', '#fac364', '#8cd3ff', '#da98cb',
	'#f2d249', '#92b9c6', '#ccc5a8', '#52bacc', '#dcdb46', '#98aafb'];

var ChartModule = (function() {

	var length = 20;

	const BYTES = {
		'B': 1,
		'KB': 1024,
		'MB': 1048576,
		'GB': 1073741824,
		'TB': 1099511627776
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

		optionsHorizontalBar: function() {
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

		optionsLine: function() {
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
		},

		tooltipCallbackDual: function(obj) {
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

		tooltipCallbackPercentage: function(obj) {
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

		tooltipCallbackTemperature: function(obj) {
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
		},

		ticksCallbackFormattedBytes: function() {
			return function(data) {
				let result;
				if (data >= BYTES.TB) {
					result = Math.ceil((data / BYTES.TB).toFixed(2) * 100) / 100 + ' TB';
				} else if (data >= BYTES.GB) {
					result = Math.ceil((data / BYTES.GB).toFixed(2) * 10) / 10 + ' GB';
				} else if (data >= BYTES.MB) {
					result = Math.ceil((data / BYTES.MB).toFixed(2) * 2) / 2 + ' MB';
				} else if (data >= BYTES.KB) {
					result = Math.round((data / BYTES.KB).toFixed(2) * 2) / 2 + ' KB';
				} else {
					result = data + ' B';
				}
				return result;
			}
		}

	};

})();

var CpuLoadAverageModule = (function() {

	return {

		labels: [],
		dataPoints: [],

		init: function(r, aux) {
			this.labels.push(App.currentTime());
			this.dataPoints = r;
			this.chart = ChartModule.init.call(this, 'cpu-load-average', 'line');
			this.button.textContent = aux;
		},

		data: function() {
			return {
				labels: this.labels,
				datasets: [
					{
						label: '1 Min',
						data: [this.dataPoints[0]],
						backgroundColor: 'rgba(250, 195, 100, .2)',
						borderColor: '#fac364',
						pointBorderColor: '#fac364',
						pointHoverBorderColor: '#fac364'
					},
					{
						label: '5 Min',
						data: [this.dataPoints[1]],
						backgroundColor: 'rgba(182, 217, 87, .2)',
						borderColor: '#b6d957',
						pointBorderColor: '#b6d957',
						pointHoverBorderColor: '#b6d957'
					},
					{
						label: '15 Min',
						data: [this.dataPoints[2]],
						backgroundColor: 'rgba(140, 211, 255, .2)',
						borderColor: '#8cd3ff',
						pointBorderColor: '#8cd3ff',
						pointHoverBorderColor: '#8cd3ff'
					}
				]
			};
		},

		options: function() {
			return ChartModule.optionsLine();
		}

	};

})();

var CpuTemperatureModule = (function() {

	return {

		labels: [],
		dataPoints: [],

		init: function(r) {
			r.forEach((v, i) => this.labels.push('Core ' + i));
			this.dataPoints = r;
			this.chart = ChartModule.init.call(this, 'cpu-temps', 'horizontalBar');
			this.chart.options.tooltips.callbacks = ChartModule.tooltipCallbackTemperature(this);
			this.chart.options.scales.xAxes[0].ticks.min = 30;
			this.chart.options.scales.xAxes[0].ticks.max = 100;
			this.chart.update();
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
			return ChartModule.optionsHorizontalBar();
		}

	};

})();

var DiskBandwidthModule = (function() {

	return {

		dataPoints: [],
		tooltipText_in: [],
		tooltipText_out: [],

		init: function(r) {
			this.dataPoints = r['bw'];
			this.tooltipText_in.push(this.dataPoints['formatted_in']);
			this.tooltipText_out.push(this.dataPoints['formatted_out']);
			this.chart = ChartModule.init.call(this, 'disk-bandwidth', 'line');
			this.chart.options.tooltips.callbacks = ChartModule.tooltipCallbackDual(this);
			this.chart.options.scales.yAxes[0].ticks.callback = ChartModule.ticksCallbackFormattedBytes();
			this.chart.update();
			this.diskIO.init(r['io']);
		},

		data: function() {
			return {
				datasets: [
					{
						label: 'Write',
						data: [this.dataPoints['bytes_in']],
						backgroundColor: 'rgba(218, 152, 203, .2)',
						borderColor: '#da98cb',
						pointBorderColor: '#da98cb',
						pointHoverBorderColor: '#da98cb'
					},
					{
						label: 'Read',
						data: [this.dataPoints['bytes_out']],
						backgroundColor: 'rgba(140, 211, 255, .2)',
						borderColor: '#8cd3ff',
						pointBorderColor: '#8cd3ff',
						pointHoverBorderColor: '#8cd3ff'
					}
				]
			};
		},

		options: function() {
			return ChartModule.optionsLine();
		},

		diskIO: {

			init: function(r) {

			}

		}

	};

})();

var DiskTemperatureModule = (function() {

	return {

		labels: [],
		dataPoints: [],
		tooltipText: [],

		init: function(r, tt) {
			for (let key in r) {
				this.labels.push(key);
				this.dataPoints.push(r[key]);
				this.tooltipText.push(tt[key]);
			}
			this.chart = ChartModule.init.call(this, 'disk-temps', 'horizontalBar');
			this.chart.options.tooltips.callbacks = ChartModule.tooltipCallbackTemperature(this);
			this.chart.options.scales.xAxes[0].ticks.min = 20;
			this.chart.options.scales.xAxes[0].ticks.max = 50;
			this.chart.update();
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
			return ChartModule.optionsHorizontalBar();
		}

	};

})();

var DiskUsageModule = (function() {

	return {

		labels: [],
		dataPoints: [],
		tooltipText: [],

		init: function(r) {
			for (let key in r) {
				this.labels.push(key);
				this.dataPoints.push(r[key]['used_ds']['bytes']);
				this.tooltipText.push(r[key]['used_ds']['formatted']);
			}
			this.chart = ChartModule.init.call(this, 'disk-usage', 'pie');
			App.switchViews.call(this, this.snapshotUsage, 'disk-usage', 'Dataset Usage', 'Snapshot Usage');
			this.snapshotUsage.init(r);
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
					callbacks: this.tooltipCallback()
				}
			};
		},

		tooltipCallback: function() {
			return ChartModule.tooltipCallbackPercentage(this);
		},

		snapshotUsage: {

			dataPoints: [],
			tooltipText: [],

			init: function(r) {
				for (let key in r) {
					this.dataPoints.push(r[key]['used_snap']['bytes']);
					this.tooltipText.push(r[key]['used_snap']['formatted']);
				}
			},

			tooltipCallback: function() {
				return ChartModule.tooltipCallbackPercentage(this);
			}

		}

	};

})();

var MemoryUsageModule = (function() {

	return {

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
					callbacks: ChartModule.tooltipCallbackPercentage(this)
				}
			};
		}

	};

})();

var NetworkBandwidthModule = (function() {

	return {

		dataPoints: [],
		tooltipText_in: [],
		tooltipText_out: [],

		init: function(r) {
			this.dataPoints = r['all'];
			this.tooltipText_in.push(this.dataPoints['formatted_in']);
			this.tooltipText_out.push(this.dataPoints['formatted_out']);
			this.chart = ChartModule.init.call(this, 'txrx-current', 'line');
			this.chart.options.tooltips.callbacks = ChartModule.tooltipCallbackDual(this);
			this.chart.options.scales.yAxes[0].ticks.callback = ChartModule.ticksCallbackFormattedBytes();
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
			return ChartModule.optionsLine();
		}

	};

})();

var SystemProcessesModule = (function() {

	let fields = [
		{ 'title': 'User', 'field': 'user' },
		// {'title': 'PID', 'field': 'pid'},
		{ 'title': 'Time', 'field': 'time' },
		{ 'title': 'TC', 'field': 'nlwp' },
		{ 'title': 'CPU', 'field': 'pcpu' },
		{ 'title': 'Mem', 'field': 'pmem' },
		{ 'title': 'CMD', 'field': 'comm' }
		// {'title': 'Data Size', 'field': 'dsiz'}
		// {'title': 'Elapsed', 'field': 'etimes'}
	];

	return {
		init: function(r, aux) {
			Table.createHorizontal(SystemSpecsModule.parse, 'top-processes', fields, r);
			document.querySelector('div[data-name="top-processes"]').textContent = aux + ' Total';
		}
	};

})();

var SystemSpecsModule = (function() {

	let fields = [
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
	];

	return {
		init: function(r) {
			Table.createVertical(this.parse, 'system-specs', fields, r);
		},
		parse: function(fieldValue, response) {
			return response[fieldValue.field];
		}
	};

})();

var UpsInfoModule = (function() {

	return {

		labels: [],
		dataPoints: [],
		tooltipText_in: [],
		tooltipText_out: [],

		init: function(r) {
			this.dataPoints = r;
			this.tooltipText_in.push(r['input_voltage']['actual']);
			this.tooltipText_out.push(r['battery_voltage']['actual']);
			this.chart = ChartModule.init.call(this, 'ups-info', 'line');
			this.chart.options.tooltips.callbacks = ChartModule.tooltipCallbackDual(this);
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
			return ChartModule.optionsLine();
		}
	};

})();

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
		table.classList.add('vertical');
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
		table.classList.add('horizontal');
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
				DiskTemperatureModule.init(r['disk_temps'], r['disk_info']);
				UpsInfoModule.init(r['ups_stats']);
				break;
			case 'mem':
				MemoryUsageModule.init(r['memory_usage'], r['memory_total']);
				break;
			case 'poll':
				DiskBandwidthModule.init(r['disk_io_stats']);
				NetworkBandwidthModule.init(r['txrx_current']);
				break;
			case 'init':
				SystemSpecsModule.init(r);
				SystemProcessesModule.init(r['top_processes'], r['process_count']);
				CpuLoadAverageModule.init(r['cpu_load_average'], r['cpu_frequency']);
				CpuTemperatureModule.init(r['cpu_temps']);
				DiskUsageModule.init(r['dataset_usage']);
		}
	},

	modulesUpdate: function(r, type) {
		switch (type) {
			case 'disk':
				ChartModule.replaceDataObject(DiskTemperatureModule, r['disk_temps']);
				// DiskUsageModule.init(r['dataset_usage']);
				ChartModule.updateDataObject(UpsInfoModule, r['ups_stats'], this.currentTime());
				break;
			case 'mem':
				ChartModule.replaceDataArray(MemoryUsageModule, r['memory_usage'], true);
				// MemoryUsageModule.update(r['memory_usage']);
				break;
			case 'poll':
				ChartModule.updateDataObject(DiskBandwidthModule, r['disk_io_stats']['bw'], this.currentTime());
				ChartModule.updateDataObject(NetworkBandwidthModule, r['txrx_current']['all'], this.currentTime());
				SystemProcessesModule.init(r['top_processes'], r['process_count']);
				ChartModule.updateDataPoint(CpuLoadAverageModule, r['cpu_load_average'], this.currentTime(), r['cpu_frequency']);
				ChartModule.replaceData(CpuTemperatureModule, r['cpu_temps']);
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
}
