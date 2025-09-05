import { computed, Injectable, signal } from '@angular/core';


export type FormDraft = {
nome: string;
cognome: string;
dataNascita: Date | null;
email: string;
}

export type Card = {
  code:string;
  issuedAt: Date;
  holder: FormDraft;
}


@Injectable({
  providedIn: 'root'
})
export class CardService {

  private _draft = signal<FormDraft>({
    nome: '',
    cognome: '',
    dataNascita: null,
    email: '',
  });

  private _card = signal<Card | null>(null);

  draft = computed(() => this._draft());
  card = computed(() => this._card());

  fullName = computed(() => {
    const d = this._draft();
    return [d.nome.trim(), d.cognome.trim()].filter(Boolean).join(' ');
  });

  age = computed(() => {
    const d = this._draft();
    return d.dataNascita ? calcAge(d.dataNascita) : null ;
  });

  updateDraft(patch: Partial<FormDraft>) {

    this._draft.update(d => ({ ...d, ...patch}));
  }

  resetDraft(){
    this._draft.set({ nome: '', cognome: '', dataNascita:null, email:''})
  }

    commit(): boolean {
      const d = this._draft();
      if (!d.nome?.trim() || !d.cognome?.trim() || !d.dataNascita || !isEmail(d.email) ) {
        return false;
      }

      if (d.dataNascita > new Date()) return false;

      const code = genCodeDeterministico(d);

      this._card.set({
        code,
        issuedAt: new Date(),
        holder: {...d},
      });
      return true;
    }

  cleanCard(){
    this._card.set(null);
  }

  hasCard(): boolean{
    return this._card() !== null;
  }

}
function calcAge(dob: Date, ref = new Date()): number {
 let age = ref.getFullYear() - dob.getFullYear();
 const m = ref.getMonth() - dob.getMonth();
 if(m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age--;
 return age;

}

function isEmail(s: string):boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function genCodeDeterministico(d: FormDraft): string {
  
  const raw = `${d.nome}|${d.cognome}|${d.dataNascita?.toISOString()||''}|${d.email}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  return (h.toString().padStart(12, '0')).slice(-12);
}

