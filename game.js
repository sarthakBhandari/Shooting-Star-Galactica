/*CHECKLIST
CREATE PLAYER
SHOOT PROJECTILES
CREATE ENEMIES
ENEMY PROJECTILE COLLIISION DETECTION
ENEMY PLAYER COLLISION DETECTION
REMOVE OFF SCREEN PROJECTILES
COLORIZE GAME
SHRINK ENEMIES ON HIT
CREATE PARTICLE EXPLOSION ON HIT
ADD SCORE
END GAME UI
MAKE FUNCTIONAL RESTART BUTTON*/



const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreEL = document.getElementById("scoreEL");
const startBtn = document.querySelector(".button");
const endScreen = document.querySelector(".end-container");
const endScore = document.getElementById("end-score");

//SETTING CANVAS SIZE
canvas.height = window.innerHeight;
canvas.width = innerWidth; // you dont need window. for window objects
// BY DEFAULT BODY HAS A MARGIN OF 8PX -- lets remove that in style file
const x = canvas.width;
const y = canvas.height;


//Center Player
class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}



//Projectiles
// array containing the projectiles
class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw()
        
        this.x = this.x + this.velocity.x;
        this.y += this.velocity.y;
    }
}


//Creating enemies
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw()
        
        this.x = this.x + this.velocity.x;
        this.y += this.velocity.y;
    }
}


//CREATING PARTICLES
const friction = 0.99;
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw(){
        //we want particles to fade - this is how u edit values like alpha using canvas
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore()
    }

    update(){
        this.draw()
        
        this.x = this.x + this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;

        //SLOWING DOWN THE PARTICLES
        this.velocity.x *= friction;
        this.velocity.y *= friction;

    }
}


let player = new Player(x/2,y/2, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0
//INITIALIZING
function init(){
    player = new Player(x/2,y/2, 10, "white");
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEL.innerText = score;
}


//MAKING ENEMIES
function spawnEnemies(){
    setInterval(()=>{
        let yt, xt;
        //random size enemies
        const radius = Math.random()*(30-4) + 4;
        //we want enemies to spawn from either left, right, top or left side of the screen
        if(Math.random() < 0.5){
            xt = Math.random() < 0.5 ? 0-radius : x+radius;
            yt = y*Math.random() 
        }else{
            yt = Math.random() < 0.5 ? 0-radius : y+radius;
            xt = x*Math.random();
        }
        const angle = Math.atan2(y/2 - yt, x/2 - xt);
        
        //random eneym color
        const color = `hsl(${Math.random()*360},50%,50%)`;
        enemies.push(new Enemy(xt,yt,radius,color,{x:Math.cos(angle),y:Math.sin(angle)}))
    },1000)
}


let animationId;
//animate function loops through and calls itself because of requestAnimationFrame() to keep updating the update() function 
function animate(){

    animationId = requestAnimationFrame(animate)//IF TAB GOES INTO BACKGROUND IT WILL AUTOMATICALLY PAUSE
    
    /* we want to clear the canvas after each iteration so that
    we can see the projectile moving rather than being drawn upon itself*/
    
    ctx.fillStyle = "rgba(0,0,0,0.1)";//the opacity adds the fade effect
    ctx.fillRect(0,0,x, y)//its important to clear at the top - so u removes stuff from past loop not next loops
    player.draw();
    
    projectiles.forEach((projectile,index)=>{
        projectile.update()

        //REMOVING THE PROJECTILES AFTER THEY REACH THE END OF THE SCREEN
        if(projectile.x + projectile.radius< 0 || projectile.x + projectile.radius> x || projectile.y + projectile.radius< 0 || projectile.x + projectile.radius> y){
            setTimeout(()=>{
                projectiles.splice(index,1);
            })
        }
    })

    particles.forEach((particle,particleIndex)=>{
        if(particle.alpha <= 0){
            setTimeout(()=>{
                particles.splice(particleIndex,1);
            },0)
        }else particle.update();//should be else otherwise it would try to create a deleted particle which creates a blink effect
    })

    enemies.forEach((enemy,enemyIndex) =>{
        enemy.update()

        //ENDING THE GAME WHEN PLAYER ENEMY COLLISON
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist < player.radius + enemy.radius + 1){ 
            cancelAnimationFrame(animationId);
            endScreen.style.display = "flex";
            endScore.innerText = score;
        }
        //cancelAnimationFrame must be called after requestAnimationFrame so that the id is same;

        //ENEMY PROJECTILE COLLISION
        projectiles.forEach((projectile,projectileIndex) =>{
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if(dist < projectile.radius + enemy.radius + 1){
                //EXPLOSION OF BURSTING PARTICLES FOR EVERY HIT
                for(let i=0; i<enemy.radius*2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, {x:(Math.random()*6)*(Math.random()-0.5),y:(Math.random()*6)*(Math.random()-0.5)}));
                }
                //SHRINKING THE ENEMY SIZE ON BEING HIT -- using GSAP for smoother transition
                if(enemy.radius>15){
                    gsap.to(enemy,{
                        radius: enemy.radius - 10
                    })
                    //UPDATING THE SCORE
                    score += 50;
                    scoreEL.innerText = score;
                    projectiles.splice(projectileIndex,1);
                }
                //SET TIMEOUT IS TO REMOVE THE FLASHING EFFECT OF ENEMIES
                else{setTimeout(()=>{
                    //UPDATING THE SCORE
                    score += Math.ceil(Math.random()*300);
                    scoreEL.innerText = score;
                    enemies.splice(enemyIndex,1);
                    projectiles.splice(projectileIndex,1);
                },0)}
            }
        })
    })
}



// EVENT LISTENER ON WINDOW - so no need for window.
addEventListener("click", (event)=>{
    const angle = Math.atan2(event.clientY - y/2, event.clientX - x/2);
    projectiles.push(new Projectile(x/2,y/2,5,"white",{x:4*Math.cos(angle),y:4*Math.sin(angle)}));
    console.log(angle);
})


startBtn.addEventListener("click", ()=>{
    init();// u wanna reset before animating and spawning
    animate();
    spawnEnemies();
    endScreen.style.display = "none";
})

//customising button on click
startBtn.addEventListener("mousedown", (event)=>{
    startBtn.style.backgroundColor = "rgb(66, 135, 226)";
    startBtn.style.color = "black";
    startBtn.style.transform = "scale(0.8)";
})
addEventListener("mouseup", (event)=>{
    startBtn.style.backgroundColor = "rgb(4, 34, 167)";
    startBtn.style.color = "white";
    startBtn.style.transform = "scale(1)";
})

