
const Modal = {
  modal:document.querySelector('.modal-overlay'),
  open() {
    this.modal.classList.add('active')
  },
  close() {
    this.modal.classList.remove('active')
  }
}

const Storage = {
  //pegar as informações
  get(){
    console.log(localStorage)
  },

  //guardar as informações
  set(trasactions){
    //
    localStorage.setItem("nome que salva", /**Valor como vou armazenar um array tenho que usar um conversor pois este valor so aceita strings*/JSON.stringify(trasactions))
    //passo como argumento meu suposto banco de dados....
  },
}
Storage.get()

const Transaction = {
  //estrategiapara futuramente armazenar no local storage
  all: [
    
  ],

  add(transaction) {
    this.all.push(transaction)

    App.reload()
  },

  remove(index) {
    this.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    //crio incomes com saldo 0
    let incomes = 0
    //então faço uma iteração com um condicional 
    this.all.forEach(t => Number(t.amount) > 0 ? incomes += Number(t.amount) : 0)
    //retorno o valor formatado com minha função
    return Utils.formatCurrency(incomes)
  },

  expenses() {
    //i mesmo que incomes
    let expenses = 0
    this.all.forEach(t => Number(t.amount) < 0 ? expenses += Number(t.amount) : 0)
    return Utils.formatCurrency(expenses)
  }, 

  total() {
    //uso reduce para calcular tudo!
    //funciona assim o argumento a significa acumulador que inicia com o valo do terceiro argumento que é 0
    //o argumento t seria o total que vai se acrescentando ao acumulado
    let total = this.all.reduce((a, t) => a + Number(t.amount), 0)
    //então formato com minha função
    return Utils.formatCurrency(total)
  }
}

//OBJETO QUE VAI CRIAR O DINAMISMO NA PAGINA
const DOM = {
  //PEGUEI O OBJETO PAI ONDE SERA ACRESCIDO MEU CODIGO
  transactionContainer: document.querySelector("#data-table tbody"),
  
  //METODO PARA ADICIONAR A TRANSAÇÃO RECEBE COMO PARAMETRO A TRANSAÇÃO
  addTransaction(transaction, index) {
    //CRIO O ELEMENTO TR QUE SERA O PAI DO MEU ELEMENTO DINAMICO
    const tr = document.createElement("tr")
    //ADICIONO A ELE MINHA VIEW // PARTE ONDE SERA ALTERADO
    //RECEBE COMO PARAMETRO A TRASACTION
    //ENTÃO RETORNANDO O VALOR DESTE METODO POSSO ADICIONAR AO MEU HTML 
    tr.innerHTML = this.innerTransaction(transaction)
    //indice para excluir os dados
    tr.dataset.index = index
    
    //ADICIONE!
    this.transactionContainer.appendChild(tr)
  },

  innerTransaction(transaction, index) {

    //AQUI DENTRO EU MODIFICAREI ALGUMAS COISAS PARA SEREM DINAMICAS
    //PRIMEIRO OS VALORES TENQ SE DIFERENCIAR UMA CLASSE PARA ENTRADAS E OUTRA PARA SAIDAS
    //SE O VALOR É MAIOR QUE ZERO ENTÃO RECEBA A CLASSE "INCOME" SENÃO 'EXPENSE
    const CSSclass = transaction.amount > 0 ? "income" : "expense"
    
    //QUERO FORMATAR ESTE VALOR PARA NUMERO NA MOEDA BRASILEIRA
    //ENTÃO DENTRO DO OBJETO UTILS EU CHAMO UM METODO PARA FORMATAR
    const amount = Utils.formatCurrency(transaction.amount)
    //AQUI TEMOS  O OBJETO QUE SERA MODIFICADO
    //UM PEDAÇO EM HTML QUE RECEBE ESTES VALORES DINAMICAMENTE!
    //ASSIM POSSO TER DIVERSOS "dADOS E GRAÇAS A UM FOReACH AO FIM EU POSSO FAZER UMA ESTRUTURA DESSA PARA CADA AGRUPAMENTO DE DADOS"
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação">
      </td>`
      //RETORNO HTML
    return html
  },

  updateBalance() {
    document
      .getElementById("incomesDisplay")
      .innerHTML = Transaction.incomes()
    document
      .getElementById("expenseDisplay")
      .innerHTML = Transaction.expenses()
    document
      .getElementById("totalDisplay")
      .innerHTML = Transaction.total()
  },

  clearTransactions() {
    this.transactionContainer.innerHTML = ""
  }
}

const Utils = {
  formatCurrency(value) {
    //AQUI ELE RECEBE O VALOR PARA FORMATAR TRANSFORMA EM NUMBER E FAZ UMA VALIDAÇÃO
    //É MENOR QUE 0
    const signal = Number(value) < 0 ? "-" : "" 
      //REGEX, EXPRESSÕES REGULARES 
      //ISSO DA UM ASSUNTO INTEIRO EM JS MAIS BASICAMENTE AQUI ESTOU FORMATANDO PARA QUE VIRE SOMENTE NUMEROS
    value = String(value).replace(/\D/g, "")
    //AQUI EU PEGO ESSE NUMERO E DIVIDO POR 100 QUE FARÁ ELE SER UM VALOR REAL
    value = Number(value) / 100
    //AQUI EU ADICIONO UM FORMATO JA NATIVO DO JS QUE TRANSFORMA MEU NUMERO EM VALOR DO ESTILO MOEDA
    //PRIMEIRO ARGUMENTO É O LOCAL, SEGUNDO ARGUMENTO É UM OBJETO COM STYLO E FORMATO DA MOEDA
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
    //AQUI EU RETORNO O VALOR - OU + COM A FORMATAÇÃO JA EM MOEDA
    return signal + value
  },

  formatAmount(value){
    return value *= 100
  },

  formatDate(value) {
    const splittedDate = value.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  validateFields() {
    description.value === "" || 
    amount.value === "" || 
    date.value === "" ? alert("ERRO : Dados Incompletos, revise os campos") : this.formatData()
  },
  
  

  formatData() {
    let savedData = {
      description: String(this.description.value.toUpperCase()),
      amount: Utils.formatAmount(Number(this.amount.value)),
      date: Utils.formatDate(this.date.value)
    }

    Transaction.add(savedData)
    //limpe os campos
    this.clearFields()
    //close modal
    Modal.close()
  },

  clearFields() {
    this.description.value = ""
    this.amount.value = ""
    this.date.value = ""
  },

  submit(event) {
    event.preventDefault()
    this.validateFields()
    
  }
}



//inicia aqui a aplicação
//metodo init populará o app
//fazendo uma iteração no array transaction

const App = {

  init() {
    Transaction.all.forEach((t, i) => DOM.addTransaction(t, i))
    DOM.updateBalance()
  },
  //funciona como um recarregamento de memoria uma vez que ainda estou usando array e não banco de dados
  reload() {
    //uso este metodo para não duplicar os dados
    DOM.clearTransactions()
    //então atualizado os dados posso recarregar a pagina ja com os ultimos dados 
    App.init()
  }
}

//chamando a inicialização
App.init()

//COpy code 2:55