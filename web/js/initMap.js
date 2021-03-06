var map,googleLayer,tempLayer,tempPoints,markers,layers;

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
	//map.addLayer(googleLayer);
	googleHybridLayer = new L.Google('HYBRID');
	tempLayer = L.tileLayer.wms(baseDomainUrl+mapserverExecutable+"?map="+mapFileLocation, {
		layers:  'sweden_temps,sweden_temps_iso,sweden',
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
		spiderfyOnMaxZoom: true, 
		showCoverageOnHover: false, 
		zoomToBoundsOnClick: true, 
		singleMarkerMode:true,
		spiderfyDistanceMultiplier:5
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
				layers=L.control.layers(baseMaps, overlayMaps);
				map.addControl(layers);
				map.addControl(new L.Control.Attribution({prefix: '<a href="javascript:createBookmark()"><img title="Ger dig tillgång till en url som leder till aktuell vy" src="images/book.png"/></a>', position:'bottomright'}));
				map.addControl(new L.Control.Attribution({prefix:'<a href="javascript:saveExtent()"><img id="setCookie" title="Sparar aktuell vy och gör sätter kartsidan till startsida på temperatur.nu" src="images/plus.png"/></a>', position:'bottomright'}));
				map.addControl(new L.Control.Attribution({prefix:'<a href="javascript:unSetExtent()"><img id="unSetCookie" title="Tar bort sparad vy kartan som startsida." src="images/minus.png"/></a>', position:'bottomright'}));
				map.addControl(new L.Control.Attribution({prefix:'<a href="javascript:openLegend()"><img id="openLegend" title="Öppen legend" src="images/list1.png"/></a>', position:'bottomright'}));
				//If cookie is set load extent from cookie
				loadExtent();
				$("#mapinfo").dialog({ autoOpen: false });
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
    				"<br /><a href='javascript:panToWrapper("+feature.geometry.coordinates[1]+","+feature.geometry.coordinates[0]+");'><img title='Zooma in "+feature.properties.name+"' id='zoomTo' src='images/location plus.png'/></a>"+
    				"<br /><a href='javascript:fitBoundsWrapper();'><img title='Zooma ut och centrera kartan' id='zoomToExtent' src='images/picture.png'/></a>"+
    				"</div>"+
    				"<p>info@temperature.nu</p>"+
    				"<p id='featalias' style='display:none;'>"+feature.properties.alias+"</p>"
    		);
    		//$("#mapinfo").dialog( "option", "autoOpen", true );
    		$( "#mapinfo" ).dialog({autoOpen:true,title:feature.properties.name,resizable:false, position:{my:"right top", at:"right top+10%", of:"#map"}});
        },
	    error:function(){alert("Cross domain AJAX request failed!");}
	});
}

function panToWrapper(lat,lon){
	map.setView([lat,lon],13);
}

function fitBoundsWrapper(){
	map.fitBounds([[55.24,11.04],[69.13,24.26]]);
}


function saveExtent(){
	var sw="[["+map.getBounds()._southWest.lat+","+map.getBounds()._southWest.lng+"]";
	var ne="["+map.getBounds()._northEast.lat+","+map.getBounds()._northEast.lng+"]]";
	$.cookie("extent", sw+","+ne,{ expires: 100 });
	if ($("#mapinfo").dialog("isOpen")){
		var alias=$("#featalias").html();
		$.cookie("alias",alias,{ expires: 100 });
	} else {
		$.removeCookie('alias');
	}
	
	
	toast("Kartvyn har sparats");	
}

function loadExtent(){
	
	var extent=$.cookie("extent");
	
	//If url parameters are set load extent from url parameters
	var a=window.location.hash.slice(1).split("&");
	var params=Object;
	
	if (a!=""){
		//Parse url parameters
		//Set map view and zoom
		for (var i=0;i<a.length;i++){
			params[a[i].split("=")[0]]=a[i].split("=")[1];
		}
		//map.setView(new L.LatLng(params.lat, params.lon), params.zoom);
		//Set default baselayer
		for (var lay in layers._layers){
			if (!layers._layers[lay].overlay && !map.hasLayer(layers._layers[lay].layer) && layers._layers[lay].name==params.layer ){
				map.addLayer(layers._layers[lay].layer);
			} else if (!layers._layers[lay].overlay && map.hasLayer(layers._layers[lay].layer)) {
				map.removeLayer(layers._layers[lay].layer);
			}
		}		
	} else {
		map.addLayer(googleHybridLayer);
	}
	
	if (params.lat && params.lon && params.zoom){
		map.setView(new L.LatLng(params.lat, params.lon), params.zoom);
		if (params.alias){
			var feature=getFeatureByAlias(params.alias);
			updateInfo(feature);
		}
	} else if(eval(extent)){
		map.fitBounds(eval(extent));
		if ($.cookie("alias")){
			var feature=getFeatureByAlias($.cookie("alias"));
			updateInfo(feature);
		}
	}	
}

function getFeatureByAlias(alias){
	for (var feature in tempPoints._layers){
		if (tempPoints._layers[feature].feature.properties.alias==alias) return tempPoints._layers[feature].feature;
	}
	return false;
}


function unSetExtent(){
	$.removeCookie('extent');
	$.removeCookie('alias');
	toast("Sparade kartvy bort");
}

function toast(toastText){
	//$("#toast").css("visibility","visible");
	$( "#toast" ).dialog({
		  title:toastText,
		  resizable:false, 
		  height:0,
		  position:{my:"centre", at:"centre", of:"#map"},
		  show: {
   	        effect: "fade",
   	        duration: 200
   	      },
   	      hide: {
   	          effect: "fade",
   	          duration: 200
   	      },
   	      dialogClass: "no-close",
   	     });
	$("#toast.ui-dialog-content").css("display","none");
	setTimeout(function(){
		$("#toast").dialog("close");
	},700);
}


function openLegend(){
	//$("#legend").css("visibility","visible");
	$( "#legend" ).dialog({width: 180, resizable:false, position:{my:"right top", at:"right top+10%", of:"#map"}});
}


function createBookmark(){
	var center = _round_point(map.getCenter());
	var zoom=map.getZoom();
	var currLayer="";
	for (var lay in layers._layers){
		if (!layers._layers[lay].overlay && map.hasLayer(layers._layers[lay].layer)){
			var currLayer=currLayer+layers._layers[lay].name;
		}
	}
	if ($("#mapinfo").dialog("isOpen")){
		var alias=$("#featalias").html();
	}
	var url=window.location.href.split('#')[0]+"#lat="+center.lat+"&lon="+center.lng+"&zoom="+zoom+"&layer="+currLayer;
	if (alias) url += "&alias="+alias;
	var link="<a href='"+url+"' target='_blank'><img title='Verkställ url (öppnar urlen i nuvarande fönster)' src='images/tick2.png'/></a>";
	link+="<a href='javascript:bookmarkurl(\""+url+"\")'><img title='Bokmärk url/lägg till url i favoriter' src='images/book.png'/></a><br/>";
	link+="<input id='bmurl' type='text' value='"+url+"' readonly='readonly'/><br/>";
	link+="Klicka i fältet nedan och tryck CTRL-C för att kopiera adressen";
	$("#bookmark").html(link);
	$("#bookmark").dialog({resizable:false, position:{my:"right bottom", at:"right bottom-25%", of:"#map"}});
	$("#bmurl").focus();
	$("#bmurl").select();
}


function _round_point (point) {
	var bounds = map.getBounds(), size = map.getSize();
	var ne = bounds.getNorthEast(), sw = bounds.getSouthWest();

	var round = function (x, p) {
		if (p == 0) return x;
		shift = 1;
		while (p < 1 && p > -1) {
			x *= 10;
			p *= 10;
			shift *= 10;
		}
		return Math.floor(x)/shift;
	}
	point.lat = round(point.lat, (ne.lat - sw.lat) / size.y);
	point.lng = round(point.lng, (ne.lng - sw.lng) / size.x);
	return point;
}


function bookmarkurl(url) {
    title = "Karta på temperatur.nu";
    if (window.sidebar) // firefox
            window.sidebar.addPanel(title, url, "");
    else if(window.opera && window.print){ // opera
            var elem = document.createElement('a');
            elem.setAttribute('href',url);
            elem.setAttribute('title',title);
            elem.setAttribute('rel','sidebar');
            elem.click();
    }
    else if(document.all)// ie
            window.external.AddFavorite(url, title);
	else // for other browsers which does not support
	   { 
	        alert('Please hold CTRL+D and click the link to bookmark it in your browser.');
	   }
}
