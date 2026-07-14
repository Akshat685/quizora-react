import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db, firebaseReady } from './firebase'

const COLLECTION = 'leaderboard'

/**
 * Persist a score. Firestore security rules should allow create on this collection.
 */
export async function submitScore({ name, quizId, quizTitle, score, percentage }) {
  if (!firebaseReady || !db) {
    throw new Error(
      'Firebase is not configured. Add your keys to a .env file (see README) and restart the dev server.',
    )
  }

  const trimmed = name.trim()
  if (trimmed.length < 2 || trimmed.length > 40) {
    throw new Error('Name must be between 2 and 40 characters.')
  }

  await addDoc(collection(db, COLLECTION), {
    name: trimmed,
    quizId,
    quizTitle,
    score,
    percentage,
    completedAt: serverTimestamp(),
  })
}

/**
 * Top 10 for a quiz: highest score first, then most recent completion.
 * Client-side secondary sort covers cases where a composite index is not yet ready.
 */
export async function getTopScores(quizId, max = 10) {
  if (!firebaseReady || !db) {
    throw new Error(
      'Firebase is not configured. Add your keys to a .env file (see README) and restart the dev server.',
    )
  }

  // Filter by quizId only — no composite index required.
  // Sort Top 10 client-side (score desc, then latest completedAt).
  const q = query(collection(db, COLLECTION), where('quizId', '==', quizId))

  const snapshot = await getDocs(q)
  const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const aTime = a.completedAt?.toMillis?.() ?? 0
    const bTime = b.completedAt?.toMillis?.() ?? 0
    return bTime - aTime
  })

  return rows.slice(0, max)
}
