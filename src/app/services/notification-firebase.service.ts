import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Notification } from '../models/notification.model';
import { map } from 'rxjs/operators';
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc, deleteDoc, query, where, orderBy, onSnapshot, DocumentData, QuerySnapshot, Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class NotificationFireBaseService {
  private db = getFirestore();
  
  constructor() {}

  // Créer une notification
  createNotification(notification: Notification): Promise<any> {
    const notificationsRef = collection(this.db, 'notifications');
    return addDoc(notificationsRef, {
      ...notification,
      créeÀ: new Date(),
      lu: false
    });
  }

  // Récupérer toutes les notifications
  getNotifications(): Observable<Notification[]> {
    const notificationsRef = collection(this.db, 'notifications');
    
    return new Observable<Notification[]>(observer => {
      // Utiliser onSnapshot pour écouter les changements en temps réel
      const unsubscribe = onSnapshot(notificationsRef, 
        (snapshot) => {
          const notifications = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convertir Timestamp en Date si nécessaire
            const créeÀ = data['créeÀ'] instanceof Timestamp ? data['créeÀ'].toDate() : data['créeÀ'];
            return { _id: doc.id, ...data, 'créeÀ': créeÀ } as Notification;
          });
          observer.next(notifications);
        },
        (error) => observer.error(error)
      );
      
      // Nettoyer l'abonnement quand l'Observable est désabonné
      return () => unsubscribe();
    });
  }

  getNotificationsByUser(userId: string): Observable<Notification[]> {
    const notificationsRef = collection(this.db, 'notifications');
    const q = query(
      notificationsRef, 
      where('utilisateurId', '==', userId),
      orderBy('créeÀ', 'desc')
    );
    
    return new Observable<Notification[]>(observer => {
      // Utiliser onSnapshot pour écouter les changements en temps réel
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const notifications = snapshot.docs.map(doc => {
            const data = doc.data();
            // Convertir Timestamp en Date si nécessaire
            const créeÀ = data['créeÀ'] instanceof Timestamp ? data['créeÀ'].toDate() : data['créeÀ'];
            return { _id: doc.id, ...data, 'créeÀ': créeÀ } as Notification;
          });
          observer.next(notifications);
        },
        (error) => observer.error(error)
      );
      
      // Nettoyer l'abonnement quand l'Observable est désabonné
      return () => unsubscribe();
    });
  }
  
  // Mettre à jour une notification (ex. marquer comme lue)
  updateNotification(notificationId: string, data: Partial<Notification>): Promise<any> {
    const notificationDocRef = doc(this.db, 'notifications', notificationId);
    return setDoc(notificationDocRef, data, { merge: true });
  }

  // Supprimer une notification
  deleteNotification(notificationId: string): Promise<any> {
    const notificationDocRef = doc(this.db, 'notifications', notificationId);
    return deleteDoc(notificationDocRef);
  }
}
