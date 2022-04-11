let ESCALA = 5;
let TAM_POBLACION = 5;
let input;
let canvas_w;
let canvas_h;

let ciudades = [];
let poblacion = [];
let fitness = [];
let generacion = 0;
let best = [];
let best_list = [];
let promedio = 0;
let promedio_list = [];

window.onload = function () {
	input = document.getElementById("ciudad_central");
};

function setup() {
	canvas_w = 100 * ESCALA;
	canvas_h = 100 * ESCALA;
	createCanvas(canvas_w, canvas_h);
	background(220);
	noLoop();
}

function mouseClicked() {
	if (mouseX < 0 || mouseY < 0) return;
	if (mouseX > canvas_w || mouseY > canvas_h) return;
	let x = parseInt(mouseX / ESCALA);
	let y = parseInt(mouseY / ESCALA);

	// si dicho punto ya fue presionado, borrarlo de la lista y terminar
	for (let i = 0; i < ciudades.length; i++) {
		if (ciudades[i].x == x && ciudades[i].y == y) {
			ciudades.splice(i, 1);
			input.setAttribute("max", ciudades.length - 1);
			redraw();
			return;
		}
	}
	// de lo contrario, aniadirlo
	ciudades.push({
		x: x,
		y: y
	})
	input.setAttribute("max", ciudades.length - 1);
	redraw();
}

function draw() {
	background(220);

	textSize(10);
	fill('blue');
	let p_x, p_y;
	for (let i = 0; i < ciudades.length; i++) {
		p_x = ciudades[i].x * ESCALA;
		p_y = ciudades[i].y * ESCALA;

		stroke('red');
		strokeWeight(5);
		point(p_x, p_y);

		noStroke();
		text(i, p_x + 5, p_y - 5);
	}
}

function generarAleatorios() {
	ciudades = [];
	let cant = parseInt(document.getElementById("nro_ciudades").value);
	for (let i = 0; i < cant; i++){
		let x = parseInt(Math.random() * 99);
		let y = parseInt(Math.random() * 99);

		for (let j = 0; j < ciudades.length; j++) {
			if (ciudades[j].x == x && ciudades[j].y == y) {
				ciudades.splice(j, 1);
				i--;
			}
		}
		ciudades.push({
			x: x,
			y: y
		})
	}
	input.setAttribute("max", ciudades.length - 1);
	redraw();
}

function generarPoblacion(cant,ciudad) {
	let cromosoma = [];
	for (let j = 0; j < ciudades.length; j++)
		if (j != ciudad)
			cromosoma.push(j);

	let poblacion = [];
	for (let i = 0; i < cant; i++) {
		poblacion[i] = [ciudad].concat(shuffle(cromosoma));
		poblacion[i].push(ciudad);
	}
	return poblacion;
}

function calcDistancia (cromosoma) {
	let fit = 0;
	for (let i = 1; i < cromosoma.length; i++) {
		fit += Math.sqrt(
			Math.pow(ciudades[cromosoma[i - 1]].x - ciudades[cromosoma[i]].x,2)+
			Math.pow(ciudades[cromosoma[i - 1]].y - ciudades[cromosoma[i]].y,2)
		);
	}
	return fit;
}

function drawBest () {
	background(220);

	stroke('black');
	strokeWeight(2);
	let p_x1, p_y1, p_x2, p_y2;
	for (let i = 1; i < best.length; i++) {
		p_x1 = ciudades[best[i-1]].x * ESCALA;
		p_y1 = ciudades[best[i-1]].y * ESCALA;
		p_x2 = ciudades[best[i]].x * ESCALA;
		p_y2 = ciudades[best[i]].y * ESCALA;		
		line(p_x1, p_y1, p_x2, p_y2);
	}

	textSize(10);
	fill('blue');
	let p_x, p_y;
	for (let i = 0; i < ciudades.length; i++) {
		p_x = ciudades[i].x * ESCALA;
		p_y = ciudades[i].y * ESCALA;

		stroke('red');
		strokeWeight(5);
		point(p_x, p_y);

		noStroke();
		text(i, p_x + 5, p_y - 5);
	}
}

function calcular () {
	// generar poblacion inicial
	poblacion = generarPoblacion(TAM_POBLACION,parseInt(input.value));
	console.log(poblacion);

	// calcular la fitness y el mejor individuo
	let mejor = 0;
	best = poblacion[0];
	for (let i = 0; i < TAM_POBLACION; i++){
		fitness[i] = calcDistancia(poblacion[i]);
		if (fitness[i] < fitness[mejor]){
			mejor = i;
			best = poblacion[mejor];
		}
	}
	drawBest();

	// para hacer mas notoria la diferencia de fitness
	// se resta la distancia menor
	for (let i = 0; i < TAM_POBLACION; i++) {
		if (i != mejor)
			fitness[i] -= fitness[mejor]/2;
	}
	fitness[mejor] /= 2;

	// calcular suma y promedio
	let suma = 0;
	for (let i = 0; i < fitness.length; i++) {
		fitness[i] = 1 / fitness[i];
		suma += fitness[i];
	}
	promedio = suma / TAM_POBLACION;

	// valor esperado -> valor actual
	for (let i = 0; i < fitness.length; i++) {
		fitness[i] = fitness[i] / suma;
	}

	let a = [1,2,3,4,5,6];
	a = mutar(a);
	console.log(a);
}
function selMejoresIndividuos () {
	let i = 0;
	let r = Math.random();

	while (r > 0) {
		r -= fitness[i];
		i++; 
	}
	i--;
	return poblacion[i].slice();
}

function mutar (cromosoma, tasa) {
	if (Math.random() > tasa){
		let temp;
		let a = Math.floor(Math.random() * ciudades.length);
		let b = Math.floor(Math.random() * ciudades.length);
		if (a > b){	// b > a siempre
			temp = a;
			a = b;
			b = temp;
		}
		
		while (b > a){
			temp = cromosoma[b-1];
			cromosoma[b-1] = cromosoma[b];
			cromosoma[b] = temp;
			b--;
		}
		return cromosoma.slice();
	}
}

function sigGeneracion () {
	let nPoblacion = [];

	// seleccionar a los mejores individuos
	for (let i = 0; i < poblacion.length; i++) {
		nPoblacion[i] = selMejoresIndividuos();
	}

	// mutarlos
	for (let i = 0; i < poblacion.length; i++) {
		mutar(nPoblacion[i]);
	}

	poblacion = nPoblacion;
	console.log(nPoblacion);
}