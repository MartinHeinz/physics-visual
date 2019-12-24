
class Shape {
    constructor(x, y, radius, ax, ay, m) {
        this.x = x;
        this.y = y;
        this.r = radius;
        this.ax = ax;
        this.ay = ay;
        this.m = m;
        this.vx = 0;
        this.vy = 0;
    }

    move(dt) {
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        if (this.vx > maxSpeed) {
            this.vx = maxSpeed
        }
        if (this.vx < -maxSpeed) {
            this.vx = -maxSpeed
        }
        if (this.vy > maxSpeed) {
            this.vy = maxSpeed
        }
        if (this.vy < -maxSpeed) {
            this.vy = -maxSpeed
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw() {
        //draw a circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    }

    resolveEdgeCollision() {
        let objectWidth = this.r * 2;
        // Detect collision with right wall.
        if (this.x + objectWidth > c.width) {
            // Need to know how much we overshot the canvas width so we know how far to 'bounce'.
            let overshootX = (this.x + objectWidth) - c.width;
            this.x = c.width - overshootX - objectWidth;
            this.vx = -this.vx;
            this.ax = -this.ax;
        }

        // Detect collision with bottom wall.
        else if (this.y + objectWidth > c.height) {
            let overshootY = (this.y + objectWidth) - c.height;
            this.y = c.height - overshootY - objectWidth;
            this.vy = -this.vy;
            this.ay = -this.ay;
        }

        // Detect collision with left wall.
        else if (this.x - objectWidth < 0) {
            let overshootX = (this.x - objectWidth);
            this.x = overshootX + objectWidth;
            this.vx = -this.vx;
            this.ax = -this.ax;
        }
        // Detect collision with top wall.
        else if (this.y - objectWidth < 0) {
            let overshootY = (this.y - objectWidth);
            this.y = overshootY + objectWidth;
            this.vy = -this.vy;
            this.ay = -this.ay;
        }

    }
}


class Collision {
    constructor(o1, o2, dx, dy, d) {
        this.o1 = o1;
        this.o2 = o2;

        this.dx = dx;
        this.dy = dy;
        this.d = d;
    }
}

function checkCollision(o1, o2) {
    let dx = o2.x - o1.x;
    let dy = o2.y - o1.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (d < o1.r + o2.r) {
        return  {
            collisionInfo: new Collision(o1, o2, dx, dy, d),
            collided: true
        }
    }
    return  {
        collisionInfo: null,
        collided: false
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveCollision(info) {
    let nx = info.dx /info.d;
    let ny = info.dy /info.d;
    let s = info.o1.r + info.o2.r - info.d;
    info.o1.x -= nx * s/2;
    info.o1.y -= ny * s/2;
    info.o2.x += nx * s/2;
    info.o2.y += ny * s/2;
}

function resolveCollisionWithBounce(info) {
    let nx = info.dx /info.d;
    let ny = info.dy /info.d;
    let s = info.o1.r + info.o2.r - info.d;
    info.o1.x -= nx * s/2;
    info.o1.y -= ny * s/2;
    info.o2.x += nx * s/2;
    info.o2.y += ny * s/2;

    let k = -2 * ((info.o2.vx - info.o1.vx) * nx + (info.o2.vy - info.o1.vy) * ny) / (1/info.o1.m + 1/info.o2.m);
    info.o1.vx -= k * nx / info.o1.m;
    info.o1.vy -= k * ny / info.o1.m;
    info.o2.vx += k * nx / info.o2.m;
    info.o2.vy += k * ny / info.o2.m;
}

let objects = [
    new Shape(100, 50, 10, 1, 1, 1),
    new Shape(100, 80, 10, -1, -1, 1),
];

const maxSpeed = 150;
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");


c.addEventListener('click', function(event) {
    let x = event.pageX - c.offsetLeft;
    let y = event.pageY - c.offsetTop;

    objects.push(new Shape(x, y, 10, getRandomInt(-1, 1), getRandomInt(-1, 1), 1));
    // objects.push(new Shape(x, y, 10, 1, 1, 1));
}, false);

function animate() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (let o of objects) {
        o.move(0.1);
        o.resolveEdgeCollision();
    }
    let collisions = [];
    for (let [i, o1] of objects.entries()) {
        for (let [j, o2] of objects.entries()) {
            if (i < j) {
                let {collisionInfo, collided} = checkCollision(o1, o2);
                if (collided) {
                    collisions.push(collisionInfo);
                }
            }
        }
    }

    for (let col of collisions) {
        resolveCollisionWithBounce(col)  // resolveCollision(col)
    }
    for (let o of objects) {
        o.draw();
    }
    window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
