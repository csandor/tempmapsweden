<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method='text'/>
<xsl:template match="/">{ "type": "FeatureCollection",  "features": [
<xsl:for-each select="rss/markers/marker[@temperature!=' ?']">
<xsl:sort data-type="number" select="@temperature"/>
{ "type": "Feature", "geometry": {"type": "Point", "coordinates": [<xsl:value-of select="@lng"/>,<xsl:value-of select="@lat"/>]},
"properties": {
		"name": "<xsl:value-of select="@name"/>",
        "alias": "<xsl:value-of select="@alias"/>",
		"id": "<xsl:value-of select="@id"/>",
		"color": "#<xsl:value-of select="@color"/>",
		"temperature":"<xsl:value-of select="@temperature"/>"
<xsl:choose>
  <xsl:when test="position() = last()">
 }}
  </xsl:when>
  <xsl:otherwise>
 }},
  </xsl:otherwise>
</xsl:choose>
 <xsl:text>
</xsl:text>
</xsl:for-each>
]}
</xsl:template>
</xsl:stylesheet>