import { FieldValue, Firestore } from '@google-cloud/firestore';

export const converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
});

const db = new Firestore({
  projectId: 'mrmackey',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const Collections = {
  CustomCommands: db.collection('custom-commands'),
  Karma: db.collection(`karma`),
};

export function fetchCollectionList() {
  return db.listCollections();
}

export default db;
