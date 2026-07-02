"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { aceitarTermos } from "./termosApi";

export default function TermosPage() {
  const router = useRouter();
  const [aceitou, setAceitou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    if (!aceitou) return;
    try {
      setSalvando(true);
      setErro(null);
      await aceitarTermos();
      router.replace("/");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>

        <div className="top">
          <span className="eyebrow">Setor de Produção</span>
          <h1>Termos de Uso e Política de Privacidade</h1>
          <p>Leia com atenção antes de acessar o sistema. Última atualização: junho de 2026.</p>
        </div>

        {/* Termos de Uso */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <FileText size={20} color="var(--brand)" />
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Termos de Uso</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, color: "var(--text-body-2)", lineHeight: 1.7 }}>
            <p>
              Bem-vindo ao <strong>Sistema de Controle de Produção — Produção Start</strong>, desenvolvido pela equipe do Setor de Produção como parte do projeto integrador do curso. Ao acessar ou utilizar esta plataforma, você declara ter lido, compreendido e concordado integralmente com os presentes Termos de Uso.
            </p>

            <div>
              <strong>1. Definições</strong>
              <p style={{ marginTop: 4 }}>
                Para fins deste documento, entende-se por <strong>Sistema</strong> a plataforma web Produção Start; por <strong>Usuário</strong> qualquer pessoa física que acesse o sistema mediante credenciais válidas; e por <strong>Dados</strong> qualquer informação inserida, gerada ou transmitida pelo Usuário durante o uso da plataforma.
              </p>
            </div>

            <div>
              <strong>2. Acesso e credenciais</strong>
              <p style={{ marginTop: 4 }}>
                O acesso ao sistema é restrito a colaboradores previamente autorizados. Cada Usuário é responsável pela guarda e sigilo de suas credenciais de acesso (e-mail e senha), sendo vedado o compartilhamento com terceiros. Em caso de suspeita de uso indevido, o Usuário deve comunicar imediatamente o administrador do sistema.
              </p>
            </div>

            <div>
              <strong>3. Uso adequado da plataforma</strong>
              <p style={{ marginTop: 4 }}>
                O Usuário compromete-se a utilizar o sistema exclusivamente para fins relacionados à gestão de produção, incluindo cadastro de produtos, fichas técnicas, ordens de produção e acompanhamento via Kanban. É expressamente vedado:
              </p>
              <ul style={{ marginTop: 6, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                <li>Inserir informações falsas, incompletas ou desatualizadas;</li>
                <li>Tentar acessar áreas ou dados de outros usuários sem autorização;</li>
                <li>Utilizar o sistema para fins alheios à operação de produção;</li>
                <li>Praticar qualquer ato que comprometa a segurança, estabilidade ou disponibilidade da plataforma;</li>
                <li>Reproduzir, copiar ou distribuir o sistema ou seus componentes sem autorização expressa.</li>
              </ul>
            </div>

            <div>
              <strong>4. Responsabilidades do usuário</strong>
              <p style={{ marginTop: 4 }}>
                O Usuário é o único responsável pelas ações realizadas com suas credenciais, incluindo cadastros, edições e exclusões de dados. A equipe administradora do sistema não se responsabiliza por perdas decorrentes de uso indevido das credenciais pelo próprio Usuário ou por terceiros a quem este as tenha fornecido.
              </p>
            </div>

            <div>
              <strong>5. Disponibilidade do sistema</strong>
              <p style={{ marginTop: 4 }}>
                O sistema é disponibilizado em caráter acadêmico e pode passar por manutenções, atualizações ou interrupções sem aviso prévio. A equipe não garante disponibilidade ininterrupta da plataforma.
              </p>
            </div>

            <div>
              <strong>6. Modificações dos termos</strong>
              <p style={{ marginTop: 4 }}>
                Estes Termos de Uso podem ser atualizados a qualquer momento. O Usuário será notificado e deverá aceitar os novos termos para continuar utilizando o sistema. O uso continuado após a atualização implica concordância com as novas condições.
              </p>
            </div>

            <div>
              <strong>7. Encerramento de acesso</strong>
              <p style={{ marginTop: 4 }}>
                O acesso poderá ser suspenso ou revogado a qualquer momento em caso de: violação destes termos, uso indevido da plataforma, desligamento do colaborador da equipe ou por decisão administrativa justificada.
              </p>
            </div>
          </div>
        </div>

        {/* Política de Privacidade */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <ShieldCheck size={20} color="var(--brand)" />
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Política de Privacidade</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14, color: "var(--text-body-2)", lineHeight: 1.7 }}>
            <p>
              Esta Política de Privacidade descreve como o <strong>Sistema Produção Start</strong> coleta, utiliza, armazena e protege os dados pessoais dos seus Usuários, em conformidade com a <strong>Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD)</strong> e com o <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong>.
            </p>

            <div>
              <strong>1. Controlador dos dados</strong>
              <p style={{ marginTop: 4 }}>
                O controlador dos dados pessoais tratados nesta plataforma é a equipe do Setor de Produção, responsável por decidir sobre o tratamento dos dados conforme os propósitos descritos nesta política.
              </p>
            </div>

            <div>
              <strong>2. Dados coletados</strong>
              <p style={{ marginTop: 4 }}>Coletamos os seguintes dados pessoais:</p>
              <ul style={{ marginTop: 6, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                <li><strong>Nome completo</strong> — para identificação do usuário no sistema;</li>
                <li><strong>Endereço de e-mail</strong> — para autenticação e comunicações;</li>
                <li><strong>Data e hora de aceite dos termos</strong> — para registro de consentimento;</li>
                <li><strong>Registros de acesso</strong> — data, hora e ações realizadas na plataforma (logs).</li>
              </ul>
            </div>

            <div>
              <strong>3. Finalidade e base legal</strong>
              <p style={{ marginTop: 4 }}>
                Os dados são coletados com base no <strong>consentimento do titular</strong> (Art. 7º, I da LGPD) e utilizados exclusivamente para:
              </p>
              <ul style={{ marginTop: 6, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                <li>Autenticação e controle de acesso ao sistema;</li>
                <li>Registro de ações para fins de auditoria e segurança;</li>
                <li>Comunicações relacionadas ao funcionamento da plataforma.</li>
              </ul>
              <p style={{ marginTop: 6 }}>Os dados <strong>não são compartilhados com terceiros</strong> nem utilizados para fins comerciais ou publicitários.</p>
            </div>

            <div>
              <strong>4. Armazenamento e segurança</strong>
              <p style={{ marginTop: 4 }}>
                Os dados são armazenados de forma segura em banco de dados hospedado na plataforma Supabase, com criptografia em trânsito (HTTPS/TLS) e controle de acesso por Row Level Security (RLS). O acesso é restrito ao próprio Usuário e aos administradores do sistema.
              </p>
            </div>

            <div>
              <strong>5. Retenção de dados</strong>
              <p style={{ marginTop: 4 }}>
                Os dados serão mantidos enquanto o Usuário possuir conta ativa no sistema. Após o encerramento do acesso, os dados poderão ser removidos mediante solicitação ou após o encerramento do projeto.
              </p>
            </div>

            <div>
              <strong>6. Direitos do titular (Art. 18 da LGPD)</strong>
              <p style={{ marginTop: 4 }}>O Usuário tem direito a, a qualquer momento:</p>
              <ul style={{ marginTop: 6, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
                <li>Confirmar a existência de tratamento de seus dados;</li>
                <li>Acessar os dados que possui no sistema;</li>
                <li>Solicitar a correção de dados incompletos ou incorretos;</li>
                <li>Solicitar a exclusão dos seus dados pessoais;</li>
                <li>Revogar o consentimento a qualquer momento, o que implicará na suspensão do acesso ao sistema.</li>
              </ul>
              <p style={{ marginTop: 6 }}>Para exercer estes direitos, entre em contato com o administrador do sistema.</p>
            </div>

            <div>
              <strong>7. Cookies e armazenamento local</strong>
              <p style={{ marginTop: 4 }}>
                O sistema utiliza armazenamento local do navegador (localStorage) para manutenção da sessão do Usuário. Esses dados são removidos automaticamente ao realizar logout. Não utilizamos cookies de rastreamento ou publicidade.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmação */}
        <div className="card">
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", fontSize: 14, color: "var(--text-body-2)", lineHeight: 1.6 }}>
            <input
              type="checkbox"
              checked={aceitou}
              onChange={(e) => setAceitou(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, cursor: "pointer", accentColor: "var(--brand)" }}
            />
            <span>
              Declaro que li e compreendi integralmente os <strong>Termos de Uso</strong> e a <strong>Política de Privacidade</strong> do Sistema Produção Start, e manifesto meu <strong>consentimento livre, informado e inequívoco</strong> para o tratamento dos meus dados pessoais conforme descrito, nos termos do Art. 5º, inciso XII da LGPD.
            </span>
          </label>

          {erro && (
            <div className="badge badge-orange" style={{ marginTop: 12 }}>{erro}</div>
          )}

          <button
            className="btn btn-primary"
            onClick={confirmar}
            disabled={!aceitou || salvando}
            style={{ marginTop: 16, width: "100%", justifyContent: "center", padding: "12px 0", fontSize: 15 }}
          >
            <CheckCircle2 size={18} />
            {salvando ? "Salvando…" : "Confirmar e acessar o sistema"}
          </button>
        </div>

      </div>
    </div>
  );
}