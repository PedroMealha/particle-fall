class _CreateParticle {
	constructor(obj) {
		Object.assign(this, obj);
		this.csize = this.size;
		this.cvy = this.vy;
		this.cvx = this.vx;
		this.oscx = 0;
		this.osc = this.size * .01;
		this.r = 0;
		let idx = Math.floor(Math.random() * this.color.length);
		this.color = this.color[idx];
		this.color = `${this.color.substring(0, this.color.length - 1)} / ${this.a}%)`;
	}
}

class _Particle extends _CreateParticle {
	constructor(obj) {
		super(obj);
	}

	draw() {
		this.ctx.shadowColor = this.color;
		this.ctx.shadowBlur = this.size * .7;
		this.ctx.fillStyle = this.color;
		this.ctx.beginPath();
		this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		this.ctx.fill();
	}

	update(delta, stop) {
		this.size > this.csize ? this.csize : this.size += .5;
		// this.oscx += this.osc;
		// if (this.oscx < -this.size * .15)
		// 	this.osc *= -1;
		// if (this.oscx > this.size * .15)
		// 	this.osc *= -1;

		if (stop) {
			if (this.vy <= 0) {
				this.vx = 0;
				this.vy = 0;
			}
			else {
				this.vy -= this.cvy * .02;
				this.vx -= this.cvx * .02;
			}
			this.y += this.vy * 5 * delta;
			this.x += this.vx * .025 * delta;
		}
		else {
			this.vx > this.cvx ? this.vx = this.cvx : this.vx += this.cvx * .02;
			this.x += this.vx * .025 * delta + this.oscx;
			this.vy > this.cvy ? this.vy = this.cvy : this.vy += this.cvy * .02;
			this.y += this.vy * 5 * delta;
		}
	}
}

class _Engine {
	constructor(setup) {
		Object.assign(this, setup);
		this.canvas = document.querySelector('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.w = this.canvas.clientWidth;
		this.h = this.canvas.clientHeight;

		this.mouse = {
			x: null,
			y: null
		};

		this.onRAF = false;
		this.t = 0;
		this.count = 0;
		this.prevtime = 0;
		this.objectArray = [];
		this.stop = true;
		this.idletime = 0;
		this.delta = 1;

		this.cBCR = this.canvas.getBoundingClientRect();

		window.addEventListener('resize', e => this.onResize());

		this.canvas.addEventListener('mousemove', e => {
			this.mouse.x = e.clientX - this.cBCR.x;
			this.mouse.y = e.clientY - this.cBCR.y;
		});

		this.onResize();

		return {
			canvas: this.canvas,
			w: this.w,
			h: this.h,
			size: this.size,
			play: () => {
				this.init();
				if (!this.onRAF) {
					this.delta = 1;
					this.onRAF = true;
					this.update(this.t);
				}
				this.stop = false;
			},
			stop: () => {
				this.stop = true;
			},
			resize: () => { this.onResize(); }
		};
	}

	init() {
		let self = this;
		let i = 0;
		while (i < this.nr) {
			addParticle(i);
			i++;
		}

		function addParticle(i) {
			setTimeout(() => {
				let particle = self.setParticle();
				if (!self.stop)
					self.objectArray.push(particle);
			}, self.int * i);
		}
	}

	setParticle() {
		let size = this.genRandomNumber(this.size.min, this.size.max, 1);
		let a = this.lmap(size, this.size.min, this.size.max, 10, 70);
		let mass = this.lmap(size, this.size.min, this.size.max, 30, 10);
		let vy = this.lmap(size, this.size.min, this.size.max, .5, 1);

		let obj = new _Particle({
			ctx: this.ctx,
			x: this.genRandomNumber(size, this.w - size, 1),
			y: -size / 2,
			// x: this.mouse.x,
			// y: this.mouse.y,
			vx: this.genRandomNumber(-15, 15, 1),
			vy: vy,
			size: size,
			a: a,
			mass: mass,
			color: this.color
		});

		return obj;
	}

	update(time) {
		this.idletime = time;
		let t = this.t = time - (time - this.idletime);

		let frametime = (t - this.prevtime) / 1000;
		this.prevtime = t;

		if (this.stop) {
			if (this.delta <= 0) {
				this.delta = 0;
				this.onRAF = false;
			}
			else {
				this.delta -= frametime / 2;
			}
		}
		else
			this.delta >= 1 ? this.delta = 1 : this.delta += frametime / 2;

		if (this.count % 2 == 0) {
			this.ctx.clearRect(0, 0, this.w, this.h);
			this.ctx.shadowColor = this.color;
			let i = 0, length = this.objectArray.length;
			while (i < length) {
				let particle = this.objectArray[i];
				// particle.x += this.mouse.x * particle.size;
				if (
					particle.y < this.h + particle.size * 4 &&
					particle.y > -particle.size * 4 &&
					particle.x < this.w + particle.size * 4 &&
					particle.x > -particle.size * 4
				) {
					particle.draw();
					particle.update(this.delta, this.stop);
				}
				else {
					let obj = this.setParticle();
					let values = Object.values(obj);
					Object.keys(particle).forEach(function (key, i) { particle[key] = values[i]; });
				}
				i++;
			}
		}
		this.count++;

		if (this.onRAF) {
			this.RAF = window.requestAnimationFrame(time => this.update(time));
		}
	}

	genRandomNumber(min, max, f) {
		max *= f;
		min *= f;
		return Math.floor(Math.random() * (max - min + 1) + min) / f;
	}

	onResize() {
		this.w = this.canvas.clientWidth;
		this.h = this.canvas.clientHeight;
		this.canvas.setAttribute("width", this.w);
		this.canvas.setAttribute("height", this.h);
		this.cBCR = this.canvas.getBoundingClientRect();
	}

	lmap(value, imin, imax, omin, omax) {
		if (value <= Math.min(imin, imax))
			return omin;
		if (value >= Math.max(imin, imax))
			return omax;
		const rd = (omax - omin) / (imax - imin);
		return (value - imin) * rd + omin;
	}
}


let particles = new _Engine({
	canvas: 'canvas',
	color: ['rgb(228 169 62)', 'rgb(221 255 0)', 'rgb(255 255 255)'],
	// color: ['rgb(228 169 62)'],
	nr: 20,
	int: 250,
	size: {
		min: 2,
		max: 10
	}
	// src: ['../common/assets/flake.png']
});

particles.canvas.addEventListener('mouseenter', e => {
	particles.play();
});

particles.canvas.addEventListener('mouseleave', e => {
	particles.stop();
});