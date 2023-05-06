import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, Firestore, doc, getDoc, getDocs, QuerySnapshot } from '@angular/fire/firestore';
import { updateDoc } from 'firebase/firestore';
import { from, map, Observable } from 'rxjs';
import { Post } from '../global/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private postCollection = collection(this.firestore, 'posts') as CollectionReference<Post>;

  constructor(private readonly firestore: Firestore) { }

  // Get all posts
  getAllPosts(): Observable<Post[]> {
    return from(getDocs(this.postCollection)).pipe(
      map((docs) => {
        return docs.docs.map((doc) => ({ ...doc.data(), uid: doc.id }) as Post);
      })
    );
  }

  // Get existing post
  getPost(postId: string): Observable<Post> {
    const docRef = doc(this.firestore, "posts", postId);
    return from(getDoc(docRef)).pipe(
      map((doc) => {
        return { ...doc.data(), uid: doc.id } as Post;
      })
    );
  }
}
