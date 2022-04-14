let ESCALA = 5;
let TAM_POBLACION = 5;
var input;
let grafica;
let canvas_w;
let canvas_h;
let processId;

let ciudades = [];
let poblacion = [];
let fitness = [];
let generacion = 0;
let mejor_individuo = [];
var mejores_list = [];
let promedio = 0;
var promedio_list = [];
let best_idx = 0;
let patron = [];

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

function clearDatos() {
	ciudades = [];
	poblacion = [];
	fitness = [];
	mejor_individuo = [];
	best_list = [];
	promedio_list = [];
}

// funcion para añadir y borrar ciudades con un click
function mouseClicked() {
	if (mouseX < 0 || mouseY < 0) return;
	if (mouseX > canvas_w || mouseY > canvas_h) return;

	poblacion = [];
	fitness = [];
	mejor_individuo = [];
	best_list = [];
	promedio_list = [];

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
	clearDatos();
	let cant = parseInt(document.getElementById("nro_ciudades").value);
	for (let i = 0; i < cant; i++) {
		let x = parseInt(Math.random() * 99);
		let y = parseInt(Math.random() * 99);

		for (let j = 0; j < ciudades.length; j++) {
			if (ciudades[j].x == x && ciudades[j].y == y) {
				ciudades.splice(j, 1);
				i--;
				continue;
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

function generarPoblacion(cant, ciudad) {
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

function calcDistancia(cromosoma) {
	let fit = 0;
	for (let i = 1; i < cromosoma.length; i++) {
		fit += Math.sqrt(
			Math.pow(ciudades[cromosoma[i - 1]].x - ciudades[cromosoma[i]].x, 2) +
			Math.pow(ciudades[cromosoma[i - 1]].y - ciudades[cromosoma[i]].y, 2)
		);
	}
	return fit;
}

function drawBest() {
	background(220);

	stroke('black');
	strokeWeight(2);
	let p_x1, p_y1, p_x2, p_y2;
	for (let i = 1; i < mejor_individuo.length; i++) {
		p_x1 = ciudades[mejor_individuo[i - 1]].x * ESCALA;
		p_y1 = ciudades[mejor_individuo[i - 1]].y * ESCALA;
		p_x2 = ciudades[mejor_individuo[i]].x * ESCALA;
		p_y2 = ciudades[mejor_individuo[i]].y * ESCALA;
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

function calcularMejor() {
	// calcular la fitness y el mejor individuo
	best_idx = 0;
	let mejor = poblacion[0];
	for (let i = 0; i < TAM_POBLACION; i++) {
		fitness[i] = 1 / calcDistancia(poblacion[i]);
		if (fitness[i] > fitness[best_idx]) {
			best_idx = i;
			mejor = poblacion[best_idx];
		}
	}
	promedio_list.push(fitness[best_idx]);

	// calcular suma y promedio
	let suma = 0;
	for (let i = 0; i < fitness.length; i++) {
		suma += fitness[i];
	}
	promedio = suma / TAM_POBLACION;
	promedio_list.push(promedio);

	// valor esperado -> valor actual
	for (let i = 0; i < fitness.length; i++) {
		fitness[i] = fitness[i] / suma;
	}
	return mejor;
}
// funcion ejecutada al presionar el boton calcular
function calcular() {
	// generar poblacion inicial
	poblacion = generarPoblacion(TAM_POBLACION, parseInt(input.value));
	mejor_individuo = calcularMejor();
	// dibujar al mejor individuo
	drawBest();

	// genera el patron de cruzamiento
	for (let i = 0 ; i < ciudades.length - 1; i++) {
		patron[i] = Math.round(Math.random());
	}

	processId = setInterval(sigGeneracion, 500);
}
// para el algoritmo y deja de crear nuevas generaciones
function parar() {
	clearInterval(processId);
}

function selMejoresIndividuos() {
	let i = 0;
	let r = Math.random();

	while (r > 0) {
		r -= fitness[i];
		i++;
	}
	i--;
	return poblacion[i].slice();
}

function mutar(cromosoma, tasa_mutacion) {
	if (Math.random() > (1 - tasa_mutacion)) {
		let temp;
		let a = 1 + Math.round(Math.random() * (ciudades.length - 3));
		let b = 1 + Math.round(Math.random() * (ciudades.length - 3));
		if (a > b) {	// b > a siempre
			temp = a;
			a = b;
			b = temp;
		}

		while (b > a) {
			temp = cromosoma[b - 1];
			cromosoma[b - 1] = cromosoma[b];
			cromosoma[b] = temp;
			b--;
		}
	}
	return cromosoma.slice();
}

function compararIndividuos(cromosoma1, cromosoma2) {
	for (let i = 0; i < cromosoma1.length; i++)
		if (cromosoma1[i] != cromosoma2[i])
			return false;
	return true;
}

function sigGeneracion() {
	let nPoblacion = [];

	// seleccionar a los mejores individuos
	// dejando un espacio para el mejor
	for (let i = 0; i < poblacion.length; i++) {
		nPoblacion[i] = selMejoresIndividuos();
	}
	console.log(calcDistancia(mejor_individuo));

	// mutar a ciertos individuos
	let encontrado = false;
	for (let i = 0; i < poblacion.length; i++) {
		if (encontrado == false) {
			if (compararIndividuos(nPoblacion[i], mejor_individuo)) {
				encontrado = true;
				continue;
			}
		}
		nPoblacion[i] = mutar(nPoblacion[i], 0.5);
	}

	poblacion = nPoblacion;

	mejor_individuo = calcularMejor();
	drawBest();
}