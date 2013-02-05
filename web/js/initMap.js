var map,googleLayer,tempLayer,tempPoints,markers;

function init(){
    map = new L.Map('map', {
		center: mapCenter,
		zoom: initZoom
	});
    googleSatLayer = new L.Google('SATELLITE');
	map.addLayer(googleSatLayer);
	googleLayer = new L.Google('ROADMAP');
	map.addLayer(googleLayer);
	tempLayer = L.tileLayer.wms(baseDomainUrl+mapserverExecutable+"?map="+mapFileLocation, {
		layers:  'sweden_temps,sweden_temps_iso',
		format:'image/png; mode=24bit',
		transparent:'true',
		opacity: initOpacity
	});
	map.addLayer(tempLayer);
	markers = new L.MarkerClusterGroup({
		maxClusterRadius: 50,
		iconCreateFunction: function (cluster) {
			var sumTemp=0;
			for (var i=0;i<cluster.getAllChildMarkers().length;i++){
				sumTemp+=parseInt(cluster.getAllChildMarkers()[i].feature.properties.temperature);
			}
			var clusterTemp=(Math.round(sumTemp/cluster.getAllChildMarkers().length)).toString();
			//console.log(clusterTemp);
			return new L.DivIcon({ html: "<div><span>"+clusterTemp+"</span></div>", className: 'marker-cluster', iconSize: new L.Point(40, 40) });
		},
		//Disable all of the defaults:
		spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: true, singleMarkerMode:true
	});
	
	//load the geojson
	$.getJSON( baseDomainUrl+appBaseDir+"temps.json",
			function(data){
				tempPoints=L.geoJson(data, {
					pointToLayer: function (feature, latlng) {
						/*var myIcon = L.icon({
							iconUrl: 'http://www.temperatur.nu/gmapv3/icons.php?temperatur='+feature.properties.temperature,
							iconSize: [25, 25],
							iconAnchor: [12,1],
							popupAnchor: [0, -2]
						});	*/			
						return L.marker(latlng/*, {icon: myIcon}*/);
					},
				    onEachFeature: function (feature, layer) {
				    	var popupContent=feature.properties.name+"<br/>"+feature.properties.temperature+" &#8451;";
	                    layer.on('mouseover', function(e){
	                        var hover_bubble = new L.Rrose({ offset: new L.Point(0,-10), closeButton: false, autoPan: false })
	                          .setContent(popupContent)
	                          .setLatLng(layer._latlng)
	                          .openOn(map);
	                    });
	                    layer.on('mouseout', function(e){ map.closePopup(); });
				    	markers.addLayer(layer);
				    	
	                    
				    }
				});
				map.addLayer(markers);
				markers.on('clustermouseover', function (a) {
					//console.log(a);
					var html="";
					if (a.layer.getAllChildMarkers().length<5) {
						var c=a.layer.getAllChildMarkers().length;
					} else {
						var c=5;
					}
					for (var i=0;i<c;i++){
						html+=a.layer.getAllChildMarkers()[i].feature.properties.name+":&nbsp;"+a.layer.getAllChildMarkers()[i].feature.properties.temperature+"&nbsp;&#8451<br/>";
					}
					html +="...";
					//console.log(html);
                    var hover_bubble = new L.Rrose({ offset: new L.Point(0,-10), closeButton: false, autoPan: false })
                      .setContent(html)
                      .setLatLng(a.layer._latlng)
                      .openOn(map);
					
				});
				markers.on('clustermouseout', function(e){ map.closePopup(); });
				var baseMaps = {
						"Google Satellite": googleSatLayer,
						"Google Streets": googleLayer
					    
					};

				var overlayMaps = {
				    "Heatmap": tempLayer
				    ,"Temperature points": tempPoints
				};
				var layers=L.control.layers(baseMaps, overlayMaps);
				map.addControl(layers);
				map.addControl(new L.Control.Permalink({text: '<img src="images/bookmark.png"/>', layers: layers, position:'bottomright'}));
			}
	);
}
