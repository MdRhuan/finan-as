import type { TipoTransacao } from '../types';

const REGRAS: Array<{ palavras: string[]; categoria: string }> = [
  { palavras: ['uber', '99', 'cabify', 'taxi', 'metro', 'onibus', 'combustivel', 'gasolina', 'posto', 'estacionamento', 'pedagio', 'brt', 'metrô', 'ônibus', 'táxi'], categoria: 'Transporte' },
  { palavras: ['ifood', 'rappi', 'uber eats', 'restaurante', 'lanchonete', 'padaria', 'supermercado', 'mercado', 'hortifruti', 'açougue', 'feira', 'alimentacao', 'alimentação', 'refeicao', 'refeição', 'almoco', 'almoço', 'jantar', 'mc donalds', 'burger', 'pizza', 'sushi', 'pao', 'pão', 'cafe', 'café'], categoria: 'Alimentação' },
  { palavras: ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'cinema', 'teatro', 'show', 'game', 'steam', 'playstation', 'xbox', 'lazer', 'entretenimento', 'bar', 'balada', 'clube'], categoria: 'Lazer' },
  { palavras: ['luz', 'energia', 'agua', 'água', 'gas', 'gás', 'internet', 'telefone', 'celular', 'aluguel', 'condominio', 'condomínio', 'iptu', 'conta ', 'fatura', 'tim', 'claro', 'vivo', 'oi', 'net', 'enel', 'sabesp', 'cemig'], categoria: 'Contas' },
  { palavras: ['farmacia', 'farmácia', 'remedio', 'remédio', 'medico', 'médico', 'consulta', 'hospital', 'clinica', 'clínica', 'plano de saude', 'saude', 'saúde', 'exame', 'dentista', 'laboratorio', 'laboratório'], categoria: 'Saúde' },
  { palavras: ['escola', 'faculdade', 'universidade', 'curso', 'livro', 'mensalidade', 'matricula', 'matrícula', 'educacao', 'educação', 'aula', 'treinamento', 'udemy', 'coursera', 'alura'], categoria: 'Educação' },
  { palavras: ['salario', 'salário', 'pagamento', 'vale', 'bonus', 'bônus', 'comissao', 'comissão', 'freelance', 'honorario', 'honorário', 'pró-labore', 'pro-labore'], categoria: 'Salário' },
  { palavras: ['investimento', 'aplicacao', 'aplicação', 'poupanca', 'poupança', 'cdb', 'lci', 'lca', 'tesouro', 'acao', 'ação', 'fundo', 'renda fixa'], categoria: 'Investimentos' },
];

export function detectarCategoria(descricao: string, tipo?: TipoTransacao): string {
  const d = descricao.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  for (const regra of REGRAS) {
    for (const palavra of regra.palavras) {
      const p = palavra.normalize('NFD').replace(/[̀-ͯ]/g, '');
      if (d.includes(p)) return regra.categoria;
    }
  }

  if (tipo === 'receita') return 'Outros (Receita)';
  return 'Outros';
}

export function detectarTipoTransacao(valor: number, descricao?: string): TipoTransacao {
  if (valor < 0) return 'despesa';
  if (valor > 0) {
    const d = (descricao || '').toLowerCase();
    const palavrasReceita = ['salario', 'pagamento recebido', 'transferencia recebida', 'pix recebido', 'deposito', 'rendimento'];
    for (const p of palavrasReceita) {
      if (d.includes(p)) return 'receita';
    }
  }
  return valor >= 0 ? 'receita' : 'despesa';
}
