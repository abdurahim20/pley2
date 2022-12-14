var Utl = {};
// true si valeur est entre deux autres valeurs
Utl.entre = function(valeur, min, max) {
	return (valeur - min) * (valeur - max) < 0;
};
Utl.aleatoire = function(min, max) {
	return min + Math.random() * (max - min);
};
// Distance entre deux points
Utl.distance = function(p1, p2) {
	return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}
Utl.lerp = function(value1, value2, amount) {
	return value1 + (value2 - value1) * amount;
};
// collision Point > Carre
Utl.pointCarre = function(x, y, carre) {
	return Calcul.entre(x, carre.pos.x, carre.pos.x + carre.taille) && Calcul.entre(y, carre.pos.y, carre.pos.y + carre.taille);
};
// Morceler un tableau de plusieurs lignes
Utl.morceler = function(tableau, largeur) {
		var resultat = [];
		for (var i = 0; i < tableau.length; i += largeur) resultat.push(tableau.slice(i, i + largeur))
		return resultat;
};

function timestamp() {
	return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

class Camera {
    constructor(monde, cible) {
        this.monde = monde;
        this.ctx = monde.ctx;
        this.cible = cible;
        this.pos = {x:cible.pos.x,y:cible.pos.y};
        this.velocite = {x:0,y:0};
        this.facteur = {x:0.1,y:0.1};
        this.force = {x:0.1,y:0.1};
        this.traine = {x:0.1,y:0.1};
		this.limite = {x:this.monde.terrain.dimension.x*this.monde.taille,
						y:this.monde.terrain.dimension.y*this.monde.taille,	};
    }
    update() {
    	// effect
        this.force.y = this.cible.pos.y - this.pos.y;
        this.force.y *= this.facteur.y;
        this.force.x = this.cible.pos.x - this.pos.x;
        this.force.x *= this.facteur.x;
        // integration
        this.velocite.x *= this.traine.x;
        this.velocite.y *= this.traine.y;
        this.velocite.x += this.force.x;
        this.velocite.y += this.force.y;
        this.pos.x += this.velocite.x;
        this.pos.y += this.velocite.y;
        if (this.pos.x - this.monde.L / 2 < 0) {
            this.pos.x = this.monde.L / 2;
        }
        if (this.pos.y - this.monde.H / 2 < 0) {
            this.pos.y = this.monde.H / 2;
        }
        if (this.pos.y + this.monde.H / 2 > this.limite.y) {
            this.pos.y = this.limite.y - this.monde.H / 2;
        }
        if (this.pos.x + this.monde.L / 2 > this.limite.x) {
            this.pos.x = this.limite.x - this.monde.L / 2;
        }
    }
}


class Entite{
	constructor(monde,x,y,sprite){
		this.monde = monde;
		this.limite = {x:this.monde.terrain.dimension.x*this.monde.taille,
						y:this.monde.terrain.dimension.y*this.monde.taille,	};
		this.ctx = monde.ctx;
		this.pos = {x:x,y:y};
		this.vel = {x:0,y:20};
		this.friction = {x:0.96,y:0.98};
		this.angle = 0;
		this.turnSpeed = 0;
		this.speed = 0;
		this.topSpeed = 100;
		this.sprite = new Sprite3D(this.monde,this,sprite);
		this.working = false;
	}
	update(dt){
		if (this.pos.x < 0) {
            this.pos.x = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = 0;
        }
        if (this.pos.y > this.limite.y) {
            this.pos.y = this.limite.y;
        }
        if (this.pos.x > this.limite.x) {
            this.pos.x = this.limite.x;
        }
		this.deplacement();
		this.turnSpeed*=0.96;
		this.angle += this.turnSpeed* dt;
		this.speed *=0.98;

		this.vel.x =  Math.cos(demo.voiture.angle) * this.speed;
		this.vel.y =  Math.sin(demo.voiture.angle) * this.speed;

		this.vel.x *= this.friction.x;
		this.vel.y *= this.friction.y;
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;
	}
	rendu(){
		this.sprite.dessiner();

	}

    deplacement() {
        if (this.monde.touches[40]) {
        	if(this.speed > -this.topSpeed){
        		this.speed -= 2;
        	}
        }

              if (this.monde.touches[38]) {
        	if(this.speed < this.topSpeed){
        		this.working = true;
        		this.speed += 4;
        	}
        }else{
        	this.working = false;
        }

        if (this.monde.touches[39]) {
        	if(this.turnSpeed < 5){
        		this.turnSpeed += 0.5;
        	}
        }
        if (this.monde.touches[37]) {
				if (this.turnSpeed > -5) {
					this.turnSpeed -= 0.5;
				}
        }
	}

}

class Sprite3D{
	constructor(monde,parent,sprite){
		this.ctx = monde.ctx;
		this.parent = parent;
		this.image = sprite.img;
		this.pos = parent.pos;
		this.frameCourante = 0;
		this.nombreFrame = 0;
		this.vitesse = 0.2;
		this.sprite = sprite;
		// 3D
		this.width = this.sprite.img.width/this.sprite.sep;
		this.height = this.sprite.img.height;
		this.halfx = this.width/2;
		this.halfy = this.height/2;
	}
	dessiner(){

for(let i = 0; i < this.sprite.sep; i++){
  this.ctx.save();
  this.ctx.translate(this.pos.x,this.pos.y-i);
  this.ctx.rotate(this.parent.angle);
  this.ctx.drawImage(this.sprite.img,i*this.width,0,this.width,this.height,-this.halfx,-this.halfy,this.width,this.height);
  this.ctx.restore();
}
	}

}

class Particle{
	constructor(monde,parent,sprite){
		this.parent = parent;
		this.monde = monde;
		this.ctx = monde.ctx;
		this.sprite = sprite;
		this.reset();
	}
	render(){
		if(!this.dead){
		this.ctx.drawImage(this.sprite,this.pos.x-this.sprite.width/2,this.pos.y-this.sprite.width/2);
	}
	}
	update(dt){
		if(!this.dead){

				this.vel.x *= this.friction.x;
		this.vel.y *= this.friction.y;
		this.pos.x += this.vel.x * dt;
		this.pos.y += this.vel.y * dt;
		if(this.live > 0){
			this.live -= 0.1;
		}else{
			this.dead = true;
		}
	}else if(this.parent.working){
		this.reset();
	}

	}
	reset(){
		this.dead = false;
		this.pos = {x:this.parent.pos.x,y:this.parent.pos.y};
		this.vel = {x:Utl.aleatoire(-Math.cos(this.parent.angle-0.5)*100,-Math.cos(this.parent.angle+0.5)),y:Utl.aleatoire(-Math.sin(this.parent.angle-0.5)*50,-Math.cos(this.parent.angle+0.5)*50)};
		this.friction = {x:0.96,y:0.98};
		this.live = Utl.aleatoire(2,20);
	}
}

class Generator{
	constructor(monde,parent,number){
		this.monde = monde;
		this.sprite = monde.ressources.dust.img;
		this.parent = parent;
		this.number = number;
		this.pos = this.parent.pos;
		this.particles = [];
		for (var i = 0; i < number; i++) {
			this.particles.push(new Particle(this.monde,this.parent,this.sprite));
		}
	}
	render(){
		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].render();
		}
	}
	update(dt){
		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].update(dt);
		}
	}
}

/*
   _____                      _     
  / ____|                    (_)    
 | |     ___   ___ _   _ _ __ _ ___ 
 | |    / _ \ / _ \ | | | '__| / __|
 | |___| (_) |  __/ |_| | |_ | \__ \
  \_____\___/ \___|\__,_|_(_)| |___/
                            _/ |    
                           |__/     
*/
class Monde {
	constructor(parametres) {
		// parametres
		this.alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ?!:',.()<>[]";
		this.taille = parametres.taille;
		this.touches = [];
		this.zoom = parametres.zoom || 2;
		this.remplissage = false;
		this.fond = "black";
		this.etat = "start";
		// niveaux 
		this.niveaux = niveaux;
		this.niveauActuel = 0;
		// Forces 
		// ressources
		this.prop = {
			compte: 0,
			nombreRessources: parametres.stockImages.length + parametres.stockSon.length
		};
		this.ressources = {};
		// Chargement + lancement
		this.creerContexte();
		if (this.prop !== 0) {
			this.traitement(parametres.stockImages, parametres.stockSon, parametres.clefs);
		};
		// fps
		this.now = timestamp();
		this.dt = 0;
		this.last = timestamp();
		this.step = 1/60;
		// menu
		let bouttons = [{
			nom: "Start game",
			lien: "start"
		}, {
			nom: "How to play",
			lien: "regles"
		}, {
			nom: "About",
			lien: "info"
		}, ];
		let valeur = [];
		for (var i = 0; i < bouttons.length; i++) {
			valeur.push(bouttons[i].nom.length);
		};
		let self = this;
		this.menu = {
			monde: self,
			ctx: self.ctx,
			choix: bouttons,
			max: bouttons.length - 1,
			selection: 0,
			texteMax: Math.max(...valeur) * 6 + 60,
			pos: {
				x: self.L / 2,
				y: 100
			},
			curseur: self.ressources.curseur,
			rendu: function() {
				// dessiner le cadre 
				this.monde.boite(this.pos.x - this.texteMax / 2, this.pos.y - 10, this.texteMax, 26 * this.choix.length);
				// on affiche le titre
				for (var i = 0; i < this.choix.length; i++) {
					this.monde.ecrire(this.choix[i].nom, this.pos.x, this.pos.y + 25 * i, 1);
				}
				// on affiche la selection
				this.ctx.drawImage(this.curseur.img, 48, 0, 16, 16, this.pos.x - ((this.choix[this.selection].nom.length / 2) * 6) - 26, this.pos.y + 25 * (this.selection) - 4, 16, 16);
			},
			changement: function(keyCode) {
				if (keyCode === 38 && this.selection > 0) {
					// haut
					this.selection -= 1;
					this.rendu();
				} else if (keyCode === 40 && this.selection < this.max) {
					// bas
					this.selection += 1;
					this.rendu();
				} else if (keyCode === 88) {
					// action
					this.actif = false;
					this.monde.phase(this.choix[this.selection].lien);
				}
			},
		};
	}
	creerContexte() {
			this.toile = document.createElement("canvas");
			this.ctx = this.toile.getContext('2d');
			this.L = this.toile.width = 128;
			this.H = this.toile.height = 128;
			this.limite = {
				x: this.L,
				y: this.H
			}
			this.toile.style.width = this.L * this.zoom + "px";
			this.toile.style.height = this.H * this.zoom + "px";
			this.ctx.mozImageSmoothingEnabled = false;
			this.ctx.msImageSmoothingEnabled = false;
			this.ctx.imageSmoothingEnabled = false;
			document.body.appendChild(this.toile);
			console.log('%c Monde cr???? ', 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
			document.addEventListener("keydown", event => this.touchePresse(event), false);
			document.addEventListener("keyup", event => this.toucheLache(event), false);
		}
		/*
		   _____ _                                               _   
		  / ____| |                                             | |  
		 | |    | |__   __ _ _ __ __ _  ___ _ __ ___   ___ _ __ | |_ 
		 | |    | '_ \ / _` | '__/ _` |/ _ \ '_ ` _ \ / _ \ '_ \| __|
		 | |____| | | | (_| | | | (_| |  __/ | | | | |  __/ | | | |_ 
		  \_____|_| |_|\__,_|_|  \__, |\___|_| |_| |_|\___|_| |_|\__|
		                          __/ |                              
		                         |___/                               
		*/
	chargement() {
		this.prop.compte += 1;
		if (this.prop.compte === this.prop.nombreRessources) {
			console.log('%c les images sont charg??es ' + this.prop.nombreRessources + " / " + this.prop.nombreRessources, 'padding:2px; border-left:2px solid green; background: lightgreen; color: #000');
			// Fin de chargement
			this.phase(this.etat);
		} else {
			// ??cran de chargement
			this.ctx.fillStyle = this.fond;
			this.ctx.fillRect(0, 0, this.L, this.H);
			this.ctx.fillStyle = "#fff";
			this.ctx.fillRect(0, this.H / 2 - 1, (this.prop.compte * this.L) / this.prop.nombreRessources, 1);
		}
	}
	chargerImages(url) {
		let img = new Image();
		img.onload = () =>{
			this.chargement();
		};
		img.src = url;
		return img;
	}
	
	chargerSon(url) {
		let audio = new Audio(url);
		audio.addEventListener('canplaythrough', this.chargement(), false);
		return audio;
	}


	traitement(stockImages, stockSon, clefs) {
			// traitement images
			let IM = {};
			for (let i = 0; i < stockImages.length; i++) {
				let sujet = stockImages[i];
				let nom = sujet.nom;
				sujet.img = this.chargerImages(stockImages[i].img);
				IM[nom] = stockImages[i];
			}
			this.ressources = IM;
			// traitement Son
			let IS = {};
			for (let i = 0; i < stockSon.length; i++) {
				let sujet = stockSon[i];
				let nom = sujet.nom;
				sujet.url = this.chargerSon(stockSon[i].url);
				IS[nom] = stockSon[i];
			}
			this.sons = IS;
			if (clefs) {
				//  traitement clefs
				this.nettoyer = new Array(clefs.length).fill(false)
				let CM = {};
				for (let i = 0; i < clefs.length; i++) {
					let sujet = clefs[i];
					let nom = sujet.id;
					if (sujet.type === "sprite") {
						sujet.frame = 0;
						sujet.sprite = this.ressources[sujet.apparence];
						sujet.memoireBoucle = false;
						sujet.peutAnimer = true;
						sujet.boucle = true;
					}
					CM[nom] = clefs[i];
				}
				this.clefs = CM;
			}
		}
		/*
		  ______      __                                 _   
		 |  ____|    /_/                                | |  
		 | |____   _____ _ __   ___ _ __ ___   ___ _ __ | |_ 
		 |  __\ \ / / _ \ '_ \ / _ \ '_ ` _ \ / _ \ '_ \| __|
		 | |___\ V /  __/ | | |  __/ | | | | |  __/ | | | |_ 
		 |______\_/ \___|_| |_|\___|_| |_| |_|\___|_| |_|\__|
		                                                     
		                                                     
		*/
		/*
		handleVisibilityChange(e) {
				if (document.hidden) {
					if (this.enjeu && !this.pause) {
						this.pause = true;
						this.phase("pause");
					}
				}
			}
		*/
	touchePresse(event) {
		this.touches[event.keyCode] = true;
		if (this.touches[70]) {
			this.activeRemplissage();
		}
		switch (this.etat) {
			case "menu":
				this.menu.changement(event.keyCode);
				break;
			case "start":
				if (this.touches[69]) {
					this.phase("menu")
				}
				break;
			case "mort":
				if (this.touches[67]) {
					this.phase("menu")
				}
				break;
			case "regles":
				if (this.touches[67]) {
					this.phase("menu")
				}
				break;
			case "info":
				if (this.touches[67]) {
					this.phase("menu")
				}
				break;
			case "niveaux":
				this.menuNiveaux.changement(event.keyCode);
				if (this.touches[67]) {
					this.phase("menu")
				}
				break;
			default:
				console.log("aucune touche reconnue");
		}
	}
	toucheLache(event) {
		this.touches[event.keyCode] = false;
	}
	activeRemplissage() {
			if (!this.remplissage) {
				this.toile.webkitRequestFullScreen()
				this.remplissage = true;
				this.toile.style.width = "100vmin";
				this.toile.style.height = "100vmin";
			} else {
				document.webkitCancelFullScreen()
				this.remplissage = false;
				this.toile.style.width = this.L * this.zoom + "px";
				this.toile.style.height = this.H * this.zoom + "px";
			}
		}
		/*
		  ______               _   _                 
		 |  ____|             | | (_)                
		 | |__ ___  _ __   ___| |_ _  ___  _ __  ___ 
		 |  __/ _ \| '_ \ / __| __| |/ _ \| '_ \/ __|
		 | | | (_) | | | | (__| |_| | (_) | | | \__ \
		 |_|  \___/|_| |_|\___|\__|_|\___/|_| |_|___/
		                                             
		*/
	chercheClef(recherche) {
		let blockRecherche = [];
		for (var j = 0; j < this.terrain.dimension.y; j++) {
			for (var i = 0; i < this.terrain.dimension.x; i++) {
				let id = this.terrain.geometrie[j][i];
				if (this.clefs[id].nom === recherche) {
					let info = {
						pos: {
							x: i,
							y: j
						}
					}
					blockRecherche.push(info);
				}
			}
		}
		return blockRecherche;
	}
	infoClef(x, y) {
		if (x > -1 && x < this.terrain.dimension.x && y > -1 && y < this.terrain.dimension.y) {
			return this.clefs[this.terrain.geometrie[y][x]];
		} else {
			return false;
		}
	}
	ecrire(texte, x, y, couleur) {
		let largeur = 6,
			hauteur = 9;
		let mult = couleur || 0;
		let centre = (texte.length * largeur) / 2;
		for (let i = 0; i < texte.length; i++) {
			let index = this.alphabet.indexOf(texte.charAt(i)),
				clipX = largeur * index,
				posX = (x - centre) + (i * largeur);
			this.ctx.drawImage(this.ressources.pixelFont.img, clipX, (mult * hauteur), largeur, hauteur, posX, y, largeur, hauteur);
		}
	}
	boite(x, y, l, h) {
		this.ctx.fillStyle = "white";
		// dessiner le fond
		this.ctx.fillRect(x + 1, y + 1, l - 2, h - 2);
		// dessiner les bords
		//haut Gauche
		this.ctx.drawImage(this.ressources.curseur.img, 32, 16, 16, 16, x, y, 16, 16);
		//haut Droit
		this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16, 16, 16, x + l - 16, y, 16, 16);
		//bas Gauche
		this.ctx.drawImage(this.ressources.curseur.img, 32, 16 + 8, 16, 16, x, y + h - 16, 16, 16);
		//bas Gauche
		this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16 + 8, 16, 16, x + l - 16, y + h - 16, 16, 16);
		// haut
		this.ctx.drawImage(this.ressources.curseur.img, 32 + 4, 16, 16, 16, x + 16, y, l - 32, 16);
		// bas
		this.ctx.drawImage(this.ressources.curseur.img, 32 + 4, 16 + 8, 16, 16, x + 16, y + h - 16, l - 32, 16);
		// gauche
		this.ctx.drawImage(this.ressources.curseur.img, 32, 16 + 4, 16, 16, x, y + 16, 16, h - 32);
		// droit
		this.ctx.drawImage(this.ressources.curseur.img, 32 + 8, 16 + 4, 16, 16, x + l - 16, y + 16, 16, h - 32);
	}
	bitMasking() {
		let tuileBitMask = [];
		let compte = 0;
		this.terrain.apparence = [];
		for (var j = 0; j < this.terrain.dimension.y; j++) {
			for (var i = 0; i < this.terrain.dimension.x; i++) {
				let id = this.terrain.geometrie[j][i];
				// haut gauche droit bas
				let voisine = [0, 0, 0, 0];
				compte += 1;
				if (j - 1 > -1) {
					if (id === this.terrain.geometrie[j - 1][i]) {
						//haut
						voisine[0] = 1;
					}
				}
				if (id === this.terrain.geometrie[j][i - 1]) {
					// gauche
					voisine[1] = 1;
				}
				if (id === this.terrain.geometrie[j][i + 1]) {
					// droite
					voisine[2] = 1;
				}
				if (j + 1 < this.terrain.dimension.y) {
					if (id === this.terrain.geometrie[j + 1][i]) {
						//bas
						voisine[3] = 1;
					}
				}
				id = 1 * voisine[0] + 2 * voisine[1] + 4 * voisine[2] + 8 * voisine[3];
				this.terrain.apparence.push(id);
			}
		}
		this.terrain.apparence = Utl.morceler(this.terrain.apparence, this.terrain.dimension.x);
	}
	renduTerrain() {
			for (let j = 0; j < this.terrain.dimension.y; j++) {
				for (let i = 0; i < this.terrain.dimension.x; i++) {
					let id = this.terrain.geometrie[j][i];
					if (this.clefs[id].apparence === "auto") {
						var sourceX = Math.floor(this.terrain.apparence[j][i]) * this.taille;
						var sourceY = Math.floor(this.terrain.apparence[j][i]) * this.taille;
						this.ctx.drawImage(this.ressources.feuille.img, sourceX, this.clefs[id].ligne * this.taille, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
					} else if (this.clefs[id].type === "sprite") {
						if (!this.clefs[id].memoireBoucle) {
							if (this.clefs[id].peutAnimer) {
								this.clefs[id].frame += this.clefs[id].allure;
							}
							if (this.clefs[id].frame >= this.clefs[id].sprite.sep) {
								if (!this.clefs[id].boucle) {
									this.clefs[id].peutAnimer = false;
								}
								this.clefs[id].frame = 0;
							}
							this.clefs[id].memoireBoucle = true;
							// on sait quel id est d??j?? pass?? :^)
							this.nettoyer[id] = true;
						}
						this.ctx.drawImage(this.clefs[id].sprite.img, Math.floor(this.clefs[id].frame) * this.taille, 0, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
					} else {
						var sourceX = Math.floor(this.clefs[id].apparence % 16) * this.taille;
						var sourceY = Math.floor(this.clefs[id].apparence / 16) * this.taille;
						this.ctx.drawImage(this.ressources.feuille.img, sourceX, sourceY, this.taille, this.taille, i * this.taille, j * this.taille, this.taille, this.taille);
					}
				}
			}
			for (var i = 0; i < this.nettoyer.length; i++) {
				if (this.nettoyer[i]) {
					this.clefs[i].memoireBoucle = false;
				}
			}
		}
	initialiserMap(){
		this.terrain = {};
		this.terrain.geometrie = this.niveaux[this.niveauActuel].geometrie;
		this.terrain.dimension = {
			x: this.terrain.geometrie[0].length,
			y: this.terrain.geometrie.length
		};
		this.terrain.apparence = [];
		this.bitMasking();
	}

		/*
		  ______           _            
		 |  ____|         (_)           
		 | |__   _ __      _  ___ _   _ 
		 |  __| | '_ \    | |/ _ \ | | |
		 | |____| | | |   | |  __/ |_| |
		 |______|_| |_|   | |\___|\__,_|
		                 _/ |           
		                |__/            
		*/
	initialiser() {
		this.initialiserMap();
		this.voiture = new Entite(this, 100, 80, this.ressources.voiture);
		this.camera = new Camera(this,this.voiture);
		this.boucle();
	}

	update(dt){
		this.voiture.update(dt);
		this.camera.update();
	}
	render() {

		// Clear Screen
		this.ctx.fillStyle = this.fond;
		this.ctx.fillRect(0, 0, this.L, this.H);
		// render entity
		this.ctx.save();
		this.ctx.translate(-this.camera.pos.x+this.L/2,-this.camera.pos.y+this.L/2);
		this.renduTerrain()
		this.ecrire("Game protype",100,20,1);
		this.ecrire("Arrow keys to move :) ",(this.L/2)+40,30,1);
		this.voiture.rendu();
		this.ctx.restore();

	}
	boucle() {

	this.now = timestamp();
	this.dt += Math.min(1, (this.now - this.last) / 1000);

	while (this.dt > this.step) {
		this.dt -= this.step;
		this.update(this.step);
	}
	this.render();
	this.last = this.now;
	this.animation = requestAnimationFrame(() => this.boucle());

	}
	phase(phase) {
		this.etat = phase;
		cancelAnimationFrame(this.animation);
		this.ctx.fillStyle = this.fond;
		this.ctx.fillRect(0, 0, this.L, this.H);
		switch (phase) {
			case "menu":
				// affiche le menu du jeu
				this.ctx.drawImage(this.ressources.titre.img, 0, 0);
				this.menu.rendu();
				this.ecrire("[arrow keys] to select [x] to confirm", this.L / 2, this.H - 25);
				break;
			case "start":
				this.initialiser();
				break;
			case "mort":
				// affiche le tableau de mort du joueur
				this.ecrire("vous etes mort", this.L / 2, 15);
				this.ecrire("appuyez sur 'c' pour retourner au menu", this.L / 2, this.H - 25);
				break;
			case "regles":
				// affiche les regles
				this.ecrire("controles : ", this.L / 2, 15);
				this.ecrire("arrow keys to move", this.L / 2, 35);
				this.ecrire("'x' and 'c' for actions", this.L / 2, 45);
				this.ecrire("'f' to toggle fullscreen", this.L / 2, 55);
				this.ecrire("'e' to exit the game", this.L / 2, 65);
				this.ecrire("rules : ", this.L / 2, 90);
				this.ecrire("il me faut des regles :)", this.L / 2, 110);
				this.ecrire("appuyez sur 'c' pour retourner au menu", this.L / 2, this.H - 25);
				break;
			case "info":
				// Affiche les infos
				this.ecrire("About : ", this.L / 2, 15);
				this.ecrire("made with html5 canvas", this.L / 2, 40);
				this.ecrire("by g.tibo on codepen", this.L / 2, 55);
				this.ecrire("appuyez sur 'c' pour retourner au menu", this.L / 2, this.H - 25);
				break;
			default:
				console.log("aucune action reconnue");
		}
	}
}

    let parametres = {
       taille:16,
       zoom:4,
       
      stockSon:[
        ],

       stockImages: [
       {img:"https://image.ibb.co/cKiv2v/font.png",nom:"pixelFont"},
       {img:"https://image.ibb.co/ntZeUa/curseur.png",nom:"curseur"},
       {img:"https://image.ibb.co/hibF2v/titre.png",nom:"titre"},
       {img:"https://image.ibb.co/dBB4vF/feuille.png",nom:"feuille"},
       {img:"https://image.ibb.co/b1nzUa/dust.png",nom:"dust"},
       {img:"https://image.ibb.co/dsueUa/voiture.png",nom:"voiture",sep:9},
           ],

       clefs:[
       {type:"tuile",nom:"dirt",id:0,collision:false,apparence:0},
       {type:"tuile",nom:"dirt",id:1,collision:false,apparence:1},
       {type:"tuile",nom:"road",id:2,collision:false,apparence:"auto",ligne:1},
       {type:"tuile",nom:"fence",id:3,collision:true,apparence:"auto",ligne:2},
       {type:"tuile",nom:"fence",id:4,collision:true,apparence:"auto",ligne:3},
       ],
    }

let niveaux = [
{"titre":"title","taille":16,"geometrie":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],[1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],[1,1,2,2,0,0,0,0,0,0,0,0,2,2,1,1],[1,1,2,2,0,0,0,0,0,0,0,0,2,2,1,1],[1,1,2,2,0,0,0,0,0,0,0,0,2,2,1,1],[1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],[1,1,2,2,2,2,2,2,2,2,2,2,2,2,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]},
];


		let demo = new Monde(parametres,niveaux);
