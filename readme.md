Temperature map creation
========================

Dependencies
------------

- Gdal/Ogr
- xsltproc
- awk
- Mapserver
- Apache or other webserver
- Cron or other command scheduler

List of files
-------------

###create_temperature_map.sh
This is the bash script run from cron that is converting the downloaded rss feed to a colored map.

###*.part files
Static parts of gdal virtual raster config.

###*.awk
AWK scripts for calculating color codes from max-min temperatures that is applied as a look-up-table to the image. 3 bands: red,green,blue.

###temp.map
Mapserver ([mapserver.org]) configuration (mapfile) for serving the colored image as a WMS service overlay

###temps.vrt
Gdal virtual raster config file for the transformed lat/lon/temperature data

###temps.xslt
XSLT style sheet to transform downloaded xml data to lat/lon/temperature format





