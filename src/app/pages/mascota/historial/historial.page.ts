import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { collection, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { ModalRmedicoComponent } from 'src/app/components/modal-rmedico/modal-rmedico.component';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HistorialPage implements OnInit {
  registros$!: Observable<any[]>;
  mascotaSeleccionada: any;

  constructor(
    private firestore: Firestore,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const mascota = localStorage.getItem('mascotaSeleccionada');
    if (mascota) {
      this.mascotaSeleccionada = JSON.parse(mascota);
      this.cargarRegistros();
    }
  }

  cargarRegistros() {
    const ref = collection(this.firestore, 'registrosMedicos');
    const q = query(
      ref,
      where('mid', '==', this.mascotaSeleccionada?.mid),
      orderBy('fechaVisita', 'desc')
    );
    this.registros$ = collectionData(q, { idField: 'rid' });
  }

  async abrirModalRegistro() {
    const modal = await this.modalController.create({
      component: ModalRmedicoComponent
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        this.cargarRegistros();
      }
    });

    await modal.present();
  }

  async editarRegistro(registro: any) {
    const modal = await this.modalController.create({
      component: ModalRmedicoComponent,
      componentProps: { registro }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        this.cargarRegistros();
      }
    });

    await modal.present();
  }

  async eliminarRegistro(id: string) {
    const alert = await this.alertController.create({
      header: 'Eliminar',
      message: '¿Estás seguro de que deseas eliminar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await deleteDoc(doc(this.firestore, 'registrosMedicos', id));
            this.cargarRegistros();
          }
        }
      ]
    });

    await alert.present();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString();
  }
}