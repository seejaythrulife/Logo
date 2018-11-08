/***************************************************** P5 FUNCTIONS */
let text, error;
function setup () {
	createCanvas (200, 200).parent ("#canvas");
	
	translate (width/2, height/2);
	angleMode (DEGREES);
	strokeWeight (2);
	stroke (255);
	
	text = select ('#code');
	error = select ("#error");
	text.input((f => {
		f ();
		return f;
	}) (() => {
		try {
			parseTurtle (text.value ()) ();
			error.html ("");
		} catch (e) {
			error.html (e.message);
		}
	}));
}

/***************************************************** PARSING FUNCTIONS */
const LEFT =          /^lt$/,
			RIGHT =         /^rt$/,    
			FORWARD =       /^fd$/,
			BACKWARD =      /^bd$/,
			REPEAT =        /^repeat$/,
			NUMBER =        /^\d+$/,
			OPEN_BRACKET =  /^\[$/,
			CLOSE_BRACKET = /^\]$/;

function parseTurtle (input) {
	let sc = new Scanner (input),
			command, commands = [];
	while (sc.hasNext ()) {
		commands.push (parseCommand (sc));
	}
	return function () {
		push ();
		background (0);
		rotate (180);
		commands.forEach (command => command ());
		pop ();
	};
}
function parseCommand (sc) {
	let command = sc.next ();
	if (LEFT.test (command))
		return parseLeft (sc);

	if (RIGHT.test (command))
		return parseRight (sc);

	if (FORWARD.test (command))
		return parseForward (sc);

	if (BACKWARD.test (command))
		return parseBackward (sc);

	if (REPEAT.test (command))
		return parseRepeat (sc);

	fail ("unrecognised command \"" + command + "\"");
}
function parseLeft (sc) {
	let value = sc.nextNumber ("missing number after lt command");
	return function () {
		rotate (-value);
	};
}
function parseRight (sc) {
	let value = sc.nextNumber ("missing number after rt command");
	return function () {
		rotate (value);
	};
}
function parseForward (sc) {
	let value = sc.nextNumber ("missing number after fd command");
	return function () {
		line (0, 0, 0, value);
		translate (0, value);
	}
}
function parseBackward (sc) {
	let value = sc.nextNumber ("missing number after bd command");
	return function () {
		line (0, 0, 0, -value);
		translate (0, -value);
	}
}
function parseRepeat (sc) {
	let value = sc.nextNumber ("missing number after repeat command");
	sc.require (OPEN_BRACKET, "missing opening bracket after repeat command");
	
	let command, commands = [];
	while (!sc.hasNext (CLOSE_BRACKET)) {
		commands.push (parseCommand (sc));
	}
	
	sc.require (CLOSE_BRACKET, "missing closing bracket after repeat block")
	
	return function () {
		for (let i = 0; i < value; i++) {
			commands.forEach (command => command ());
		}
	};
}
function fail (message) {
	throw new Error (message);
}

/***************************************************** SCANNER CLASS */
function Scanner (input) {
	this.i = 0;
	
	let tokens = [], token = [], newToken = true;
	for (c of input) {
		
		// continue a word
		if (/\b/.test (c)) {
			token.push (c);
		}
		
		// single character tokens
		else if (/[\[\]]/.test (c)) {
			if (token.length > 0)
				tokens.push (token.join (""));
			token = [];
			
			tokens.push (c);
		}
		
		// skip whitespace
		else if (/\s/.test (c)) {
			if (token.length > 0)
				tokens.push (token.join (""));
			token = [];
		}
	}
	
	this.tokens = tokens;
//	print (this.tokens);
}
Scanner.prototype.hasNext = function (regex) {
	if (typeof regex == "undefined")
		return this.i < this.tokens.length;
	
	return regex.test (this.tokens [this.i]);
};
Scanner.prototype.next = function () {
	return this.tokens [this.i++];
};
Scanner.prototype.nextNumber = function (message) {
	let token = this.next ();
	if (NUMBER.test (token))
		return parseInt (token);
	
	fail (message);
}
Scanner.prototype.require = function (regex, message) {
	if (!regex.test (this.next ()))
		fail (message);
}