// ========================================
// ATLAS - Assistente Virtual Residencial
// Developed by: Ana Marya, Andriely, Fernanda
// ========================================

class AtlasAssistant {
  constructor() {
    this.devices = {
      "luz-sala": false,
      "luz-quarto": false,
      "luz-cozinha": false,
    };

    this.temperature = 22;
    this.acOn = false;
    this.musicPlaying = false;
    this.currentSong = "";
    this.playlist = [
      "Música Relaxante 1",
      "Música Relaxante 2",
      "Música Energizante 1",
      "Sons da Natureza",
    ];

    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;

    // Shopping cart
    this.cart = [];
    this.productDatabase = {
      arroz: { name: "Arroz 5kg", price: 25.9 },
      feijão: { name: "Feijão 1kg", price: 8.5 },
      feijao: { name: "Feijão 1kg", price: 8.5 },
      macarrão: { name: "Macarrão 500g", price: 4.2 },
      macarrao: { name: "Macarrão 500g", price: 4.2 },
      leite: { name: "Leite 1L", price: 4.8 },
      café: { name: "Café 500g", price: 12.9 },
      cafe: { name: "Café 500g", price: 12.9 },
      açúcar: { name: "Açúcar 1kg", price: 4.5 },
      acucar: { name: "Açúcar 1kg", price: 4.5 },
      óleo: { name: "Óleo 900ml", price: 7.9 },
      oleo: { name: "Óleo 900ml", price: 7.9 },
      pão: { name: "Pão Francês", price: 12.0 },
      pao: { name: "Pão Francês", price: 12.0 },
      ovos: { name: "Ovos (dúzia)", price: 9.5 },
      manteiga: { name: "Manteiga 500g", price: 15.9 },
      queijo: { name: "Queijo Mussarela", price: 35.0 },
      presunto: { name: "Presunto", price: 28.0 },
      tomate: { name: "Tomate (kg)", price: 6.5 },
      cebola: { name: "Cebola (kg)", price: 4.0 },
      batata: { name: "Batata (kg)", price: 5.5 },
      carne: { name: "Carne Bovina (kg)", price: 45.0 },
      frango: { name: "Frango (kg)", price: 18.0 },
      sabão: { name: "Sabão em Pó", price: 14.9 },
      sabao: { name: "Sabão em Pó", price: 14.9 },
      detergente: { name: "Detergente", price: 2.5 },
      papel: { name: "Papel Higiênico", price: 18.0 },
      água: { name: "Água Mineral 1.5L", price: 2.5 },
      agua: { name: "Água Mineral 1.5L", price: 2.5 },
      refrigerante: { name: "Refrigerante 2L", price: 7.9 },
      suco: { name: "Suco 1L", price: 6.5 },
    };

    // GPS
    this.currentPosition = null;
    this.destination = null;

    this.init();
  }

  init() {
    this.setupSpeechRecognition();
    this.setupEventListeners();
    this.speak(
      "Olá! Sou a Atlas, sua assistente virtual. Como posso ajudar você hoje?"
    );
  }

  // ========================================
  // SPEECH RECOGNITION (Reconhecimento de Voz)
  // ========================================
  setupSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "pt-BR";
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        document.getElementById("voiceBtn").classList.add("listening");
        console.log("Atlas está ouvindo...");
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Você disse:", transcript);
        this.addMessage(transcript, "user");
        this.processCommand(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        this.speak("Desculpe, não consegui entender. Pode repetir?");
      };

      this.recognition.onend = () => {
        this.isListening = false;
        document.getElementById("voiceBtn").classList.remove("listening");
      };
    } else {
      console.warn("Reconhecimento de voz não suportado neste navegador");
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    } else {
      alert(
        "Reconhecimento de voz não disponível. Use o navegador Chrome ou Edge."
      );
    }
  }

  // ========================================
  // TEXT TO SPEECH (Síntese de Voz)
  // ========================================
  speak(text) {
    if (this.synthesis) {
      // Cancela qualquer fala anterior
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.9;
      utterance.pitch = 1.1;

      // Tenta usar voz feminina em português
      const voices = this.synthesis.getVoices();
      const portugueseVoice =
        voices.find(
          (voice) => voice.lang.includes("pt") && voice.name.includes("female")
        ) || voices.find((voice) => voice.lang.includes("pt"));

      if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }

      this.synthesis.speak(utterance);
    }
  }

  // ========================================
  // COMMAND PROCESSING (Processamento de Comandos)
  // ========================================
  processCommand(command) {
    const cmd = command.toLowerCase();
    let response = "";

    // Comandos de iluminação EXPANDIDOS
    if (
      cmd.includes("acend") ||
      cmd.includes("lig") ||
      cmd.includes("abrir luz") ||
      (cmd.includes("luz") && (cmd.includes("liga") || cmd.includes("acende")))
    ) {
      if (cmd.includes("sala")) {
        this.toggleDevice("luz-sala", true);
        response = "Acendendo a luz da sala";
      } else if (cmd.includes("quarto")) {
        this.toggleDevice("luz-quarto", true);
        response = "Acendendo a luz do quarto";
      } else if (cmd.includes("cozinha")) {
        this.toggleDevice("luz-cozinha", true);
        response = "Acendendo a luz da cozinha";
      } else if (
        cmd.includes("tudo") ||
        cmd.includes("todas") ||
        cmd.includes("casa toda") ||
        cmd.includes("inteira")
      ) {
        this.toggleDevice("luz-sala", true);
        this.toggleDevice("luz-quarto", true);
        this.toggleDevice("luz-cozinha", true);
        response = "Acendendo todas as luzes da casa";
      }
    } else if (
      cmd.includes("apag") ||
      cmd.includes("deslig") ||
      cmd.includes("fechar luz") ||
      cmd.includes("escurecer")
    ) {
      if (cmd.includes("sala")) {
        this.toggleDevice("luz-sala", false);
        response = "Apagando a luz da sala";
      } else if (cmd.includes("quarto")) {
        this.toggleDevice("luz-quarto", false);
        response = "Apagando a luz do quarto";
      } else if (cmd.includes("cozinha")) {
        this.toggleDevice("luz-cozinha", false);
        response = "Apagando a luz da cozinha";
      } else if (
        cmd.includes("tudo") ||
        cmd.includes("todas") ||
        cmd.includes("casa toda") ||
        cmd.includes("inteira")
      ) {
        this.toggleDevice("luz-sala", false);
        this.toggleDevice("luz-quarto", false);
        this.toggleDevice("luz-cozinha", false);
        response = "Apagando todas as luzes da casa";
      }
    }

    // Comandos de status de luzes
    else if (
      (cmd.includes("luz") || cmd.includes("luzes")) &&
      (cmd.includes("estão") ||
        cmd.includes("está") ||
        cmd.includes("status") ||
        cmd.includes("situação"))
    ) {
      const salaStatus = this.devices["luz-sala"] ? "ligada" : "desligada";
      const quartoStatus = this.devices["luz-quarto"] ? "ligada" : "desligada";
      const cozinhaStatus = this.devices["luz-cozinha"]
        ? "ligada"
        : "desligada";
      response = `Luz da sala está ${salaStatus}, quarto está ${quartoStatus}, e cozinha está ${cozinhaStatus}`;
    }

    // Comandos de temperatura EXPANDIDOS
    else if (
      cmd.includes("temperatura") ||
      cmd.includes("clima") ||
      cmd.includes("graus") ||
      cmd.includes("ar condicionado") ||
      cmd.includes("aquecimento") ||
      cmd.includes("resfriamento")
    ) {
      if (
        cmd.includes("aumenta") ||
        cmd.includes("mais quente") ||
        cmd.includes("esquenta") ||
        cmd.includes("aquecer") ||
        cmd.includes("mais calor")
      ) {
        this.adjustTemperature(1);
        response = `Aumentando a temperatura para ${this.temperature} graus`;
      } else if (
        cmd.includes("diminui") ||
        cmd.includes("mais frio") ||
        cmd.includes("esfria") ||
        cmd.includes("esfriar") ||
        cmd.includes("resfriar") ||
        cmd.includes("gelado")
      ) {
        this.adjustTemperature(-1);
        response = `Diminuindo a temperatura para ${this.temperature} graus`;
      } else if (cmd.includes("máximo") || cmd.includes("maximo")) {
        this.temperature = 30;
        document.getElementById("currentTemp").textContent = this.temperature;
        response = "Temperatura ajustada para o máximo: 30 graus";
      } else if (cmd.includes("mínimo") || cmd.includes("minimo")) {
        this.temperature = 16;
        document.getElementById("currentTemp").textContent = this.temperature;
        response = "Temperatura ajustada para o mínimo: 16 graus";
      } else if (
        cmd.includes("ideal") ||
        cmd.includes("confortável") ||
        cmd.includes("confortavel") ||
        cmd.includes("normal")
      ) {
        this.temperature = 22;
        document.getElementById("currentTemp").textContent = this.temperature;
        response = "Temperatura ajustada para 22 graus, temperatura ideal";
      } else {
        response = `A temperatura atual é ${this.temperature} graus Celsius`;
      }
    }

    // Comandos de música EXPANDIDOS
    else if (
      cmd.includes("música") ||
      cmd.includes("musica") ||
      cmd.includes("toca") ||
      cmd.includes("som") ||
      cmd.includes("audio")
    ) {
      if (
        cmd.includes("para") ||
        cmd.includes("pause") ||
        cmd.includes("pausa") ||
        cmd.includes("parar")
      ) {
        this.pauseMusic();
        response = "Pausando a música";
      } else if (
        cmd.includes("próxima") ||
        cmd.includes("proxima") ||
        cmd.includes("pula") ||
        cmd.includes("avança") ||
        cmd.includes("avanca") ||
        cmd.includes("próximo") ||
        cmd.includes("proximo")
      ) {
        this.nextSong();
        return; // nextSong já fala
      } else if (
        cmd.includes("relaxante") ||
        cmd.includes("calma") ||
        cmd.includes("tranquila")
      ) {
        this.currentSong = "Música Relaxante 1";
        this.playMusic();
        response = "Tocando música relaxante";
      } else if (
        cmd.includes("animada") ||
        cmd.includes("agitada") ||
        cmd.includes("energia") ||
        cmd.includes("energizante")
      ) {
        this.currentSong = "Música Energizante 1";
        this.playMusic();
        response = "Tocando música energizante";
      } else if (cmd.includes("natureza") || cmd.includes("ambiente")) {
        this.currentSong = "Sons da Natureza";
        this.playMusic();
        response = "Tocando sons da natureza";
      } else if (
        cmd.includes("qual") &&
        (cmd.includes("tocando") ||
          cmd.includes("está") ||
          cmd.includes("agora"))
      ) {
        response = this.musicPlaying
          ? `Está tocando: ${this.currentSong}`
          : "Nenhuma música tocando no momento";
      } else {
        this.playMusic();
        response = `Tocando ${this.currentSong}`;
      }
    }

    // Comandos de informação EXPANDIDOS
    else if (
      cmd.includes("tempo") &&
      (cmd.includes("qual") ||
        cmd.includes("como") ||
        cmd.includes("está") ||
        cmd.includes("hoje"))
    ) {
      this.getWeather();
      return; // A resposta será dada pela função getWeather
    } else if (
      cmd.includes("hora") ||
      cmd.includes("horas") ||
      (cmd.includes("que") && cmd.includes("agora"))
    ) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      if (
        cmd.includes("completa") ||
        cmd.includes("exata") ||
        cmd.includes("com segundos")
      ) {
        response = `Agora são exatamente ${hours} horas, ${minutes} minutos e ${seconds} segundos`;
      } else {
        response = `Agora são ${hours} horas e ${minutes} minutos`;
      }
    } else if (
      cmd.includes("data") ||
      cmd.includes("dia") ||
      cmd.includes("hoje")
    ) {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const dateStr = now.toLocaleDateString("pt-BR", options);

      if (cmd.includes("semana") && !cmd.includes("data")) {
        const weekday = now.toLocaleDateString("pt-BR", { weekday: "long" });
        response = `Hoje é ${weekday}`;
      } else if (cmd.includes("mês") || cmd.includes("mes")) {
        const month = now.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        });
        response = `Estamos em ${month}`;
      } else if (cmd.includes("ano")) {
        response = `Estamos no ano de ${now.getFullYear()}`;
      } else {
        response = `Hoje é ${dateStr}`;
      }
    }

    // Comandos de cálculo simples
    else if (
      cmd.includes("quanto é") ||
      cmd.includes("quanto e") ||
      cmd.includes("calcular")
    ) {
      const calcResult = this.calculateSimple(cmd);
      if (calcResult) {
        response = calcResult;
      } else {
        response = "Desculpe, não consegui fazer esse cálculo";
      }
    }

    // Comandos de piadas e entretenimento
    else if (
      cmd.includes("piada") ||
      cmd.includes("conta uma piada") ||
      cmd.includes("me diverte")
    ) {
      const jokes = [
        "Por que o livro de matemática está triste? Porque tem muitos problemas!",
        "O que o zero disse para o oito? Que cinto legal!",
        "Por que a galinha atravessou a rua? Para chegar do outro lado!",
        "O que é um pontinho amarelo no céu? Um Yellowcóptero!",
        "Por que o computador foi ao médico? Porque estava com vírus!",
      ];
      response = jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Comandos de curiosidades
    else if (
      cmd.includes("curiosidade") ||
      cmd.includes("me ensina") ||
      cmd.includes("fato interessante")
    ) {
      const facts = [
        "O coração humano bate cerca de 100 mil vezes por dia",
        "A luz do sol leva aproximadamente 8 minutos para chegar à Terra",
        "O Brasil é o maior país da América do Sul com 8,5 milhões de km²",
        "Uma abelha visita cerca de 50 a 100 flores durante cada viagem de coleta",
        "O cérebro humano tem cerca de 86 bilhões de neurônios",
      ];
      response = facts[Math.floor(Math.random() * facts.length)];
    }

    // Comandos motivacionais
    else if (
      cmd.includes("motivação") ||
      cmd.includes("motivacao") ||
      cmd.includes("me motiva") ||
      cmd.includes("inspiração") ||
      cmd.includes("inspiracao")
    ) {
      const motivational = [
        "Você é capaz de muito mais do que imagina! Continue forte!",
        "Cada dia é uma nova oportunidade para ser melhor",
        "Acredite em você! O sucesso está mais perto do que parece",
        "Pequenos passos todos os dias levam a grandes conquistas",
        "Nunca desista dos seus sonhos! Você consegue!",
      ];
      response = motivational[Math.floor(Math.random() * motivational.length)];
    }

    // Comandos de segurança
    else if (cmd.includes("alarme") || cmd.includes("segurança")) {
      if (cmd.includes("ativa") || cmd.includes("liga")) {
        response =
          "Sistema de segurança ativado. Todas as câmeras estão monitorando";
      } else if (cmd.includes("desativa") || cmd.includes("desliga")) {
        response = "Sistema de segurança desativado";
      } else {
        response =
          "O sistema de segurança está ativo. Todas as câmeras funcionando normalmente";
      }
    }

    // Comandos de carrinho de compras EXPANDIDOS
    else if (
      cmd.includes("adicionar") ||
      cmd.includes("adiciona") ||
      cmd.includes("comprar") ||
      (cmd.includes("quero") &&
        (cmd.includes("arroz") ||
          cmd.includes("feijão") ||
          cmd.includes("leite"))) ||
      cmd.includes("colocar no carrinho") ||
      cmd.includes("põe") ||
      cmd.includes("poe")
    ) {
      const product = this.extractProduct(cmd);
      if (product) {
        this.addToCart(product);
        return; // A resposta será dada pela função addToCart
      } else {
        response =
          "Não encontrei esse produto. Tente produtos como: arroz, feijão, leite, café, pão, carne, frango, tomate, cebola";
      }
    } else if (
      cmd.includes("carrinho") ||
      cmd.includes("lista de compras") ||
      cmd.includes("minhas compras") ||
      cmd.includes("o que comprei")
    ) {
      if (
        cmd.includes("limpar") ||
        cmd.includes("esvaziar") ||
        cmd.includes("deletar") ||
        cmd.includes("remover tudo")
      ) {
        this.clearCart();
        response = "Carrinho de compras limpo";
      } else if (
        cmd.includes("mostrar") ||
        cmd.includes("ver") ||
        cmd.includes("abrir") ||
        cmd.includes("exibir")
      ) {
        this.showCart();
        response = "Abrindo seu carrinho de compras";
      } else if (cmd.includes("quantos") || cmd.includes("quantidade")) {
        const count = this.cart.length;
        response = `Você tem ${count} ${
          count === 1 ? "item" : "itens"
        } no carrinho`;
      } else if (
        cmd.includes("total") ||
        cmd.includes("valor") ||
        cmd.includes("preço") ||
        cmd.includes("preco") ||
        cmd.includes("quanto")
      ) {
        const total = this.getCartTotal();
        response = `O total do carrinho é R$ ${total.toFixed(2)}`;
      } else {
        const total = this.getCartTotal();
        const count = this.cart.length;
        if (count === 0) {
          response = "Seu carrinho está vazio";
        } else {
          const items = this.cart.map((item) => item.name).join(", ");
          response = `Você tem ${count} ${
            count === 1 ? "item" : "itens"
          } no carrinho: ${items}. Total: R$ ${total.toFixed(2)}`;
        }
      }
    }

    // Comandos para produtos específicos
    else if (
      cmd.includes("preço") ||
      cmd.includes("preco") ||
      cmd.includes("custa") ||
      cmd.includes("valor")
    ) {
      const product = this.extractProduct(cmd);
      if (product && this.productDatabase[product]) {
        response = `${
          this.productDatabase[product].name
        } custa R$ ${this.productDatabase[product].price.toFixed(2)}`;
      } else {
        response =
          "Qual produto você quer saber o preço? Temos arroz, feijão, leite, café, carne e muito mais";
      }
    }

    // Comandos de sugestão de compras
    else if (
      cmd.includes("sugerir") ||
      cmd.includes("sugestão") ||
      cmd.includes("sugestao") ||
      cmd.includes("o que comprar") ||
      cmd.includes("preciso comprar")
    ) {
      if (
        cmd.includes("básico") ||
        cmd.includes("basico") ||
        cmd.includes("essencial")
      ) {
        response =
          "Sugiro comprar itens básicos: arroz, feijão, óleo, sal, açúcar, leite e café. Deseja que eu adicione algum?";
      } else if (cmd.includes("limpeza")) {
        response =
          "Para limpeza sugiro: sabão em pó, detergente e papel higiênico. Deseja adicionar ao carrinho?";
      } else if (cmd.includes("churrasco")) {
        response =
          "Para churrasco sugiro: carne bovina, frango, sal e refrigerante. Vamos adicionar?";
      } else {
        response =
          "Posso sugerir itens básicos, de limpeza ou para churrasco. O que você precisa?";
      }
    }

    // Comandos de GPS/Navegação EXPANDIDOS
    else if (
      cmd.includes("navegar") ||
      cmd.includes("ir para") ||
      cmd.includes("ir até") ||
      cmd.includes("como chegar") ||
      cmd.includes("rota") ||
      cmd.includes("caminho") ||
      cmd.includes("me leva") ||
      cmd.includes("quero ir")
    ) {
      const destination = this.extractDestination(cmd);
      if (destination) {
        this.navigateTo(destination);
        return; // A resposta será dada pela função navigateTo
      } else {
        response =
          'Para onde você quer ir? Diga "navegar até" seguido do destino. Temos: padaria, mercado, farmácia, escola, hospital, banco e mais';
      }
    } else if (
      cmd.includes("onde estou") ||
      cmd.includes("minha localização") ||
      cmd.includes("localização") ||
      cmd.includes("minha posição") ||
      cmd.includes("coordenadas")
    ) {
      this.getCurrentLocation();
      return; // A resposta será dada pela função getCurrentLocation
    } else if (
      cmd.includes("distância") ||
      cmd.includes("distancia") ||
      cmd.includes("quanto falta") ||
      cmd.includes("longe") ||
      cmd.includes("perto") ||
      cmd.includes("tempo até")
    ) {
      if (this.destination) {
        response = `Você está a aproximadamente ${this.destination.distance} do destino ${this.destination.name}, tempo estimado: ${this.destination.duration}`;
      } else {
        response =
          "Nenhuma navegação ativa no momento. Quer navegar para algum lugar?";
      }
    }

    // Comandos de lugares próximos
    else if (
      cmd.includes("perto") ||
      cmd.includes("próximo") ||
      cmd.includes("proximo") ||
      cmd.includes("mais perto")
    ) {
      if (cmd.includes("farmácia") || cmd.includes("farmacia")) {
        response =
          "A farmácia mais próxima é a Farmácia São Paulo, a 600 metros. Deseja navegar até lá?";
      } else if (cmd.includes("mercado") || cmd.includes("supermercado")) {
        response =
          "O mercado mais próximo é o Supermercado Extra, a 1.2 km. Posso iniciar a navegação?";
      } else if (cmd.includes("padaria")) {
        response =
          "A padaria mais próxima é a Padaria Central, a 850 metros. Quer ir até lá?";
      } else {
        response =
          "O que você está procurando? Padaria, mercado, farmácia, hospital, escola?";
      }
    }

    // Comandos de ajuda
    else if (
      cmd.includes("ajuda") ||
      cmd.includes("o que você faz") ||
      cmd.includes("comandos")
    ) {
      response =
        'Posso controlar luzes, temperatura, música, fazer compras, navegar até lugares, fornecer informações sobre tempo e hora, e monitorar a segurança. Experimente: "adicionar arroz ao carrinho", "navegar até a padaria", "acender luz da sala"';
    }

    // Saudações EXPANDIDAS
    else if (
      cmd.includes("olá") ||
      cmd.includes("oi") ||
      cmd.includes("ola") ||
      cmd.includes("hey") ||
      cmd.includes("e ai") ||
      cmd.includes("eai")
    ) {
      const greetings = [
        "Olá! Como posso ajudar você hoje?",
        "Oi! Estou aqui para o que precisar!",
        "Olá! Pronta para te ajudar!",
        "E aí! O que você precisa?",
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (cmd.includes("bom dia")) {
      response = "Bom dia! Espero que tenha um ótimo dia! Como posso ajudar?";
    } else if (cmd.includes("boa tarde")) {
      response = "Boa tarde! O que posso fazer por você?";
    } else if (cmd.includes("boa noite")) {
      response = "Boa noite! Precisa de algo antes de dormir?";
    } else if (cmd.includes("obrigad")) {
      const thanks = [
        "Por nada! Estou aqui para ajudar sempre que precisar",
        "De nada! Foi um prazer ajudar",
        "Disponha! Conte comigo sempre",
        "Fico feliz em ajudar!",
      ];
      response = thanks[Math.floor(Math.random() * thanks.length)];
    } else if (
      cmd.includes("tchau") ||
      cmd.includes("até logo") ||
      cmd.includes("ate logo") ||
      cmd.includes("adeus") ||
      cmd.includes("falou")
    ) {
      response = "Até logo! Estarei aqui quando precisar. Tenha um ótimo dia!";
    }

    // Comandos de apresentação
    else if (
      cmd.includes("quem é você") ||
      cmd.includes("quem e voce") ||
      cmd.includes("seu nome") ||
      cmd.includes("o que você é") ||
      cmd.includes("o que voce e")
    ) {
      response =
        "Sou a Atlas, sua assistente virtual residencial. Fui criada pela equipe da ETEC Parque Marajoara para ajudar com automação da casa, compras, navegação e muito mais!";
    } else if (
      cmd.includes("como você funciona") ||
      cmd.includes("como funciona")
    ) {
      response =
        "Eu funciono através de reconhecimento de voz em português. Posso controlar luzes, temperatura, tocar música, fazer listas de compras, navegar até lugares e muito mais. Basta me dar comandos!";
    }

    // Comandos de humor
    else if (
      cmd.includes("como você está") ||
      cmd.includes("como vai") ||
      cmd.includes("tudo bem")
    ) {
      const moods = [
        "Estou ótima, obrigada por perguntar! E você?",
        "Indo muito bem! Pronta para ajudar!",
        "Excelente! O que posso fazer por você?",
        "Muito bem! Feliz em te ajudar hoje!",
      ];
      response = moods[Math.floor(Math.random() * moods.length)];
    }

    // Comandos de emergência
    else if (
      cmd.includes("emergência") ||
      cmd.includes("emergencia") ||
      cmd.includes("socorro") ||
      cmd.includes("ajuda urgente")
    ) {
      response =
        "ATENÇÃO: Em caso de emergência real, ligue 192 (SAMU), 193 (Bombeiros) ou 190 (Polícia). Posso ativar o alarme de segurança da casa se necessário";
    }

    // Comandos sobre a casa
    else if (
      cmd.includes("status da casa") ||
      cmd.includes("situação da casa") ||
      cmd.includes("como está a casa") ||
      cmd.includes("tudo em ordem")
    ) {
      const salaOn = this.devices["luz-sala"];
      const quartoOn = this.devices["luz-quarto"];
      const cozinhaOn = this.devices["luz-cozinha"];
      const lightsCount =
        (salaOn ? 1 : 0) + (quartoOn ? 1 : 0) + (cozinhaOn ? 1 : 0);
      response = `Status da casa: ${lightsCount} luz(es) acesa(s), temperatura em ${this.temperature}°C, sistema de segurança ativo, ${this.cart.length} itens no carrinho de compras`;
    }

    // Comando não reconhecido
    else {
      const suggestions = [
        'Desculpe, não entendi. Diga "ajuda" para ver o que posso fazer',
        "Não compreendi. Experimente comandos como: acender luz, tocar música, adicionar ao carrinho",
        'Ops! Não reconheci esse comando. Diga "o que você pode fazer" para ver minhas funções',
      ];
      response = suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    if (response) {
      this.addMessage(response, "assistant");
      this.speak(response);
    }
  }

  // ========================================
  // UTILITIES (Utilitários)
  // ========================================
  calculateSimple(command) {
    // Extrai números e operação
    const numbers = command.match(/\d+(\.\d+)?/g);
    if (!numbers || numbers.length < 2) return null;

    const num1 = parseFloat(numbers[0]);
    const num2 = parseFloat(numbers[1]);

    if (command.includes("mais") || command.includes("+")) {
      return `${num1} mais ${num2} é igual a ${num1 + num2}`;
    } else if (command.includes("menos") || command.includes("-")) {
      return `${num1} menos ${num2} é igual a ${num1 - num2}`;
    } else if (
      command.includes("vezes") ||
      command.includes("multiplicado") ||
      command.includes("×") ||
      command.includes("*")
    ) {
      return `${num1} vezes ${num2} é igual a ${num1 * num2}`;
    } else if (
      command.includes("dividido") ||
      command.includes("÷") ||
      command.includes("/")
    ) {
      if (num2 === 0) return "Não posso dividir por zero";
      return `${num1} dividido por ${num2} é igual a ${(num1 / num2).toFixed(
        2
      )}`;
    }

    return null;
  }

  // ========================================
  // DEVICE CONTROL (Controle de Dispositivos)
  // ========================================
  toggleDevice(deviceId, state) {
    this.devices[deviceId] = state;
    const deviceCard = document.querySelector(`[data-device="${deviceId}"]`);
    const toggleBtn = deviceCard.querySelector(".toggle-btn");
    const statusSpan = deviceCard.querySelector(".device-status");

    if (state) {
      deviceCard.classList.add("active");
      toggleBtn.classList.add("active");
      statusSpan.textContent = "Ligada";
      statusSpan.classList.add("on");
    } else {
      deviceCard.classList.remove("active");
      toggleBtn.classList.remove("active");
      statusSpan.textContent = "Desligada";
      statusSpan.classList.remove("on");
    }
  }

  adjustTemperature(delta) {
    this.temperature += delta;
    this.temperature = Math.max(16, Math.min(30, this.temperature));
    document.getElementById("currentTemp").textContent = this.temperature;

    if (this.temperature < 22) {
      document.getElementById("acStatus").textContent =
        "Ar condicionado ligado (resfriando)";
      this.acOn = true;
    } else if (this.temperature > 22) {
      document.getElementById("acStatus").textContent =
        "Ar condicionado ligado (aquecendo)";
      this.acOn = true;
    } else {
      document.getElementById("acStatus").textContent =
        "Ar condicionado desligado";
      this.acOn = false;
    }
  }

  // ========================================
  // MUSIC CONTROL (Controle de Música)
  // ========================================
  playMusic() {
    this.musicPlaying = true;
    if (!this.currentSong) {
      this.currentSong = this.playlist[0];
    }
    document.getElementById(
      "nowPlaying"
    ).textContent = `🎵 ${this.currentSong}`;
  }

  pauseMusic() {
    this.musicPlaying = false;
    document.getElementById("nowPlaying").textContent = "Música pausada ⏸️";
  }

  nextSong() {
    const currentIndex = this.playlist.indexOf(this.currentSong);
    const nextIndex = (currentIndex + 1) % this.playlist.length;
    this.currentSong = this.playlist[nextIndex];
    this.playMusic();
    this.speak(`Tocando ${this.currentSong}`);
  }

  // ========================================
  // WEATHER API (Simulação)
  // ========================================
  async getWeather() {
    // Simulação (para produção, usar API real como OpenWeatherMap)
    const conditions = [
      "ensolarado",
      "nublado",
      "chuvoso",
      "parcialmente nublado",
    ];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * 15) + 18;

    const response = `O tempo está ${condition} com temperatura de ${temp} graus Celsius`;
    this.addMessage(response, "assistant");
    this.speak(response);
  }

  // ========================================
  // SHOPPING CART (Carrinho de Compras)
  // ========================================
  extractProduct(command) {
    const words = command.toLowerCase().split(" ");
    for (let word of words) {
      // Remove pontuação
      word = word.replace(/[.,!?]/g, "");
      if (this.productDatabase[word]) {
        return word;
      }
    }
    return null;
  }

  addToCart(productKey) {
    const product = this.productDatabase[productKey];
    if (product) {
      this.cart.push({
        key: productKey,
        name: product.name,
        price: product.price,
        id: Date.now(),
      });

      this.updateCartDisplay();
      const response = `${
        product.name
      } adicionado ao carrinho por R$ ${product.price.toFixed(2)}`;
      this.addMessage(response, "assistant");
      this.speak(response);
    }
  }

  removeFromCart(itemId) {
    this.cart = this.cart.filter((item) => item.id !== itemId);
    this.updateCartDisplay();
    this.updateModalCart();
    this.speak("Item removido do carrinho");
  }

  clearCart() {
    this.cart = [];
    this.updateCartDisplay();
    this.updateModalCart();
  }

  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + item.price, 0);
  }

  updateCartDisplay() {
    const count = this.cart.length;
    const total = this.getCartTotal();

    document.getElementById("cartCount").textContent = `${count} ${
      count === 1 ? "item" : "itens"
    }`;
    document.getElementById("cartTotal").textContent = `R$ ${total.toFixed(2)}`;

    const cartItemsDiv = document.getElementById("cartItems");
    cartItemsDiv.innerHTML = "";

    this.cart.slice(-3).forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";
      itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(
                      2
                    )}</div>
                </div>
                <button class="remove-item-btn" data-item-id="${
                  item.id
                }">✕</button>
            `;
      cartItemsDiv.appendChild(itemDiv);
    });
  }

  showCart() {
    document.getElementById("cartModal").classList.add("active");
    this.updateModalCart();
  }

  hideCart() {
    document.getElementById("cartModal").classList.remove("active");
  }

  updateModalCart() {
    const modalBody = document.getElementById("modalCartItems");
    const modalTotal = document.getElementById("modalTotal");

    if (this.cart.length === 0) {
      modalBody.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
      modalTotal.textContent = "R$ 0,00";
      return;
    }

    modalBody.innerHTML = "";
    this.cart.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "modal-cart-item";
      itemDiv.innerHTML = `
                <div class="modal-cart-item-info">
                    <div class="modal-cart-item-name">${item.name}</div>
                    <div class="modal-cart-item-price">R$ ${item.price.toFixed(
                      2
                    )}</div>
                </div>
                <button class="remove-item-btn" data-item-id="${
                  item.id
                }">Remover</button>
            `;
      modalBody.appendChild(itemDiv);
    });

    const total = this.getCartTotal();
    modalTotal.textContent = `R$ ${total.toFixed(2)}`;
  }

  checkout() {
    if (this.cart.length === 0) {
      this.speak("Seu carrinho está vazio");
      return;
    }

    const total = this.getCartTotal();
    const count = this.cart.length;
    const itemsList = this.cart.map((item) => `- ${item.name}`).join("\n");

    alert(
      `🛒 RESUMO DA COMPRA\n\nItens (${count}):\n${itemsList}\n\nTotal: R$ ${total.toFixed(
        2
      )}\n\n✅ Em um app real, você seria direcionado para o pagamento.`
    );

    this.speak(
      `Compra finalizada! Total de R$ ${total.toFixed(
        2
      )}. Obrigada por usar a Atlas`
    );
    this.clearCart();
    this.hideCart();
  }

  // ========================================
  // GPS NAVIGATION (Navegação GPS)
  // ========================================
  extractDestination(command) {
    const cmd = command.toLowerCase();
    const patterns = [
      /navegar (?:até|para|ao|à) (.+)/,
      /ir (?:para|até|ao|à) (.+)/,
      /como chegar (?:até|em|na|no|ao|à) (.+)/,
    ];

    for (let pattern of patterns) {
      const match = cmd.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  getCurrentLocation() {
    if ("geolocation" in navigator) {
      this.speak("Obtendo sua localização");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const response = `Localização obtida: Latitude ${position.coords.latitude.toFixed(
            4
          )}, Longitude ${position.coords.longitude.toFixed(4)}`;
          document.getElementById(
            "currentLocation"
          ).textContent = `📍 ${response}`;
          this.addMessage(response, "assistant");
          this.speak("Localização obtida com sucesso");
        },
        (error) => {
          const errorMsg =
            "Não foi possível obter sua localização. Verifique as permissões do navegador.";
          this.addMessage(errorMsg, "assistant");
          this.speak(errorMsg);
        }
      );
    } else {
      const response = "GPS não disponível neste navegador";
      this.addMessage(response, "assistant");
      this.speak(response);
    }
  }

  navigateTo(destination) {
    // Simulação de navegação (em produção, usar Google Maps API ou similar)
    const destinations = {
      padaria: {
        name: "Padaria Central",
        distance: "850 metros",
        duration: "10 minutos a pé",
      },
      mercado: {
        name: "Supermercado Extra",
        distance: "1.2 km",
        duration: "5 minutos de carro",
      },
      farmácia: {
        name: "Farmácia São Paulo",
        distance: "600 metros",
        duration: "8 minutos a pé",
      },
      farmacia: {
        name: "Farmácia São Paulo",
        distance: "600 metros",
        duration: "8 minutos a pé",
      },
      posto: {
        name: "Posto Shell",
        distance: "2 km",
        duration: "7 minutos de carro",
      },
      escola: {
        name: "ETEC Parque Marajoara",
        distance: "3.5 km",
        duration: "12 minutos de carro",
      },
      hospital: {
        name: "Hospital Municipal",
        distance: "4 km",
        duration: "15 minutos de carro",
      },
      banco: {
        name: "Banco do Brasil",
        distance: "900 metros",
        duration: "11 minutos a pé",
      },
      correios: {
        name: "Agência dos Correios",
        distance: "1.5 km",
        duration: "6 minutos de carro",
      },
      shopping: {
        name: "Shopping Interlagos",
        distance: "5 km",
        duration: "18 minutos de carro",
      },
    };

    const destKey = destination.toLowerCase();
    let destInfo = destinations[destKey];

    if (!destInfo) {
      // Destino genérico
      destInfo = {
        name: destination,
        distance: "2.5 km",
        duration: "10 minutos de carro",
      };
    }

    this.destination = destInfo;

    const routeInfoDiv = document.getElementById("routeInfo");
    routeInfoDiv.classList.add("active");
    routeInfoDiv.innerHTML = `
            <div class="route-details">
                <h4>🎯 Destino: ${destInfo.name}</h4>
                <div class="route-detail-item">
                    <span>Distância:</span>
                    <strong>${destInfo.distance}</strong>
                </div>
                <div class="route-detail-item">
                    <span>Tempo estimado:</span>
                    <strong>${destInfo.duration}</strong>
                </div>
                <div style="margin-top: 10px; padding: 10px; background: #e3f2fd; border-radius: 5px; text-align: center;">
                    🧭 Navegação iniciada
                </div>
            </div>
        `;

    const response = `Navegando até ${destInfo.name}. Distância: ${destInfo.distance}, tempo estimado: ${destInfo.duration}`;
    this.addMessage(response, "assistant");
    this.speak(response);
  }

  // ========================================
  // CHAT INTERFACE (Interface de Chat)
  // ========================================
  addMessage(text, sender) {
    const chatMessages = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    const avatar = sender === "user" ? "👤" : "🤖";

    messageDiv.innerHTML = `
            <div class="avatar">${avatar}</div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ========================================
  // EVENT LISTENERS (Ouvintes de Eventos)
  // ========================================
  setupEventListeners() {
    // Voice button
    document.getElementById("voiceBtn").addEventListener("click", () => {
      this.startListening();
    });

    // Send button
    document.getElementById("sendBtn").addEventListener("click", () => {
      this.sendTextMessage();
    });

    // Enter key in input
    document.getElementById("chatInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendTextMessage();
      }
    });

    // Device toggles
    document.querySelectorAll(".toggle-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const deviceId = e.currentTarget.parentElement.dataset.device;
        const newState = !this.devices[deviceId];
        this.toggleDevice(deviceId, newState);

        const deviceName = deviceId.replace("luz-", "");
        const action = newState ? "Ligada" : "Desligada";
        this.speak(`${action} a luz da ${deviceName}`);
      });
    });

    // Temperature controls
    document.getElementById("tempUp").addEventListener("click", () => {
      this.adjustTemperature(1);
      this.speak(`Temperatura ajustada para ${this.temperature} graus`);
    });

    document.getElementById("tempDown").addEventListener("click", () => {
      this.adjustTemperature(-1);
      this.speak(`Temperatura ajustada para ${this.temperature} graus`);
    });

    // Music controls
    document.getElementById("playBtn").addEventListener("click", () => {
      this.playMusic();
      this.speak(`Tocando ${this.currentSong}`);
    });

    document.getElementById("pauseBtn").addEventListener("click", () => {
      this.pauseMusic();
      this.speak("Música pausada");
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
      this.nextSong();
    });

    // Alarm button
    document.getElementById("alarmBtn").addEventListener("click", () => {
      this.speak(
        "Alarme de teste ativado. Em uma situação real, a polícia seria notificada"
      );
      alert(
        "🚨 ALARME DE TESTE\n\nEm uma situação real, as seguintes ações seriam tomadas:\n- Notificação aos moradores registrados\n- Acionamento automático da polícia\n- Registro de imagens das câmeras\n- Envio de informações do invasor"
      );
    });

    // Shopping cart events
    document.getElementById("addProductBtn").addEventListener("click", () => {
      const input = document.getElementById("productInput");
      const product = input.value.trim().toLowerCase();

      if (product && this.productDatabase[product]) {
        this.addToCart(product);
        input.value = "";
      } else if (product) {
        this.speak("Produto não encontrado. Tente: arroz, feijão, leite, café");
      }
    });

    document
      .getElementById("productInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          document.getElementById("addProductBtn").click();
        }
      });

    document.getElementById("viewCartBtn").addEventListener("click", () => {
      this.showCart();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
      this.hideCart();
    });

    document.getElementById("checkoutBtn").addEventListener("click", () => {
      this.checkout();
    });

    document.getElementById("clearCartBtn").addEventListener("click", () => {
      if (confirm("Deseja realmente limpar o carrinho?")) {
        this.clearCart();
        this.speak("Carrinho limpo");
      }
    });

    // Event delegation for remove buttons (cart items)
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-item-btn")) {
        const itemId = parseInt(e.target.dataset.itemId);
        this.removeFromCart(itemId);
      }
    });

    // GPS/Navigation events
    document.getElementById("navigateBtn").addEventListener("click", () => {
      const input = document.getElementById("destinationInput");
      const destination = input.value.trim();

      if (destination) {
        this.navigateTo(destination);
        input.value = "";
      } else {
        this.speak("Por favor, digite um destino");
      }
    });

    document
      .getElementById("destinationInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          document.getElementById("navigateBtn").click();
        }
      });

    document.getElementById("getLocationBtn").addEventListener("click", () => {
      this.getCurrentLocation();
    });

    // Educational cards
    document.querySelectorAll(".edu-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const title = e.currentTarget.querySelector("a").textContent;
        this.speak(`módulo de ${title} iniciado`);
        alert(
          `Módulo "${title}" em desenvolvimento.\n\nEm breve você terá acesso a:\n- Conteúdo interativo\n- Exercícios práticos\n- Acompanhamento de progresso`
        );
      });
    });

    // Load voices for speech synthesis
    if (this.synthesis) {
      this.synthesis.onvoiceschanged = () => {
        const voices = this.synthesis.getVoices();
        console.log(
          "Vozes disponíveis:",
          voices.map((v) => v.name)
        );
      };
    }
  }

  sendTextMessage() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();

    if (text) {
      this.addMessage(text, "user");
      this.processCommand(text);
      input.value = "";
    }
  }
}

// ========================================
// INITIALIZE ATLAS
// ========================================
let atlas;

window.addEventListener("DOMContentLoaded", () => {
  atlas = new AtlasAssistant();
  console.log("Atlas inicializada e pronta para uso!");
});

// Obtém os elementos
const janelas = document.getElementById("janela-flutuante");
const header = document.getElementById("janela-header");

// Variáveis para armazenar a posição do mouse
let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;

header.onmousedown = dragMouseDown;

function dragMouseDown(e) {
  e = e || window.event;
  e.preventDefault();
  // Posição inicial do mouse
  pos3 = e.clientX;
  pos4 = e.clientY;
  document.onmouseup = closeDragElement;
  // Chama a função quando o mouse se move
  document.onmousemove = elementDrag;
}

function elementDrag(e) {
  e = e || window.event;
  e.preventDefault();
  // Calcula a nova posição
  pos1 = pos3 - e.clientX;
  pos2 = pos4 - e.clientY;
  pos3 = e.clientX;
  pos4 = e.clientY;
  // Define a nova posição do elemento
  janela.style.top = janela.offsetTop - pos2 + "px";
  janela.style.left = janela.offsetLeft - pos1 + "px";
}

function closeDragElement() {
  // Para de mover quando o mouse é solto
  document.onmouseup = null;
  document.onmousemove = null;
}
// Selecionar elementos
var janela = document.getElementById("minhaJanela");
var btn = document.getElementById("abrirBtn");
var span = document.getElementsByClassName("fechar")[0];

// Abrir a janela
btn.onclick = function () {
  janela.style.display = "block";
};

// Fechar a janela ao clicar no (x)
span.onclick = function () {
  janela.style.display = "none";
};

// Fechar ao clicar fora da janela
window.onclick = function (event) {
  if (event.target == janela) {
    janela.style.display = "none";
  }
};


const mensagens = document.querySelectorAll('#chatMessages .message');

mensagens.forEach(msg => {
  msg.style.display = 'none';
});

// Mostra a primeira mensagem da Atlas imediatamente
let i = 0;
mensagens[i].style.display = 'flex';
i++;

// Mostra as próximas mensagens progressivamente
function mostrarProximaMensagem() {
  if (i < mensagens.length) {
    mensagens[i].style.display = 'true';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    i++;
    setTimeout(mostrarProximaMensagem, 1500); // 1,5 s entre cada mensagem
  }
}

setTimeout(mostrarProximaMensagem, 1200);