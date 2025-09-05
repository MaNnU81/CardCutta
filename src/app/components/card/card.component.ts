// src/app/components/card/card.component.ts
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { CardService } from '../../services/card.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-card',
  imports: [MatCardModule, MatButtonModule, DatePipe, ],
 
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  private router = inject(Router);
  cardServ = inject(CardService);

  // Puntare questo ref su un DIV interno "piatto" che copre tutta la card (vedi HTML)
  @ViewChild('cardRef') cardRef?: ElementRef<HTMLElement>;

  get card() { return this.cardServ.card(); }   // snapshot confermata

  // derivati rapidi dalla snapshot (non dal draft)
  get fullName() {
    const c = this.card!;
    return `${c.holder.nome} ${c.holder.cognome}`.trim();
  }
  get age() {
    const dob = this.card!.holder.dataNascita!;
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age;
  }

  onBackToEdit() {
    this.router.navigate(['/']); // la bozza è ancora lì
  }

  onNew() {
    this.cardServ.cleanCard();
    this.cardServ.resetDraft();
    this.router.navigate(['/']);
  }

  /** Download helper (fallback) */
  private download(dataUrl: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
    a.remove();
  }

  /** Salva come PNG (trasparente se vuoi) */
  async onSavePng() {
    const node = this.cardRef?.nativeElement;
    if (!node) return;
    const hti = await import('html-to-image');
    await (document as any).fonts?.ready; // assicura i font
    const dataUrl = await hti.toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
      backgroundColor: '#ffffff',
    });
    const filename = `CardCutta_${this.card!.holder.cognome}_${this.card!.code}.png`;
    this.download(dataUrl, filename);
  }

  /** Salva come JPG + condivisione nativa su mobile se disponibile */
async onSaveImageJpg() {
  const node = this.cardRef?.nativeElement;
  if (!node) return;

  const hti = await import('html-to-image');

  // 1) attende font E immagini dentro la card
  await (document as any).fonts?.ready;
  await Promise.all(
    Array.from(node.querySelectorAll('img'))
      .filter(img => !img.complete)
      .map(img => new Promise(res => { img.onload = img.onerror = () => res(null); }))
  );

  // 2) fissa le dimensioni per evitare reflow durante il render
  const { width, height } = node.getBoundingClientRect();

  const dataUrl = await hti.toJpeg(node, {
    pixelRatio: 2,
    quality: 0.92,
    backgroundColor: '#ffffff',
    cacheBust: true,
    skipFonts: true,                 // evita i CSS cross-origin
    style: { width: `${width}px`, height: `${height}px` }, // blocca layout
  });

  const filename = `CardCutta_${this.card!.holder.cognome}_${this.card!.code}.jpg`;

  // Web Share su mobile (se disponibile)
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/jpeg' });
    const nav = navigator as any;
    if (nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: 'CardCutta' });
      return;
    }
  } catch {}

  // Fallback download
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
  a.remove();
}
}
