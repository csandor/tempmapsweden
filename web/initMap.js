var map;

function init() {
    map = new OpenLayers.Map({
        div: "map",
        allOverlays: true,
		restrictedExtent: new OpenLayers.Bounds(1228967.178, 7408079.864, 2700154.132, 10791288.160),
    });
    var gmap = new OpenLayers.Layer.Google("Google Streets");
	map.addLayers([gmap]);
	var tempLayer = new OpenLayers.Layer.WMS( "Temperature","http://viamap.dyndns.org:81/cgi-bin/mapservEcw?map=/home/viamap/temperature/temps.map", {
		layers:  ['sweden_temps','sweden_temps_iso'],
		format:'image/png; mode=24bit',
		transparent:true,
		srs: 'epsg:900913'
		},
		{baseLayer:false,
		displayOutsideMaxExtent:true,
		opacity:0.7
		} );
    map.addLayer(tempLayer);
    // note that first layer must be visible
    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();
}