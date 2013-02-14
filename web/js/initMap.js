var map,googleLayer,tempLayer,tempPoints,markers;

function init(){
	
	$(function (){
		$( document ).tooltip();	
	});
	
    map = new L.Map('map', {
		center: mapCenter,
		zoom: initZoom
	});
    googleSatLayer = new L.Google('SATELLITE');
	//map.addLayer(googleSatLayer);
	googleLayer = new L.Google('ROADMAP');
	map.addLayer(googleLayer);
	googleHybridLayer = new L.Google('HYBRID');
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
						return L.marker(latlng);
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
	                    layer.on('click', function(e){updateInfo(feature);
	                    	}
	                    );
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
						"Google Streets": googleLayer,
						"Google Satellite": googleSatLayer,
						"Google Hybrid": googleHybridLayer
					};

				var overlayMaps = {
				    "Heatmap": tempLayer
				    ,"Temperature points": markers
				};
				var layers=L.control.layers(baseMaps, overlayMaps);
				map.addControl(layers);
				map.addControl(new L.Control.Permalink({text: '<img title="Ger dig tillgång till en url som leder till aktuell vy" src="images/book.png"/>', layers: layers, position:'bottomright'}));
				map.addControl(new L.Control.Attribution({prefix:'<a href="javascript:saveExtent()"><img id="setCookie" title="Sparar aktuell vy och gör sätter kartsidan till startsida på temperatur.nu" src="images/plus.png"/></a>', position:'bottomright'}));
				map.addControl(new L.Control.Attribution({prefix:'<a href="javascript:unSetExtent()"><img id="unSetCookie" title="Tar bort sparad vy kartan som startsida." src="images/minus.png"/></a>', position:'bottomright'}));
				map.addControl(new L.Control.Attribution({prefix:'<a href="javascript:openLegend()"><img id="openLegend" title="Öppen legend" src="images/list1.png"/></a>', position:'bottomright'}));
				loadExtent();
			}
	);
}

function updateInfo(feature){
	$.ajax({
        type: "GET",
        url: "http://www.temperatur.nu/internal_sign.php?type=map&stad="+feature.properties.alias,
        dataType: "xml",
        success: function(data) {
        	var graph=$(data).find("graph");
    		$("#mapinfo").html(
    				"<img src='"+graph[0].textContent+"' class='graph'/>" +
    				"<div class='dataPane'>"+
    				"<img title='Temperatur på den här platsen' src='images/temperature.png'/>"+feature.properties.temperature+"&#8451;"+
    				"<br /><a href='javascript:map.panTo(["+feature.geometry.coordinates[1]+","+feature.geometry.coordinates[0]+"])'><img title='Zooma in "+feature.properties.name+"' id='zoomTo' src='images/location plus.png'/></a>"+
    				"<br /><a href='javascript:map.fitBounds([[55.24,11.04],[69.13,24.26]])'><img title='Zooma ut och centrera kartan' id='zoomToExtent' src='images/picture.png'/></a>"+
    				"</div>"+
    				"<p>info@temperature.nu</p>"
    		);
    		$("#mapinfo").css("visibility","visible");
    		$( "#mapinfo" ).dialog({title:feature.properties.name,resizable:false, position:{my:"right top", at:"right top+10%", of:"#map"}});
        }
	});	
}


function saveExtent(){
	var sw="[["+map.getBounds()._southWest.lat+","+map.getBounds()._southWest.lng+"]";
	var ne="["+map.getBounds()._northEast.lat+","+map.getBounds()._northEast.lng+"]]";
	$.cookie("extent", sw+","+ne,{ expires: 100 });
}

function loadExtent(){	
	var extent=$.cookie("extent");
	if(eval(extent)){
		map.fitBounds(eval(extent));
	}	
}


function unSetExtent(){
	$.removeCookie('extent');
}


function openLegend(){
	$("#legend").css("visibility","visible");
	$( "#legend" ).dialog({width: 180, resizable:false, position:{my:"right top", at:"right top+10%", of:"#map"}});
}

