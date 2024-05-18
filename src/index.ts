import {
	Application, Container, Point, Sprite, Texture
} from 'pixi.js';


/**
 * @param {Array} array
 * @return {Array}
 */
function shuffle(array: Array<any>) {
	let currentIndex = array.length; let randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}

class Domino {
	/** @property {Number} */
	#x;
	#y;

	constructor(args: {x: Number, y: Number} = {x: 0, y: 0}) {
		this.#x = args.x;
		this.#y = args.y;
	}

	get x() {
		return this.#x;
	}

	get y() {
		return this.#y;
	}
}

class Player {
	#dominoes: Domino[] = [];

	setDominoes(domnioes: Domino[]) {
		this.#dominoes = domnioes;
		console.log(this.#dominoes);
	}
}

class DominoesGame {
	/** @property {Player[]} */
	#players: Player[] = [];
	/** @property {Domino[]} */
	#dominoes: Domino[] = [];
	constructor() {
		for (let x = 0; x <= 6; x++) {
			for (let y = x; y <= 6; y++) {
				this.#dominoes.push(new Domino({x, y}));
			}
		}
		this.#dominoes = shuffle(this.#dominoes);
		for (let x = 0; x < 4; x++) {
			this.#players.push(new Player());
			this.#players[x].setDominoes(this.#dominoes.slice(x*9, 9));
		}
	}

	/**
	 * @return {Domino[]}
	 */
	getDominoes() {
		return this.#dominoes;
	}
}

// const gamePanel = document.getElementById('game_panel');
new DominoesGame();
// game.getDominoes().forEach((dominoe) => {
// 	const dominoeEl = document.createElement('anm-dominoe');
// 	dominoeEl.innerText = `${dominoe.x}|${dominoe.y}`;
// 	gamePanel.appendChild(dominoeEl);
// });



// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new Application({
	view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
});

type SymbolIndex = {
	[key: symbol]: Component
}
class Entity
{
	components: SymbolIndex = {};
	name: string|null = null;
	entity: Entity|null = null;
	addComponent(c: Component){
		this.components[c.getKey()] = c;
	}
	getComponent(s: symbol): Component {
		return this.components[s];
	}
}
abstract class Component
{
	static ComponentKey: symbol;
	id: string|null = null;

	getKey(): symbol
	{
		var logger = <typeof Component>this.constructor; 
    return logger.ComponentKey; 
	}
}
class Position extends Component
{
	static override ComponentKey: symbol = Symbol('Position');
	point: Point;
	constructor(p: Point)
	{
		super();
		this.point = p;
	}
}
class Area extends Component
{
	static override ComponentKey: symbol = Symbol('Area');
	point: Point;
	constructor(p: Point)
	{
		super();
		this.point = p;
	}
}
class Velocity extends Component
{
	static override ComponentKey: symbol = Symbol('Velocity');
	point: Point;
	constructor(p: Point)
	{
		super();
		this.point = p;
	}
}
class Render extends Component
{
	static override ComponentKey: symbol = Symbol('Render');
	sprite: Sprite;
	constructor(s: Sprite)
	{
		super();
		this.sprite = s;
	}
}
// load the texture we need
// const texture = await Assets.load('bunny.png');
const CENTER_X = app.renderer.width / 2;
const entities: Entity[] = [];
const playfieldContainer = new Container();
playfieldContainer.scale.x = .5;
playfieldContainer.scale.y = .5;
app.stage.addChild(playfieldContainer);

const hudContainer = new Container();
app.stage.addChild(hudContainer);

const player: Container = new Sprite(Texture.from('../ships/burst.svg'));;
playfieldContainer.addChild(player);

const bullets: Container[] = [];

const drones: Container[] = [];

for (let y = 0; y < 5; y++) {
	const bunny = new Sprite(Texture.from('../enemies/drone.svg'));
	bunny.x = CENTER_X;
	bunny.y = y * 30;
	drones.push(bunny);
	const entity = new Entity();
	entity.name = 'drone-' + y;
	entity.addComponent(new Render(bunny));
	entity.addComponent(new Position(new Point(CENTER_X, y * 30)));
	entity.addComponent(new Area(new Point(25, 25)));
	entity.addComponent(new Velocity(new Point(0, 1)));
	entities.push(entity);
	playfieldContainer.addChild(bunny);
}


var zoomIn = new Sprite(Texture.from('../ui/zoomIn.svg'));
zoomIn.x = 20;
zoomIn.y = app.renderer.height - 20;
zoomIn.interactive = true;
zoomIn.cursor = 'pointer';
zoomIn.on('click', () => {
	playfieldContainer.scale = new Point(playfieldContainer.scale.x + .1, playfieldContainer.scale.y + .1);
})
hudContainer.addChild(zoomIn);

let elapsed = 0;
const FireRate = 20;
const FireVelocity = 5;
let bulletTimer = FireRate;
app.ticker.add((delta) => {
  elapsed += delta;
	const collisionCheck: Entity[] = [];
  for (let i = 0; i < entities.length; i++) {
		const pos = <Position>entities[i].getComponent(Position.ComponentKey);
		// const area = <Area>entities[i].getComponent(Area.ComponentKey);
		const vel = <Velocity>entities[i].getComponent(Velocity.ComponentKey);
		const ren = <Render>entities[i].getComponent(Render.ComponentKey);
		pos.point.y += vel.point.y;
		pos.point.x += vel.point.x;
		ren.sprite.y = pos.point.y;
		ren.sprite.x = pos.point.x;
		for(let j = 0; j < collisionCheck.length; j++) {
			const pos2 = <Position>collisionCheck[j].getComponent(Position.ComponentKey);
			const area2 = <Area>collisionCheck[j].getComponent(Area.ComponentKey);
			if(pos.point.x > pos2.point.x && pos.point.x < pos2.point.x + area2.point.x) {
				if(pos.point.y > pos2.point.y && pos.point.y < pos2.point.y + area2.point.y) {
					console.log(entities[i].name + ' <> ' + collisionCheck[j].name);
				}
			}
		}
		collisionCheck.push(entities[i]);
	}
	bulletTimer -= delta;
	if (bulletTimer < 0) {
		const bullet = new Sprite(Texture.from('../ammo/burstSmall.svg'));
		bullet.x = player.x;
		bullet.y = player.y;
		bullets.push(bullet);
		playfieldContainer.addChild(bullet);
		const entity = new Entity();
		entity.name = 'bullet-' + bullets.length;
		entity.addComponent(new Render(bullet));
		entity.addComponent(new Position(new Point(player.x, player.y)));
		entity.addComponent(new Area(new Point(5, 5)));
		entity.addComponent(new Velocity(new Point(0, -FireVelocity)));
		entities.push(entity);
		bulletTimer = FireRate;
	}
});



app.stage.interactive = true;
app.stage.on('globalpointermove', (event) => {
	// if(event.buttons == 1) {
		player.x = event.client.x * (1/playfieldContainer.scale.x);
		player.y = event.client.y * (1/playfieldContainer.scale.y);
	// }
	// console.log(event.buttons);
	// console.log(event.client);
});

// app.stage.on('globaltouchmove', (event) => {
// 	console.log(event);
// });
// app.stage.on('globalmousemove', (event) => {
// 	console.log(event);
// });
// Listen for frame updates
// app.ticker.add(() => {
	// each frame we spin the bunny around a bit
	// bunny.rotation += 0.01;
// });
