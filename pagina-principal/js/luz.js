class AtlasAssistant {
  constructor() {
    this.devices = {
      "luz-sala": false,
      "luz-quarto": false,
      "luz-cozinha": false,
      "luz-escritorio": false,
    };
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
      } else if (cmd.includes("escritorio")) {
        this.toggleDevice("luz-escritorio", true);
        response = "Acendendo a luz do escritorio";
      } else if (
        cmd.includes("tudo") ||
        cmd.includes("todas") ||
        cmd.includes("casa toda") ||
        cmd.includes("inteira")
      ) {
        this.toggleDevice("luz-sala", true);
        this.toggleDevice("luz-quarto", true);
        this.toggleDevice("luz-cozinha", true);
        this.toggleDevice("luz-escritorio", true);
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
      } else if (cmd.includes("escritorio")) {
        this.toggleDevice("luz-escritorio", false);
        response = "Acendendo a luz do escritorio";
      } else if (
        cmd.includes("tudo") ||
        cmd.includes("todas") ||
        cmd.includes("casa toda") ||
        cmd.includes("inteira")
      ) {
        this.toggleDevice("luz-sala", false);
        this.toggleDevice("luz-quarto", false);
        this.toggleDevice("luz-cozinha", false);
        this.toggleDevice("luz-escritorio", false);
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
      const escritorioStatus = this.devices["luz-escritorio"]
        ? "ligada"
        : "desligada";
      response = `Luz da sala está ${salaStatus}, quarto está ${quartoStatus}, 
      cozinha está ${cozinhaStatus}, e escritorio está ${escritorioStatus}`;
    }

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
  }
}
