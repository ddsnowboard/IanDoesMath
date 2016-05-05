"use strict";

var SIMPSON = "simpson";
var LEFT = "left";
var RIGHT = "right";
var CENTER = "center";
var TRAPEZOID = "trapezoid";

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
function Integration(f, coordX1, coordX2, type, slices)
{
    var THICKNESS = 1;
    var COLOR = "#f00";
    // An Integration is a list of pairs of Coords to graph, pretty much.
    this.coords = [];
    this.f = f;
    this.coordX1 = coordX1;
    this.coordX2 = coordX2;
    this.coordSliceWidth = (this.coordX2 - this.coordX1) / slices;
    this.type = type;
    this.slices = slices;
    this.total = 0;

    this.draw = function(drawFunction)
    {
        /*
         * @param drawFunction A function with the signature function(coord1, coord2, thickness, color) that draws a line of thickness thickness in color from coord1 to coord2
         */
        for(var i = 0; i < this.coords.length; i++)
        {
            drawFunction(this.coords[i][0], this.coords[i][1], THICKNESS, COLOR);
        }
    }
    if(type == LEFT)
    {
        for(var x = this.coordX1; x <= this.coordX2; x += this.coordSliceWidth)
        {
            var result = this.f(x);
            this.coords.push([new Coord(x, 0), new Coord(x, result)]);
            this.coords.push([new Coord(x, result), new Coord(x + this.coordSliceWidth, result)]);
            this.coords.push([new Coord(x + this.coordSliceWidth, result), new Coord(x + this.coordSliceWidth, 0)]);
            this.total += result * this.coordSliceWidth;
        }
    }
    else if(type == RIGHT)
    {
        for(var x = this.coordX1; x + this.coordSliceWidth <= this.coordX2; x += this.coordSliceWidth)
        {
            var result = this.f(x + this.coordSliceWidth);
            this.coords.push([new Coord(x, 0), new Coord(x, result)]);
            this.coords.push([new Coord(x, result), new Coord(x + this.coordSliceWidth, result)]);
            this.coords.push([new Coord(x + this.coordSliceWidth, result), new Coord(x + this.coordSliceWidth, 0)]);
            this.total += result * this.coordSliceWidth;
        }
    }
    else if(type == CENTER)
    {
        for(var x = this.coordX1; x + this.coordSliceWidth <= this.coordX2; x += this.coordSliceWidth)
        {
            var result = this.f(x + .5 * this.coordSliceWidth);
            this.coords.push([new Coord(x, 0), new Coord(x, result)]);
            this.coords.push([new Coord(x, result), new Coord(x + this.coordSliceWidth, result)]);
            this.coords.push([new Coord(x + this.coordSliceWidth, result), new Coord(x + this.coordSliceWidth, 0)]);
            this.total += result * this.coordSliceWidth;
        }
    }
    else if(type == TRAPEZOID)
    {
        for(var x = this.coordX1; x + this.coordSliceWidth <= this.coordX2; x += this.coordSliceWidth)
        {
            var resultLeft = this.f(x);
            var resultRight = this.f(x + this.coordSliceWidth);
            this.coords.push([new Coord(x, 0), new Coord(x, resultLeft)]);
            this.coords.push([new Coord(x, resultLeft), new Coord(x + this.coordSliceWidth, resultRight)]);
            this.coords.push([new Coord(x + this.coordSliceWidth, resultRight), new Coord(x + this.coordSliceWidth, 0)]);
            this.total += ((resultLeft + resultRight) / 2) * this.coordSliceWidth;
        }
    }
    else if(type == SIMPSON)
    {
        var RESOLUTION = 100;
        var p = function(f, a, b, x)
        {
            var m = (a + b) / 2;
            return f(a)*(((x - m)*(x - b))/(a - m)*(a - b)) + f(m)*(((x - a)*(x - b))/(m - a)*(m - b)) + f(b)*(((x - a)*(x - m))/(b - a)*(b - m)) 
        };

        for(var x = this.coordX1; x + this.coordSliceWidth <= this.coordX2; x += this.coordSliceWidth)
        {
            var b = x + this.coordSliceWidth;
            this.coords.push([new Coord(x, 0), new Coord(x, p(this.f, x, b, x))]);
            this.coords.push([new Coord(b, 0), new Coord(b, p(this.f, x, b, b))]);
            var coordWidth = (b - x) / RESOLUTION;
            for(var j = x; j + coordWidth <= b; j += coordWidth)
            {
                this.coords.push([new Coord(j, p(this.f, x, b, j)), new Coord(j + coordWidth, p(this.f, x, b, j + coordWidth))]);
            }
            this.total += ((b - x) / 6) * (this.f(x) + 4 * f((x + b) / 2) + f(b));
        }
    }
}
function Graph(jGraph)
{
    this.jGraph = jGraph;
    this.pHeight = jGraph.height();
    this.pWidth = jGraph.width();
    this.method = LEFT;
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
            this.f = f;
            var lastCoord = null;
            for(var i = this.coordMinX; i < this.coordMaxX; i += xRange / RESOLUTION)
            {
                var currCoord = new Coord(i, f(i));
                this.drawLine(lastCoord, currCoord, 1, LINE_COLOR);
                lastCoord = currCoord;
            }
            var integration = new Integration(this.f, coordMinX, coordMaxX, this.method, 30);
            integration.draw(this.drawLine.bind(this));
            $("#output").html("The result is " + integration.total);
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
            $("#right").click(function()
                    {
                        canvas.method = RIGHT;
                        $("#go").click();
                    });
            $("#left").click(function()
                    {
                        canvas.method = LEFT;
                        $("#go").click();
                    });
            $("#center").click(function()
                    {
                        canvas.method = CENTER;
                        $("#go").click();
                    });
            $("#simpson").click(function()
                    {
                        canvas.method = SIMPSON;
                        $("#go").click();
                    });
            $("#trapezoid").click(function()
                    {
                        canvas.method = TRAPEZOID;
                        $("#go").click();
                    });
        });
