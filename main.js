"use strict";


function Coord(x, y)
{
    this.x = x;
    this.y = y;
}
function Pixel(x, y)
{
    this.x = x;
    this.y = y;
}
function Graph(jGraph)
{
    this.jGraph = jGraph;
    this.pHeight = jGraph.height();
    this.pWidth = jGraph.width();
    this.draw = function(f, coordMinX, coordMaxX, coordMinY, coordMaxY)
    {
        this.jGraph.drawRect({
            fillStyle:"#fff",
            x: 0, y: 0,
            height: this.pHeight,
            width: this.pWidth,
            fromCenter: false,
        });
        // I guess this should be good...
        var RESOLUTION = 1000;
        var LINE_COLOR = "#000";


        this.coordMinY = coordMinY;
        this.coordMaxY = coordMaxY;
        this.coordMinX = coordMinX;
        this.coordMaxX = coordMaxX;
        if(coordMaxX < coordMinX)
        {
            this.coordMaxX = coordMinX;
            this.coordMinX = coordMaxX;
        }
        if(coordMaxY < coordMinY)
        { 
            this.coordMaxY = coordMinY;
            this.coordMinY = coordMaxY;
        }

        var xRange = this.coordMaxX - this.coordMinX;
        var yRange = this.coordMaxY - this.coordMinY;

        if(coordMaxX > 0 != coordMinX > 0)
        {
            // We have to draw the x-axis
            this.drawLine(new Coord(0, this.coordMaxY), new Coord(0, this.coordMinY), 1, LINE_COLOR);
        }
        if(coordMaxY > 0 != coordMinY > 0)
        {
            this.drawLine(new Coord(this.coordMinX, 0), new Coord(this.coordMaxX, 0), 1, LINE_COLOR);
        }

        if(f)
        {
            var lastCoord = null;
            for(var i = this.coordMinX; i < this.coordMaxX; i += xRange / RESOLUTION)
            {
                var currCoord = new Coord(i, f(i));
                this.drawLine(lastCoord, currCoord, 1, LINE_COLOR);
                lastCoord = currCoord;
            }
        }
    }
    /*
     * @param thickness The thickness of the line in pixels
     * @param color The color of the line. Any HTML-accepted color
     */
    this.drawLine = function(coord1, coord2, thickness, color)
    {
        if(!(coord1 == null || coord2 == null))
        {
            var p1 = this.pFromCoord(coord1);
            var p2 = this.pFromCoord(coord2);
            this.jGraph.drawLine({
                strokeStyle: color,
                strokeWidth: thickness,
                x1: p1.x,y1: p1.y,
                x2: p2.x, y2: p2.y,
            });
        }
    }
    /*
     * @param p This Pixel that is being converted
     * @return A Coord object that exists where the Pixel input would be.
     */
    this.coordFromP = function(p)
    {
        var pWidth = this.pWidth;
        var pHeight = this.pHeight;
        var coordHeight = this.coordMaxY - this.coordMinY;
        var coordWidth = this.coordMaxX - this.coordMinX;
        var coordOutX = ((p.x / pWidth) * (coordWidth)) + this.coordMinX;
        var coordOutY = -((p.y / pHeight) * (coordHeight)) + this.coordMaxY;
        return new Coord(coordOutX, coordOutY);
    }

    this.pFromCoord = function(coord)
    {
        var pWidth = this.pWidth;
        var pHeight = this.pHeight;
        var coordHeight = this.coordMaxY - this.coordMinY;
        var coordWidth = this.coordMaxX - this.coordMinX;
        var pOutX = ((coord.x - this.coordMinX) / coordWidth) * pWidth;
        var pOutY = ((-coord.y + this.coordMaxY) / coordHeight) * pHeight;
        return new Pixel(pOutX, pOutY);
    }
}
$(document).ready(function()
        {
            var canvas = new Graph($("#graph"));
            $("#go").click(function() 
                    {
                        var maxX = parseInt($("#maxX").val(), 10);
                        var minX = parseInt($("#minX").val(), 10);
                        var eqn = $("#mathBox").val() == "" ? null : math.compile($("#mathBox").val());

                        // I need to put something here at some point.
                        var minY = -10;
                        var maxY = 10;
                        canvas.draw(function(x){return eqn.eval({x: x})}, minX, maxX, minY, maxY);
                    });
        });
