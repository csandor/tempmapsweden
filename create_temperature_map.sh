#!/bin/bash
set -e
cd /home/viamap/temperature
rm -f data/new/*
curl -s http://www.temperatur.nu/gmapv3/gmap_data.php|xsltproc temps.xslt - > data/new/temps.csv
curl -s http://www.temperatur.nu/gmapv3/gmap_data.php|xsltproc temps_geojson.xslt - > web/temps.json
/usr/local/bin/gdal_grid -a invdist:power=2.0:smoothing=0.1 -txe 11.04 24.26 -tye 55.24 69.13 -outsize 1000 1000 -ot Int16 -l temps temps.vrt data/new/temps.tiff
cat begin.part>>data/new/temps_raster.vrt
./red.awk<data/new/temps.csv>>data/new/temps_raster.vrt
cat middle1.part>>data/new/temps_raster.vrt
./green.awk<data/new/temps.csv>>data/new/temps_raster.vrt
cat middle2.part>>data/new/temps_raster.vrt
./blue.awk<data/new/temps.csv>>data/new/temps_raster.vrt
cat end.part>>data/new/temps_raster.vrt
/usr/local/bin/gdalwarp -t_srs epsg:3785 -of GTiff -co "TILED=YES" -r bilinear data/new/temps_raster.vrt data/new/temps_recolor.tiff
/usr/local/bin/gdaladdo -r average data/new/temps_recolor.tiff 2 4 8 16 32 64 128 256 512 1024
/usr/local/bin/gdal_contour -a temp data/new/temps.tiff data/new/temps_contour.shp -i 1.0
/usr/local/bin/ogr2ogr -f "ESRI Shapefile" -s_srs epsg:4326 -t_srs epsg:3785 -sql "SELECT CAST(temp AS Integer) FROM temps_contour" data/new/temps_contour_gm.shp data/new/temps_contour.shp
mv -f data/new/* data/
