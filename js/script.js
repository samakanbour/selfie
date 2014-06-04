$(document).ready(function () {
	init();
	setTimeout(function () {
		$('.odometer').html(327012);
	}, 1000);
});

var map;

function init() {
	Tabletop.init({
		key: "0AhtG6Yl2-hiRdFF1d21nVnVmQmp5X25ha0hzbTV1OFE",
		callback: initData
	});
}

function day(){
	this.date = null;
	this.spending = null;
	this.steps = null;
	this.longitude = null;
	this.latitude = null;
	this.location = null;
}

function initData(result) {
	google.maps.event.addDomListener(window, 'load', initMap);
	function initMap() {
		var styles = [{
			stylers: [{
				hue: "#00ffe6"
			}, {
				saturation: -20
			}]
		}, {
			featureType: "road",
			elementType: "geometry",
			stylers: [{
				lightness: 100
			}, {
				visibility: "simplified"
			}]
		}, {
			featureType: "road",
			elementType: "labels",
			stylers: [{
				visibility: "off"
			}]
		}, {
			featureType: "administrative",
			elementType: "labels",
			stylers: [{
				visibility: "off"
			}]
		}];
		var styledMap = new google.maps.StyledMapType(styles, {
			name: "Styled Map"
		});
		var mapOptions = {
			zoom: 11,
			disableDefaultUI: true,
			center: new google.maps.LatLng(40.4857, -79.9700)
		}
		map = new google.maps.Map($('#map')[0], mapOptions);
		map.mapTypes.set('map_style', styledMap);
		map.setMapTypeId('map_style');
		addMarkers(result.map.elements, true);
		addGraph(result.data.elements);
	}
}

function addGraph(result) {
	var data = {};
	var chartData = [{
		key: 'Steps',
		values: [],
		type: 'bar',
		yAxis: 2
	}, {
		key: 'Spending',
		values: [],
		type: 'line',
		yAxis: 1
	}];
	result.forEach(function (row) {
		var d = new day();
		d.date = row.date;
		d.steps = row.steps;
		d.spending = row.spending;
		d.longitude = row.longitude;
		d.latitude = row.latitude;
		d.location = row.location;
		data[row.id] = d;
		chartData[0].values.push({
			x: parseInt(row.id),
			y: parseInt(row.steps)
		});
		chartData[1].values.push({
			x: parseInt(row.id),
			y: parseInt(row.spending)
		});
	});
	nv.addGraph(function () {
		var chart = nv.models.multiChart()
			.margin({
				top: 20,
				right: 30,
				bottom: 3,
				left: 30
			})
			.color(["rgba(0, 255, 230, .4)", "rgba(180, 219, 216, 1)"]);
		d3.select('#chart')
			.datum(chartData)
			.transition().duration(500).call(chart);
		return chart;
	}, function(){
		d3.selectAll(".nv-bar").on('click', function(e){
			$('.odometer').html(data[e.x].steps);
			$('article').css('display','block');
			$('#intro').css('display','none');	
			$('#day').html(data[e.x].date.split('/').join('.'));
			$('#pin').html(data[e.x].location);
			$('#usd').html(data[e.x].spending);
			$('#steps').html(data[e.x].steps);
			if (data[e.x].latitude != 0) {
				zoom(20, new google.maps.LatLng(data[e.x].latitude, data[e.x].longitude), map);	
			} else {
				zoom(11, new google.maps.LatLng(40.4857, -79.9700), map);	
			}	
		});
	});
}

function addMarkers(data, cluster) {
	markers = [];
	var icon = {
		url: 'img/marker.png',
		size: new google.maps.Size(15, 21),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(7, 10)
	};
	data.forEach(function (row) {
		var marker = new google.maps.Marker({
			map: map,
			icon: icon,
			position: new google.maps.LatLng(row.latitude, row.longitude),
			title: row.title
		});
		google.maps.event.addListener(marker, 'click', function () {
			zoom(20, this.getPosition(), map);
		});
		markers.push(marker);
	});
	if (cluster) {
		var markerCluster = new MarkerClusterer(map, markers, {
			styles: [{
				url: 'img/circle.png',
				height: 42,
				width: 42
			}]
		});
	}
}

function zoom(n, position) {
	var z = map.getZoom();
	if (z < n) {
		z += 1;
		map.setZoom(z);
		setTimeout(function () {
			zoom(n, position)
		}, 50);
		map.setCenter(position);
	} else if (z > n) {
		z -= 1;
		map.setZoom(z);
		setTimeout(function () {
			zoom(n, position)
		}, 50);
		map.setCenter(position);
	} else {
		map.setCenter(position);
	}
}