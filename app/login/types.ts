export type Credenciais = {
  email: string;
  senha: string;
};

export type NovoUsuario = {
  nome: string;
  email: string;
  senha: string;
};

export type Papel = "operario" | "admin" | "owner";

export type TomPele = "tom1" | "tom2" | "tom3" | "tom4";
export type CorRoupa = "azul" | "rosa" | "verde" | "vermelho";
export type EstiloCabelo = "nenhum"; // mais opções no futuro

export type Avatar = {
  pele: TomPele;
  roupa: CorRoupa;
  cabelo: EstiloCabelo;
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  avatar: Avatar;
};

export type Sessao = {
  usuario: Usuario;
  token: string;
  expiraEm: string;
};
