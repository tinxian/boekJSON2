// JSON importeren
let xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
   if (this.readyState == 4 && this.status == 200) {
      sorteerBoek.data = JSON.parse(this.responseText);
      sorteerBoek.voegJSDatumtoe();

      // de data moeten een eigenschap hebben waarbij de titels in kapitalen staan
      // daarop kan dan gesorteerd worden
      sorteerBoek.data.forEach(boek => {
         boek.titelKap = boek.titel.toUpperCase();
         // ook de achter(naam) van de eerste auteur als eigenschap in data toevoegen
         boek.sorteerAuteurs = boek.auteur[0];
      })
      sorteerBoek.sorteren();
   }
}
xmlhttp.open("GET", "boeken.json", true);
xmlhttp.send();

// een tabelkop in markup uitvoeren uit een array
const TabelKop = (arr) => {
   let kop = "<table class='boekSelectie'><tr>";
   arr.forEach((item) => {
      kop += "<th>" + item + "</th>";
   })
   kop += "</tr>";
   return kop;
}



// functie maakt van een array een opsomming met ', ' en ' en '
const opsomming = (array) => {
   let string = "";
   for (let i = 0; i < array.length; i++) {
      switch (i) {
         case array.length - 1:
            string += array[i];
            break;
         case array.length - 2:
            string += array[i] + " en ";
            break;
         default:
            string += array[i] + ", ";
      }
   }
   return string;
}

// functie die van een maand-string een nummer maakt
// waarbij januari een 0 geeft
// en december een 11
const geefMaandNummer = (maand) => {
   let nummer;
   switch (maand) {
      case "januari":
         nummer = 0;
         break;
      case "februari":
         nummer = 1;
         break;
      case "maart":
         nummer = 2;
         break;
      case "april":
         nummer = 3;
         break;
      case "mei":
         nummer = 4;
         break;
      case "juni":
         nummer = 5;
         break;
      case "juli":
         nummer = 6;
         break;
      case "augustus":
         nummer = 7;
         break;
      case "september":
         nummer = 8;
         break;
      case "oktober":
         nummer = 9;
         break;
      case "november":
         nummer = 10;
         break;
      case "december":
         nummer = 11;
         break;

      default:
         nummer = 0
         break;
   }
   return nummer;
}

// functie die een string van maand jaar omzet in een date-object
const VoegJSDatum = (maandJaar) => {
   let mjArray = maandJaar.split(" ");
   let datum = new Date(mjArray[1], geefMaandNummer(mjArray[0]));
   return datum;
}

// maak een functie die de tekst achter de komma vooraan plaatst

const keerTekstOm = (string) => {
   if (string.indexOf(',') != -1) {
      let array = string.split(',');
      string = array[1] + ' ' + array[0];
   }
   return string;
}

// een winkelwagen object deze toegevoegde items bevat
// een methode om toe te voegen
// een methode om producten te verwijderen
// een methode om de winkelwagen aantal bij te werken

let winkelwagen = {
   items: [],

   haalProductenOp: function() {
      let bestelling;
      if(localStorage.getItem('besteldeBoeken')== null) {
         bestelling = [];
      }
      else {
         bestelling = JSON.parse(localStorage.getItem('besteldeBoeken'));
         bestelling.forEach(item => {
            this.items.push(item);
         })
         this.uitvoeren();
      }
      return bestelling;
   },
   toevoegen: function (el) {
      this.items = this.haalProductenOp();
      this.items.push(el);
      localStorage.setItem('besteldeBoeken', JSON.stringify(this.items));
      this.uitvoeren();
   },

   uitvoeren: function() {
      if(this.items.length > 0) {
         document.querySelector('.winkelwagen__aantal').innerHTML = this.items.length;
      }
      else {
         document.querySelector('.winkelwagen__aantal').innerHTML = "";
      }
   }
}

winkelwagen.haalProductenOp();

// object dat de boeken uitvoert en sorteert en data bevat
// eigenschappen: data sorteerkenmerk
// methods: sorteren() en uitvoeren()
let sorteerBoek = {
   data: "", // komt van xmlhttp.onreadystatechange

   kenmerk: "titelKap",

   // sorteervolgorde en factor
   lopend: 1,

   // een datumObject toevoegen aan this.data uit de string uitgave
   voegJSDatumtoe: function () {
      this.data.forEach((item) => {
         item.Datums = VoegJSDatum(item.uitgave);
      });
   },

   // data sorteren
   sorteren: function () {
      this.data.sort((a, b) => a[this.kenmerk] > b[this.kenmerk] ? 1 * this.lopend : -1 * this.lopend);
      this.uitvoeren(this.data);
   },

   // de data in een tabel uitvoeren
   uitvoeren: function (data) {
      //eerst de uitvoer leegmaken
      document.getElementById('uitvoer').innerHTML = "";
      data.forEach(boek => {
         let sectie = document.createElement('section');
         sectie.className = 'boekSelectie';
         // main element met alle informatie behalve de prijs en de afbeelding
         let main = document.createElement('main');
         main.className = 'boekSelectie__main';

         //cover maken (afbeelding)
         let afbeelding = document.createElement('img');
         afbeelding.className = 'boekSelectie__cover';
         afbeelding.setAttribute('src', boek.cover);
         afbeelding.setAttribute('alt', keerTekstOm(boek.titel));

         // titel maken
         let titel = document.createElement('h3');
         titel.className = 'boekSelectie__titel';
         titel.textContent = keerTekstOm(boek.titel);

         // auteurs toevoegen
         let auteurs = document.createElement('p');
         auteurs.className = 'boekSelectie__auteurs';
         // de voor en achternaam van de auteur omdraaien
         boek.auteur[0] = keerTekstOm(boek.auteur[0]);
         // auteurs staan in een array omzetten naar tekst.
         auteurs.textContent = opsomming(boek.auteur);

         // overige info toevoegen
         let overig = document.createElement('p');
         overig.className = 'boekSelectie__overig';
         overig.textContent = 'datum: ' + boek.uitgave + ' | aantal bladzijden: ' + boek.paginas + ' | taal: ' + boek.taal + ' | ean: ' + boek.ean;

         // prijs toevoegen aan de webshop
         let prijs = document.createElement('div');
         prijs.className = 'boekSelectie__prijs';
         prijs.textContent = boek.prijs.toLocaleString('nl-NL', {
            currency: 'EUR',
            style: 'currency'
         });

         // button toevoegen bij het product
         let button = document.createElement('button');
         button.className = 'boekSelectie__button';
         button.innerHTML = 'Voeg toe aan<br>winkelwagen';
         button.addEventListener('click', () => {
            winkelwagen.toevoegen(boek);
         })

         // de element toevoegen
         sectie.appendChild(afbeelding);
         main.appendChild(titel);
         main.appendChild(auteurs);
         main.appendChild(overig);
         sectie.appendChild(main);
         prijs.appendChild(button)
         sectie.appendChild(prijs);
         document.getElementById('uitvoer').appendChild(sectie);
      });

   }
}

// keuze voorsorteer opties
let kenmerk = document.getElementById('kenmerk').addEventListener('change', (e) => {
   sorteerBoek.kenmerk = e.target.value;
   sorteerBoek.sorteren();
});

document.getElementsByName('lopend').forEach((item) => {
   item.addEventListener('click', (e) => {
      sorteerBoek.lopend = parseInt(e.target.value);
      sorteerBoek.sorteren();
   })
})
