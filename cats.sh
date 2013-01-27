#!/bin/bash
if [ -f "data/temps_raster.vrt" ]; then
    rm data/temps_raster.vrt 
fi
cat begin.part>>data/temps_raster.vrt
