const { UserService } = require("../src/userService");

describe("UserService - Suíte de Testes Refatorada", () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  // ============================================================
  // TESTES DE CRIAÇÃO DE USUÁRIO
  // ============================================================

  describe("createUser", () => {
    test("deve criar um usuário com dados válidos", () => {
      // Arrange
      const nome = "Fulano de Tal";
      const email = "fulano@teste.com";
      const idade = 25;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado).toBeDefined();
      expect(usuarioCriado.id).toBeDefined();
      expect(usuarioCriado.nome).toBe(nome);
      expect(usuarioCriado.email).toBe(email);
      expect(usuarioCriado.idade).toBe(idade);
      expect(usuarioCriado.isAdmin).toBe(false);
      expect(usuarioCriado.status).toBe("ativo");
      expect(usuarioCriado.createdAt).toBeInstanceOf(Date);
    });

    test("deve criar um usuário administrador quando isAdmin é true", () => {
      // Arrange
      const nome = "Admin";
      const email = "admin@teste.com";
      const idade = 30;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade, true);

      // Assert
      expect(usuarioCriado.isAdmin).toBe(true);
    });

    test("deve lançar erro ao tentar criar usuário sem nome", () => {
      // Arrange
      const nome = null;
      const email = "teste@teste.com";
      const idade = 25;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow("Nome, email e idade são obrigatórios.");
    });

    test("deve lançar erro ao tentar criar usuário sem email", () => {
      // Arrange
      const nome = "Fulano";
      const email = null;
      const idade = 25;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow("Nome, email e idade são obrigatórios.");
    });

    test("deve lançar erro ao tentar criar usuário sem idade", () => {
      // Arrange
      const nome = "Fulano";
      const email = "fulano@teste.com";
      const idade = null;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow("Nome, email e idade são obrigatórios.");
    });

    test("deve lançar erro ao tentar criar usuário menor de idade", () => {
      // Arrange
      const nome = "Menor";
      const email = "menor@email.com";
      const idade = 17;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow("O usuário deve ser maior de idade.");
    });
  });

  // ============================================================
  // TESTES DE BUSCA DE USUÁRIO
  // ============================================================

  describe("getUserById", () => {
    test("deve retornar um usuário existente pelo ID", () => {
      // Arrange
      const usuarioCriado = userService.createUser(
        "Alice",
        "alice@teste.com",
        28
      );

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toBeDefined();
      expect(usuarioBuscado.id).toBe(usuarioCriado.id);
      expect(usuarioBuscado.nome).toBe("Alice");
      expect(usuarioBuscado.email).toBe("alice@teste.com");
    });

    test("deve retornar null ao buscar usuário com ID inexistente", () => {
      // Arrange
      const idInexistente = "id-que-nao-existe";

      // Act
      const usuarioBuscado = userService.getUserById(idInexistente);

      // Assert
      expect(usuarioBuscado).toBeNull();
    });
  });

  // ============================================================
  // TESTES DE DESATIVAÇÃO DE USUÁRIO
  // ============================================================

  describe("deactivateUser", () => {
    test("deve desativar um usuário comum com sucesso", () => {
      // Arrange
      const usuarioComum = userService.createUser(
        "Comum",
        "comum@teste.com",
        30
      );

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe("inativo");
    });

    test("deve impedir a desativação de um usuário administrador", () => {
      // Arrange
      const usuarioAdmin = userService.createUser(
        "Admin",
        "admin@teste.com",
        40,
        true
      );

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe("ativo");
    });

    test("deve retornar false ao tentar desativar usuário inexistente", () => {
      // Arrange
      const idInexistente = "id-que-nao-existe";

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  // ============================================================
  // TESTES DE GERAÇÃO DE RELATÓRIO
  // ============================================================

  describe("generateUserReport", () => {
    test("deve gerar relatório contendo os usuários cadastrados", () => {
      // Arrange
      userService.createUser("Alice", "alice@email.com", 28);
      userService.createUser("Bob", "bob@email.com", 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain("Alice");
      expect(relatorio).toContain("Bob");
      expect(relatorio).toContain("ativo");
    });

    test("deve gerar relatório com mensagem adequada quando não há usuários", () => {
      // Arrange
      // Banco de dados vazio (nenhum usuário criado)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain("Nenhum usuário cadastrado");
    });

    test("deve incluir status atualizado no relatório após desativação", () => {
      // Arrange
      const usuario = userService.createUser("Carlos", "carlos@email.com", 35);
      userService.deactivateUser(usuario.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain("Carlos");
      expect(relatorio).toContain("inativo");
    });
  });
});
