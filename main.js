// MYKE STEVEN
'use strict';

//Juego de ping pong

(function() {

    //No funcionó declarar la clase como la teniamos antes
    self.Board = function(width, height) {
        this.width = width;
            this.height = height;
            this.playing = false;
            this.gameOver = false;
            this.bars = []; //Barras laterales del juego
            this.ball = null;
            this.playing = false;
    }
    /*
    class Board {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.playing = false;
            this.gameOver = false;
            this.bars = []; //Barras laterales del juego
            this.ball = null;
        }
    }
    */
    
    self.Board.prototype = {
        get elements() {
            // bar estaba gereando error en la cpu
            let elements = this.bars.map(function(bar) {return bar;});
            elements.push(this.ball);
            return elements;
        }
    }
    
 
})();

//Funcion anonima autoejecutable
(function(){
    self.Ball = function(x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.board = board;

        this.speedX = 5;
        this.speedY = 0;
        this.speed = 5;

        //Asigna la variable ball en el board al objeto ball
        board.ball = this;
        // Cuando direction sea 1 es hacia la derecha, -1 hacia la izquierda
        this.direction = 1;
        //Angulo de rebote
        this.bounce_angle = 0;
        this.max_bounce_angle = Math.PI / 12;

        this.kind = 'circle';
    };

    //modifica el objeto
    self.Ball.prototype = {
        move: function() {
            this.x += (this.speedX * this.direction);
            this.y += (this.speedY);
        },
        get width() {
            return this.radius * 2;
        },
        get height() {
            return this.radius * 2;
        },
        collision: function(bar) {
            //Reacciona a la colision con una barra que recibe como parámetro
            let relative_intersect_y = (bar.y + (bar.height / 2)) - this.y;
            let normalized_intersect_y = relative_intersect_y / (bar.height / 2);
            
            this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;

            this.speedY = this.speed * -Math.sin(this.bounce_angle);
            this.speedX = this.speed * Math.cos(this.bounce_angle);
            
            if(this.x > (this.board.width / 2)) this.direction = -1;
            else this.direction = 1;
        }
    }

})();

(function() {
    // Hace referencia a la barrita que choca con la pelota del ping pong
    self.Bar = function(x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;

        this.board.bars.push(this); //Le ingresa el objeto Bar, el this hace referencia a este objeto
        //forma de la geometria
        this.kind = "rectangle";
        this.speed = 10;
    }

    self.Bar.prototype = {
        down: function() {
            this.y += this.speed;
        },
        up: function() {
            this.y -= this.speed;
        },
        toString: function() {
            return "x: "+ this.x +" y: "+ this.y;
        }
    }
})();

(function() {
    //Creo que esto es una clase pero es otro formato
    self.BoardView = function(canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d"); //Contexto para dibujar en el canvas
    }

    self.BoardView.prototype = {
        //Para que el canvas no guarde los valores anteriores de posicion
        clean: function() {
            this.ctx.clearRect(0, 0, this.board.width, this.board.height);
        }, 

        draw: function() {
            for (let i = this.board.elements.length - 1; i >= 0; i--) {
                let el = this.board.elements[i]; //elemento
                
                
                draw(this.ctx, el);
                
            };
            
        },

        check_collisions: function() {
            
            for (let i = this.board.bars.length - 1; i >= 0; i--) {
                let bar = this.board.bars[i];
                if(hit(bar, this.board.ball)) {
                    this.board.ball.collision(bar);
                }
            }
        },

        play: function() {

            //Se ejecuta los metodos, solo si está playing 
            if (this.board.playing) {
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();    
            }
            
        }
    }

    function hit(a, b) {
        //Revisa si a colisiona con b
        //b es la barra, a es la pelota
        let hit = false;

        //Colisiones horizontales
        if(b.x + b.width >= a.x && b.x < a.x + a.width) {
            //Colisiones verticales
            if(b.y + b.height >= a.y && b.y < a.y + a.height) {
                hit = true;
            }
        }
        // Colisiones de a con b
        if(b.x <= a.x && b.x + b.width >= a.x + a.width){
            if(b.y <= a.y && b.y + b.height >= a.y + a.height) {
                hit = true;
            }
        }
        // Colisiones de b con a
        if(a.x <= b.x && a.x + a.width >= b.x + b.width) {
            if(a.y <= b.y && a.y + a.height >= b.y + b.height) {
                hit = true;
            }
        }
        return hit;

    }

    function draw(ctx, element) {
        
        switch(element.kind) {
            
            case "rectangle":
                ctx.fillRect(element.x, element.y, element.width, element.height);
                break;
            case "circle":
                ctx.beginPath();
                //el 0 y el 7 son valores para dibbujar el circulo de la pelota (investigar por qué?)
                ctx.arc(element.x, element.y, element.radius, 0, 7);
                ctx.fill();
                ctx.closePath();
                break;
        }
        
    }

})();

// Esto estaba  en el main, son las instancias de los objetos
let board = new Board(800, 400);
//no entiendo porque el bar se tiene que declarar en var --> no funciona del otro modo
let bar1 = new Bar(20, 100, 20, 100, board);
let bar2 = new Bar(760, 100, 20, 100, board);

let canvas = document.getElementById('canvas');
let board_view = new BoardView(canvas, board);

let ball = new Ball(350, 100, 10, board);



//Cuando presiona una tecla, ev es el evento
document.addEventListener('keydown', function(ev) {
    //keyCode --> me muestra el codigo asignado a cada tecla del declado
    // console.log(ev.keyCode);  //arriba: 38, abajo: 40

    
    if (ev.keyCode == 38) { //tecla hacia 
        ev.preventDefault(); //no sé exactamente como funciona este metodo
        bar2.up();
    } else if (ev.keyCode == 40) { //tecla hacia abajo
        ev.preventDefault();
        bar2.down();
    } else if (ev.keyCode == 87) {
        // Tecla W
        ev.preventDefault();
        bar1.up();
    } 
    else if (ev.keyCode == 83) { 
        // tecla S
        ev.preventDefault();
        bar1.down();
    } else if (ev.keyCode == 32) {
        // Tecla Spacio
        ev.preventDefault();
        board.playing = !board.playing; //  si es falso, entonces verdadero
    }


    // console.log("" + bar1);
    // console.log("" + bar2); //conviertiendo bar a una cadena, es igual al toString()
    
});

//Corre el main cuando se cargue la ventana
// window.addEventListener('load', main);

//Dibuja los elementos al inicio del programa
board_view.draw();

// Metodo para realizar la animacion
window.requestAnimationFrame(controller);

/*
setTimeout(function(){
    ball.direction = -1;
}, 3000); */


function controller() {
    //se le ingresa el tamaño al tablero
    board_view.play();
    window.requestAnimationFrame(controller);

}