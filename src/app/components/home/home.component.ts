import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CardService } from '../../services/card.service';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';


function toDateInputString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private fb = inject(FormBuilder);
   private router = inject(Router);

  constructor(public cardServ: CardService) {}

  readonly INITIAL_DRAFT = { nome: '', cognome: '', dataNascita: null, email: '' };

  
form = this.fb.group({
  nome: this.fb.nonNullable.control('', { validators: [Validators.required] }),
  cognome: this.fb.nonNullable.control('', { validators: [Validators.required] }),
  email: this.fb.nonNullable.control('', { validators: [Validators.required, Validators.email] }),
  dataNascita: this.fb.control<string | null>(null, { validators: [Validators.required] }),
});

  ngOnInit(): void {
    
    const d = this.cardServ.draft(); 
    this.form.patchValue({
  nome: d.nome ?? '',
  cognome: d.cognome ?? '',
  email: d.email ?? '',
  dataNascita: d.dataNascita ? toDateInputString(d.dataNascita) : null,
}, { emitEvent: false });

  
    this.form.valueChanges.subscribe(v => {
      const dob = v.dataNascita ? new Date(v.dataNascita) : null;
      this.cardServ.updateDraft({
        nome: v.nome ?? '',
        cognome: v.cognome ?? '',
        email: v.email ?? '',
        dataNascita: dob,
      });
    });
  }

  onSubmit(): void {
    
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
console.log('valid?', this.form.valid, this.form.value);
    const ok = this.cardServ.commit();
    console.log('commit ok?', ok);
    if (ok) {
      this.router.navigate(['/card']);
    } else {
      
    }
  }


  onReset(): void {
    this.form.reset({ nome: '', cognome: '', email: '', dataNascita: null }, { emitEvent: false });
    this.cardServ.resetDraft();
    this.cardServ.cleanCard();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
