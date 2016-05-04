window.onload = function(){
    var mathBox = document.getElementById("mathBox");
    mathBox.onfocus = function() 
    {
        this.setAttribute("value", "");
    };
};
