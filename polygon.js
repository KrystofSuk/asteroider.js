/*
    Made by Kryštof Šuk 2017
     _   __               _         __   _____       _    
    | | / /              | |       / _| /  ___|     | |   
    | |/ / _ __ _   _ ___| |_ ___ | |_  \ `--. _   _| | __
    |    \| '__| | | / __| __/ _ \|  _|  `--. \ | | | |/ /
    | |\  \ |  | |_| \__ \ || (_) | |   /\__/ / |_| |   < 
    \_| \_/_|   \__, |___/\__\___/|_|   \____/ \__,_|_|\_\
                 __/ |                                    
                |___/                         
                
    Feel free to use it anywhere you want especially games like asteroids :)
*/

var scal = 5; //scope of canvas
var polygons = []; //array of our polygons
var TO_RADIANS = Math.PI / 180; //math funcion
var fps, fpsInterval, startTime, now, then, elapsed, time;
var sizeRandom = 1; //size random for size differentions
var polygonSpeed = 0.25; //speed of movement
var polygonRotationSpeed = 0.05; //rotation speed of polygon
var polygonPoints = 8; //number of vertexies
//function for right frame requests
function draw() {
    requestAnimationFrame(draw);
    var now = new Date().getTime()
        , dt = now - (time || now);
    time = now;
    updateGameArea();
}
//our game area
var myGameArea = {
    canvas: document.createElement("canvas") //simple creation of canvas
        
    , start: function () {
        //some canvas parameters
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.canvas.background = "black";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        var ctx = myGameArea.context;
        ctx.imageSmoothingEnabled = true;
        ctx.scale(scal, scal); //setting our scope
        //generating our polygons
        GenerateMovingPolygon(80, 20, 80, 80, polygonSpeed, polygonRotationSpeed, 5); //moving polygon
        GenerateStaticPolygon(50, 50, polygonRotationSpeed, 5); //static rotating polyhon
        GenerateStaticPolygon(20, 50, 0, 5); //static polygon without rotation
        draw(); //calling frame calculation
    }
    , clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); //standart clearing of our canvas
    }
}
myGameArea.start(); //starting our area
//generating moving polygon
function GenerateMovingPolygon(targetPosX, targetPosY, localPosX, localPosY, speed, rotationSpeed, size) {
    var theta = Math.atan2(targetPosY - localPosY, targetPosX - localPosX); //angle to our target position
    polygons.push(new MovingPolygon(size, theta, polygonPoints, localPosX, localPosY, speed, rotationSpeed)); //creating polygon
}
//generating static polygon
function GenerateStaticPolygon(localPosX, localPosY, rotationSpeed, size) {
    polygons.push(new StaticPolygon(size, polygonPoints, localPosX, localPosY, rotationSpeed)); //creating polygon
}
//moving polygon
function MovingPolygon(radius, angle, parts, positionX, positionY, speed, rotationSpeed) {
    this.radius = radius;
    this.angleOfMovement = angle;
    this.positionX = positionX;
    this.positionY = positionY;
    this.speed = speed;
    this.points = parts;
    this.pointsArrayX = [];
    this.pointsArrayY = [];
    this.pointsArrayAngles = [];
    this.rotationSpeed = rotationSpeed;
    this.currentAngle = 0;
    this.polygon = [];
    //generating our verticies
    for (var i = 0; i <= this.points; i++) {
        var angle = ((Math.PI * 2) / this.points) * i; //setting up our angle
        
        //setting up angle with randomines where vertex is = not so symmetrical poltgon
        //var angle = ((Math.PI * 2) / this.points) * i + Math.floor((Math.random() * ((Math.PI * 2) / this.points) / 4) + ((Math.PI * 2) / this.points);          
        
        var range = (Math.random() * sizeRandom) + this.radius; //radius of our vertexes depending on our minimum scale and max sizeRandom
        
        var tempX = (Math.sin(angle) * range); //saving our vertex X
        var tempY = (Math.cos(angle) * range); //saving our vertex Y
        
        this.pointsArrayX.push(tempX); //adding position to array of our vertices
        this.pointsArrayY.push(tempY); //adding position to array of our vertices
        this.pointsArrayAngles.push(angle); //adding angle to array of our angle
    }
    //updating our polygon
    this.update = function () {
        ctx = myGameArea.context;
        
        
        ctx.save();//saving cavas before rotation
        
        ctx.beginPath();//start of drawing
        
        ctx.moveTo(this.pointsArrayX[0] + this.positionX, this.pointsArrayY[0] + this.positionY); //moving pen to world position of our first vertex
        
        this.polygon = []; //reseting our polygon points
        
        for (var i = 0; i < this.points; i++) {
            ctx.lineTo(this.pointsArrayX[i] + this.positionX, this.pointsArrayY[i] + this.positionY); //drawing another vertex
            this.polygon.push([this.pointsArrayX[i] + this.positionX, this.pointsArrayY[i] + this.positionY]); //pushing world position of point to polygon[]
        }
        ctx.closePath(); //stop drawing
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#fff";
        ctx.fill(); //filling polygon
        ctx.stroke(); //outlining polygon
        ctx.restore(); //restoring our saved canvas
        this.move(); //calling move function
    }
    this.move = function () {
        this.positionX = this.speed * Math.cos(this.angleOfMovement) + this.positionX; //next position X
        this.positionY = this.speed * Math.sin(this.angleOfMovement) + this.positionY; //next position Y
        canvas = myGameArea.canvas;
        
        this.currentAngle += this.rotationSpeed; //new angle after rotating
        
        //checking overflow 
        if (this.currentAngle > Math.PI * 2) {
            this.currentAngle -= Math.PI * 2;
        }
        if (this.currentAngle < -Math.PI * 2) {
            this.currentAngle += Math.PI * 2;
        }
        
        for (var i = 0; i <= this.points; i++) {
            var rang = Math.sqrt((this.pointsArrayX[i] * this.pointsArrayX[i]) + (this.pointsArrayY[i] * this.pointsArrayY[i])); //distance of our vertex from center of our polygon
            var tempX = (Math.sin(this.currentAngle + this.pointsArrayAngles[i]) * rang); //rotating of our vertex to new angle
            var tempY = (Math.cos(this.currentAngle + this.pointsArrayAngles[i]) * rang); //rotating of our vertex to new angle
            this.pointsArrayX[i] = tempX; //saving position X
            this.pointsArrayY[i] = tempY; //saving position Y
        }
    }
}

function StaticPolygon(radius, parts, positionX, positionY, rotationSpeed) {
    this.radius = radius;
    this.angleOfMovement = angle;
    this.positionX = positionX;
    this.positionY = positionY;
    this.points = parts;
    this.pointsArrayX = [];
    this.pointsArrayY = [];
    this.pointsArrayAngles = [];
    this.rotationSpeed = rotationSpeed;
    this.currentAngle = 0;
    this.polygon = [];
    //generating our verticies
    for (var i = 0; i <= this.points; i++) {
        var angle = ((Math.PI * 2) / this.points) * i; //setting up our angle
        
        //setting up angle with randomines where vertex is = not so symmetrical poltgon
        //var angle = ((Math.PI * 2) / this.points) * i + Math.floor((Math.random() * ((Math.PI * 2) / this.points) / 4) + ((Math.PI * 2) / this.points);          
        
        var range = (Math.random() * sizeRandom) + this.radius; //radius of our vertexes depending on our minimum scale and max sizeRandom
        
        var tempX = (Math.sin(angle) * range); //saving our vertex X
        var tempY = (Math.cos(angle) * range); //saving our vertex Y
        
        this.pointsArrayX.push(tempX); //adding position to array of our vertices
        this.pointsArrayY.push(tempY); //adding position to array of our vertices
        this.pointsArrayAngles.push(angle); //adding angle to array of our angle
    }
    //updating our polygon
    this.update = function () {
        ctx = myGameArea.context;
        
        
        ctx.save();//saving cavas before rotation
        
        ctx.beginPath();//start of drawing
        
        ctx.moveTo(this.pointsArrayX[0] + this.positionX, this.pointsArrayY[0] + this.positionY); //moving pen to world position of our first vertex
        
        this.polygon = []; //reseting our polygon points
        
        for (var i = 0; i < this.points; i++) {
            ctx.lineTo(this.pointsArrayX[i] + this.positionX, this.pointsArrayY[i] + this.positionY); //drawing another vertex
            this.polygon.push([this.pointsArrayX[i] + this.positionX, this.pointsArrayY[i] + this.positionY]); //pushing world position of point to polygon[]
        }
        ctx.closePath(); //stop drawing
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#fff";
        ctx.fill(); //filling polygon
        ctx.stroke(); //outlining polygon
        ctx.restore(); //restoring our saved canvas
        this.rotate(); //calling move function
    }
    this.rotate = function () {
        this.currentAngle += this.rotationSpeed; //new angle after rotating
        
        //checking overflow 
        if (this.currentAngle > Math.PI * 2) {
            this.currentAngle -= Math.PI * 2;
        }
        if (this.currentAngle < -Math.PI * 2) {
            this.currentAngle += Math.PI * 2;
        }
        
        for (var i = 0; i <= this.points; i++) {
            var rang = Math.sqrt((this.pointsArrayX[i] * this.pointsArrayX[i]) + (this.pointsArrayY[i] * this.pointsArrayY[i])); //distance of our vertex from center of our polygon
            var tempX = (Math.sin(this.currentAngle + this.pointsArrayAngles[i]) * rang); //rotating of our vertex to new angle
            var tempY = (Math.cos(this.currentAngle + this.pointsArrayAngles[i]) * rang); //rotating of our vertex to new angle
            this.pointsArrayX[i] = tempX; //saving position X
            this.pointsArrayY[i] = tempY; //saving position Y
        }
    }
}

//our loop
function updateGameArea() {
    myGameArea.clear(); //clearing
    for (var i = 0; i < polygons.length; i++) {
        polygons[i].update(); //updating poygon
    }
}