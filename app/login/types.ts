export type Credenciais = {
  email: string;
  senha: string;
};

export type NovoUsuario = {
  nome: string;
  email: string;
  senha: string;
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
};

export type Sessao = {
  usuario: Usuario;
  token: string;
  expiraEm: string;
};
