var canvas = document.getElementById('main'); 
var ctx = canvas.getContext('2d'); 

var spacecraft = {
    x: 100,
    y: canvas.height-100,
    width: 50, 
    height: 50, 
    counter: 0
}

var game = {
    state: 'starting'
};

var answareText = {
    counter: -1,
    title: '',
    subtitle: ''
}

var keyboard = {};

var shots =[];

var enemies = [];

var shotsEnemies = []; 

var background;

function loadMedia(){
    background = new Image();
    background.src = 'img/space.jpg'; 
    background.onload = function(){
       var interval = window.setInterval(frameLoop,1000/55); 
    }
}

function drawEnemies(){
    for(var i in enemies){
		var enemy = enemies[i];
		ctx.save();
		if(enemy.state == 'live'){
            ctx.fillStyle = 'red';
        } 
		if (enemy.state == 'died'){
            ctx.fillStyle = 'black';
        } 
		ctx.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);
	}
}

function drawBackground(){
    ctx.drawImage(background,0,0); 
}

function drawSpacecraft() {
    ctx.save();
    ctx.fillStyle = 'white'; 
    ctx.fillRect(spacecraft.x, spacecraft.y, spacecraft.width, spacecraft.height);
    ctx.restore();
}

function addKeyboardEvents(){
    //key pressed to true
    addEvents(document, "keydown", function(e){
        keyboard[e.keyCode] = true;
        //console.log(e.keyCode);
    })

    //key no longer pressed to false
    addEvents(document, "keyup", function(e){
        keyboard[e.keyCode] = false; 
    })

    function addEvents(element, nameEvent, functions){
        if(element.addEventListener){
            element.addEventListener (nameEvent, functions, false); 
        }else if (element.attachEvent){
            element.attachEvent(nameEvent, functions);
        }
    }
}

function moveSpacecraft(){
    if(keyboard[37]){
        //left
        spacecraft.x -=5;
        if(spacecraft.x < 0) spacecraft.x=0;  
    }

    if(keyboard[39]){
        //right
        var lim = canvas.width - spacecraft.width; 
        spacecraft.x +=5;
        if(spacecraft.x > lim) spacecraft.x=lim;  
    }
    
    if(keyboard[32]){
        if(!keyboard.fire){
            fire();
            keyboard.fire = true; 
        }
    }
    if(!keyboard[32]){
        keyboard.fire = false; 
    }
    else keyboard.fire = false; 
    if(spacecraft.state == 'hit'){
        spacecraft.counter++;
        if(spacecraft.counter >= 20){
            spacecraft.counter = 0; 
            spacecraft.state = 'died'; 
            game.state = 'over';
            answareText.title = 'Game Over!!'; 
            answareText.subtitle = 'Press R to continue';
            answareText.counter = 0;
        }
    }
}

function moveShots(){
    for(var i in shots){
       var shot =  shots[i]; 
       shot.y -= 2;
    }
    shots = shots.filter(function(shot){
        return shot.y > 0;
    });
}

function drawShotsEnemies(){
    for(var i in shotsEnemies){
        var shot = shotsEnemies[i];
        ctx.save(); 
        ctx.fillStyle = 'yellow';
        ctx.fillRect(shot.x, shot.y, shot.width, shot.height); 
        ctx.restore();
    } 
}

function moveShotsEnemies(){
    for(var i in shotsEnemies){
        var shot = shotsEnemies[i];
            shot.y += 3;
    }
    shotsEnemies = shotsEnemies.filter(function(shot){
        return shot.y < canvas.height;
    });
}

function updateEnemies(){
    function addShotsEnemies(enemy){
        return {
            x: enemy.x, 
            y: enemy.y, 
            width: 10,
            height: 33, 
            cont: 0
        }
    }
    if(game.state == 'starting'){
        for(var i=0; i < 10; i++){
            enemies.push({
                x:10 + (i*50),
                y:10,
                height:40,
                width:40,
                state:'live', 
                cont: 0
                
            });
        }
        game.state = 'playing';
    }
    for(var i in enemies){
        var enemy = enemies[i];
        if(!enemy) continue; 
        if(enemy && enemy.state == 'live'){
            enemy.cont++; 
            enemy.x += Math.sin(enemy.cont * Math.PI /90)*5; 

            if(aleatory(0,enemies.length * 10) == 4){
                shotsEnemies.push(addShotsEnemies(enemy));
            }
        }
        if(enemy && enemy.state == 'hit'){
            enemy.cont++; 
            if(enemy.cont >= 20){
                enemy.state = 'died';
                enemy.cont = 0;
            }
        }
    }
    enemies = enemies.filter(function(enemy){
        if(enemy && enemy.state != 'died') return true; 
        return false;
    });
}

function fire(){
    shots.push({
        x: spacecraft.x + 20,
        y: spacecraft.y - 10,
        width: 10, 
        height: 30
    });
}

function drawShots(){
    ctx.save();
    ctx.fillStyle = 'white'; 
    for(var i in shots){
        var shot = shots[i];
        ctx.fillRect(shot.x, shot.y, shot.width, shot.height); 
    }
    ctx.restore(); 
}

function drawText(){
    if(answareText.counter == -1) return;
    var alpha = answareText.counter/50.0; 
    if(alpha>1){
        for(var i in enemies){
            delete enemies[i];
        }
    }
    ctx.save();
    ctx.globalAlpha = alpha; 
    if(game.state == 'over'){
        ctx.fillStyle = 'white'; 
        ctx.font = 'Bold 40pt Arial'; 
        ctx.fillText(answareText.title, 140, 200);
        ctx.font = '14pt Arial'; 
        ctx.fillText(answareText.subtitle, 190, 250); 
    }
    if(game.state == 'win'){
        ctx.fillStyle = 'white'; 
        ctx.font = 'Bold 40pt Arial'; 
        ctx.fillText(answareText.title, 140, 200);
        ctx.font = '14pt Arial'; 
        ctx.fillText(answareText.subtitle, 190, 250); 
    }
}

function updateStateGame(){
    if(game.state == 'playing' && enemies.length == 0){
       game.state = 'win'; 
       answareText.title = 'You Win!!'; 
       answareText.subtitle = 'Press R to continue';
       answareText.counter = 0;
    }
    if(answareText.counter >= 0){
        answareText.counter++; 
    }
    if(game.state == 'over' || game.state == 'win' && keyboard[82]){
        game.state = 'starting'; 
        spacecraft.state = 'live'; 
        answareText.counter = -1; 
    }
}

function hit(a, b){
    var hit = false;
    if(b.x + b.width >= a.x && b.x < a.x + a.width){
        if(b.y + b.height >= a.y && b.y < a.y + a.height){
            hit = true; 
        }
    }
    if(b.x <= a.x && b.x + b.width >= a.x + a.width){
        if(b.y >= a.y && b.y + b.height >= a.y + a.height){
            hit = true; 
        }
    }
    if(a.x <= b.x && a.x + a.width >= b.x + b.width){
        if(a.y >= b.y && a.y + a.height >= b.y + b.height){
            hit = true; 
        }
    }
    return hit;
}

function verifyContact(){
    for(var i in shots){
        var shot = shots[i];
        for (var j in enemies){
            var enemy = enemies[j];
            if(hit(shot, enemy)){
                enemy.state = 'hit';
                enemy.cont = 0;   
            }
        }
    }
    if(spacecraft.state == 'hit' || spacecraft.state == 'died'){
        return;
    }
    for(var i in shotsEnemies){
        var shot = shotsEnemies[i];
        if(hit(shot,spacecraft)){
            spacecraft.state = 'hit'; 
        }
    }
}

function aleatory (lower, higher){
    var odds = higher - lower;
    var a = Math.random() * odds;
    a = Math.floor(a);
    return parseInt(lower) + a; 
}

function frameLoop(){
    updateStateGame();
    moveSpacecraft();
    updateEnemies();
    moveShots(); 
    moveShotsEnemies();
    drawBackground();
    verifyContact(); 
    drawEnemies();
    drawShotsEnemies();
    drawShots(); 
    drawSpacecraft();
    drawText();
}

loadMedia(); 
addKeyboardEvents(); 