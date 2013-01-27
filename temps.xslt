<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method='text'/>
<xsl:template match="/">y,x,z
<xsl:for-each select="rss/markers/marker[@temperature!=' ?']">
<xsl:sort data-type="number" select="@temperature"/>
<xsl:value-of select="@lat"/>,<xsl:value-of select="@lng"/>,<xsl:value-of select="@temperature"/>
<xsl:text>
</xsl:text>
</xsl:for-each>
</xsl:template>
</xsl:stylesheet>