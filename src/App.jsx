import { useEffect, useMemo, useState, useCallback } from 'react'
import { vocabulary, decks } from './data/vocabulary.js'

const KNOWN_IDS_STORAGE_KEY = 'vocab-flashcards-known-ids'

function shuffleWordIds(wordIds) {
  const shuffled = [...wordIds]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function loadKnownIdsFromStorage() {
  try {
    const raw = localStorage.getItem(KNOWN_IDS_STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export default function App() {
  const [activeDeckId, setActiveDeckId] = useState('all')
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false)
  const [knownWordIds, setKnownWordIds] = useState(loadKnownIdsFromStorage)
  const [studyQueue, setStudyQueue] = useState(() => shuffleWordIds(vocabulary.map((entry) => entry.id)))
  const [queuePosition, setQueuePosition] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)

  const wordsById = useMemo(() => new Map(vocabulary.map((entry) => [entry.id, entry])), [])

  const filteredWordIds = useMemo(() => {
    return vocabulary
      .filter((entry) => activeDeckId === 'all' || entry.deck === activeDeckId)
      .filter((entry) => !onlyUnreviewed || !knownWordIds.has(entry.id))
      .map((entry) => entry.id)
  }, [activeDeckId, onlyUnreviewed, knownWordIds])

  // Rebuild the queue whenever the visible word set changes, keeping it shuffled.
  useEffect(() => {
    setStudyQueue(shuffleWordIds(filteredWordIds))
    setQueuePosition(0)
    setIsCardFlipped(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeckId, onlyUnreviewed])

  useEffect(() => {
    localStorage.setItem(KNOWN_IDS_STORAGE_KEY, JSON.stringify([...knownWordIds]))
  }, [knownWordIds])

  const currentWord = studyQueue.length > 0 ? wordsById.get(studyQueue[queuePosition]) : null

  const goToNextCard = useCallback(() => {
    setIsCardFlipped(false)
    setQueuePosition((position) => (position + 1) % studyQueue.length)
  }, [studyQueue.length])

  const goToPreviousCard = useCallback(() => {
    setIsCardFlipped(false)
    setQueuePosition((position) => (position - 1 + studyQueue.length) % studyQueue.length)
  }, [studyQueue.length])

  const reshuffleQueue = useCallback(() => {
    setStudyQueue(shuffleWordIds(filteredWordIds))
    setQueuePosition(0)
    setIsCardFlipped(false)
  }, [filteredWordIds])

  const markCurrentWord = useCallback(
    (isKnown) => {
      if (!currentWord) return
      setKnownWordIds((previousIds) => {
        const updatedIds = new Set(previousIds)
        if (isKnown) updatedIds.add(currentWord.id)
        else updatedIds.delete(currentWord.id)
        return updatedIds
      })
      goToNextCard()
    },
    [currentWord, goToNextCard],
  )

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault()
        setIsCardFlipped((flipped) => !flipped)
      } else if (event.code === 'ArrowRight') goToNextCard()
      else if (event.code === 'ArrowLeft') goToPreviousCard()
      else if (event.key === 'k' || event.key === 'K') markCurrentWord(true)
      else if (event.key === 'u' || event.key === 'U') markCurrentWord(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextCard, goToPreviousCard, markCurrentWord])

  const knownCountInView = filteredWordIds.filter((id) => knownWordIds.has(id)).length

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Thẻ Từ Vựng IELTS</h1>
        <p className="app-subtitle">Lật thẻ · nhớ nghĩa · ghi câu ví dụ vào đầu</p>
      </header>

      <nav className="deck-tabs" aria-label="Chọn bộ từ">
        <button
          className={`deck-tab ${activeDeckId === 'all' ? 'deck-tab--active' : ''}`}
          onClick={() => setActiveDeckId('all')}
        >
          Tất cả
        </button>
        {decks.map((deck) => (
          <button
            key={deck.id}
            className={`deck-tab ${activeDeckId === deck.id ? 'deck-tab--active' : ''}`}
            onClick={() => setActiveDeckId(deck.id)}
          >
            {deck.label}
          </button>
        ))}
      </nav>

      <div className="toolbar">
        <label className="toggle-unreviewed">
          <input
            type="checkbox"
            checked={onlyUnreviewed}
            onChange={(event) => setOnlyUnreviewed(event.target.checked)}
          />
          Chỉ ôn từ chưa thuộc
        </label>
        <span className="progress-tally">
          Đã thuộc: <strong>{knownCountInView}</strong> / {filteredWordIds.length}
        </span>
      </div>

      {currentWord ? (
        <>
          <div className="card-stage">
            <button
              className={`flashcard ${isCardFlipped ? 'flashcard--flipped' : ''}`}
              onClick={() => setIsCardFlipped((flipped) => !flipped)}
              aria-label="Nhấn để lật thẻ"
            >
              <div className="flashcard-face flashcard-face--front">
                <span className="card-index">
                  Thẻ {queuePosition + 1}/{studyQueue.length}
                </span>
                <span className="headword">{currentWord.word}</span>
                <span className="flip-hint">nhấn hoặc phím cách để xem nghĩa</span>
              </div>
              <div className="flashcard-face flashcard-face--back">
                <span className="pos-tag">{currentWord.pos}</span>
                <span className="meaning">{currentWord.meaning}</span>
                <p className="example">
                  <span className="example-label">Ví dụ</span>
                  {currentWord.example}
                </p>
              </div>
            </button>
          </div>

          <div className="controls">
            <button className="nav-button" onClick={goToPreviousCard} aria-label="Thẻ trước">
              ← Trước
            </button>
            <button className="mark-button mark-button--unknown" onClick={() => markCurrentWord(false)}>
              Chưa thuộc
            </button>
            <button className="mark-button mark-button--known" onClick={() => markCurrentWord(true)}>
              Đã thuộc
            </button>
            <button className="nav-button" onClick={goToNextCard} aria-label="Thẻ sau">
              Sau →
            </button>
          </div>

          <button className="shuffle-button" onClick={reshuffleQueue}>
            🔀 Xáo lại bộ thẻ
          </button>
        </>
      ) : (
        <p className="empty-state">
          Không còn từ nào trong bộ lọc này — bỏ chọn "Chỉ ôn từ chưa thuộc" để xem lại toàn bộ.
        </p>
      )}

      <footer className="app-footer">
        <p>119 từ vựng IELTS · phím tắt: cách = lật thẻ, ← → = chuyển thẻ, K = đã thuộc, U = chưa thuộc</p>
      </footer>
    </div>
  )
}
