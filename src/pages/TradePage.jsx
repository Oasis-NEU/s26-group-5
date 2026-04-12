import { useState, useEffect } from 'react'
import './TradePage.css'
import topArrow from '../assets/top_arrow.png'
import bottomArrow from '../assets/bottom_arrow.png'
import removeIcon from '../assets/remove.png'
import { supabase } from '../lib/supabaseClient'

// ── Spine helpers ────────────────────────────────────────────────────────────

const PLACEHOLDER = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTMI5yf9vYw85Q9Qr4kI3HH-qHdza7Gzp5HQ&s'

const SPINE_COLORS = [
    "#1e3a5f", "#3b1f5e", "#1f5e3b", "#5e3b1f", "#5e1f1f",
    "#1f4a5e", "#4a2060", "#1a5632", "#7d3c00", "#1b2631",
    "#283747", "#512e5f", "#145a32", "#6e2f0a", "#4a0e0e",
    "#0b3d40", "#3d2b0b", "#2b0b3d", "#0b3d1a", "#3d0b2b",
]

function hashStr(str = '') {
    let h = 0
    for (let i = 0; i < str.length; i++)
        h = (str.charCodeAt(i) + ((h << 5) - h)) | 0
    return Math.abs(h)
}

function spineColor(title) {
    return SPINE_COLORS[hashStr(title) % SPINE_COLORS.length]
}

function spineDimensions(title) {
    const h = hashStr(title)
    const heights = [118, 124, 130, 136, 142, 128, 122, 126]
    const widths  = [24, 28, 32, 34, 30, 26, 36, 22]
    return {
        height: heights[h % heights.length],
        width:  widths[(h >> 4) % widths.length],
    }
}

const BOOKS_PER_SHELF = 5
const MIN_SHELVES = 3

// ── Left side bookcase ───────────────────────────────────────────────────────

function SideBookcase({ entries, isSelected, onToggle, label, emptyMsg }) {
    const shelves = []
    for (let i = 0; i < entries.length; i += BOOKS_PER_SHELF)
        shelves.push(entries.slice(i, i + BOOKS_PER_SHELF))
    while (shelves.length < MIN_SHELVES) shelves.push([])

    return (
        <div className="side-panel">
            <h3 className="side-panel-label">{label}</h3>
            <div className="side-bookcase">
                <div className="side-crown" />
                {shelves.map((shelfBooks, shelfIdx) => (
                    <div className="side-row" key={shelfIdx}>
                        <div className="side-interior">
                            {shelfIdx === 0 && entries.length === 0 && (
                                <p className="side-empty-msg">{emptyMsg}</p>
                            )}
                            {shelfBooks.map((entry) => {
                                const book = entry.book
                                const { height, width } = spineDimensions(book.title)
                                const color = spineColor(book.title)
                                const selected = isSelected(entry)
                                return (
                                    <div
                                        key={entry.id}
                                        className={`side-book${selected ? ' side-book--selected' : ''}`}
                                        onClick={() => onToggle(entry)}
                                        title={`${book.title}${book.authors?.length ? ' — ' + book.authors.join(', ') : ''}`}
                                    >
                                        <div
                                            className="side-spine"
                                            style={{ background: color, height, width }}
                                        >
                                            <span className="side-spine-title">{book.title}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="side-plank" />
                    </div>
                ))}
                <div className="side-base" />
            </div>
        </div>
    )
}

// ── Existing center offer panel — unchanged ──────────────────────────────────

function BookShelf({ books, onAdd, onRemove, label }) {
    const [hovered, setHovered] = useState(null)
    const [adding, setAdding] = useState(false)
    const [inputVal, setInputVal] = useState('')

    function handleAdd() {
        const url = inputVal.trim() || PLACEHOLDER
        onAdd(url)
        setInputVal('')
        setAdding(false)
    }

    return (
        <div className="shelf-wrapper">
            <h3 className="shelf-label">{label}</h3>
            <div className="shelf">
                {books.map((src, i) => (
                    <div
                        key={i}
                        className="book-slot"
                        style={{ '--i': i, '--total': books.length }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        data-hovered={hovered === i ? 'true' : 'false'}
                        data-dimmed={hovered !== null && hovered !== i ? 'true' : 'false'}
                    >
                        <img src={src} alt={`book-${i}`} className="book-cover" />
                        <button className="remove-btn" onClick={() => onRemove(i)}>
                            <img src={removeIcon} alt="remove" />
                        </button>
                    </div>
                ))}
                {books.length === 0 && (
                    <span className="empty-hint">NO BOOKS ADDED</span>
                )}
            </div>
            {adding ? (
                <div className="add-input-row">
                    <input
                        className="add-input"
                        placeholder="paste image URL..."
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    <button className="add-btn confirm-add" onClick={handleAdd}>add</button>
                    <button className="add-btn cancel-add" onClick={() => setAdding(false)}>cancel</button>
                </div>
            ) : (
                <button className="add-btn" onClick={() => setAdding(true)}>+ add book</button>
            )}
        </div>
    )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TradePage() {
    const [myBooks, setMyBooks]     = useState([])
    const [theirBooks, setTheirBooks] = useState([])
    const [confirmed, setConfirmed] = useState(false)

    const [session, setSession]       = useState(null)
    const [myListings, setMyListings] = useState([])

    // Auth
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
        return () => subscription.unsubscribe()
    }, [])

    // Fetch listings when signed in
    useEffect(() => {
        if (session) fetchMyListings()
        else setMyListings([])
    }, [session])

    async function fetchMyListings() {
        const { data } = await supabase
            .from('listings')
            .select('id, condition, status, book:books(id, title, authors, thumbnail, genre)')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
        if (data) setMyListings(data)
    }

    // Click on a side book → add/remove its thumbnail from myBooks
    function handleToggleMyListing(entry) {
        const url = entry.book.thumbnail || PLACEHOLDER
        if (myBooks.includes(url)) {
            setMyBooks(prev => {
                const idx = prev.indexOf(url)
                return prev.filter((_, i) => i !== idx)
            })
        } else {
            setMyBooks(prev => [...prev, url])
        }
    }

    return (
        <div className="trade-page">
            <div className="trade-main-row">

                {/* ── Left bookcase: our listed books ── */}
                <SideBookcase
                    entries={myListings}
                    isSelected={entry => myBooks.includes(entry.book.thumbnail || PLACEHOLDER)}
                    onToggle={handleToggleMyListing}
                    label="my listings"
                    emptyMsg={session ? 'No listings yet' : 'Sign in to see your books'}
                />

                {/* ── Existing center trade UI — untouched ── */}
                <div className="trade-center">
                    <div className="container">
                        <BookShelf
                            books={myBooks}
                            onAdd={url => setMyBooks(prev => [...prev, url])}
                            onRemove={i => setMyBooks(prev => prev.filter((_, idx) => idx !== i))}
                            label="my books"
                        />

                        <div className="arrows-col">
                            <img src={topArrow} className={`arrow-top${confirmed ? ' arrow-top--fly' : ''}`} alt="top arrow" />
                            <img src={bottomArrow} className={`arrow-bottom${confirmed ? ' arrow-bottom--fly' : ''}`} alt="bottom arrow" />
                        </div>

                        <BookShelf
                            books={theirBooks}
                            onAdd={url => setTheirBooks(prev => [...prev, url])}
                            onRemove={i => setTheirBooks(prev => prev.filter((_, idx) => idx !== i))}
                            label="their books"
                        />
                    </div>

                    <div className="button">
                        <button className="confirm" onClick={() => setConfirmed(true)}>
                            confirm trade
                        </button>
                    </div>
                </div>

                {/* ── Right bookcase: placeholder for trade partner ── */}
                <div className="side-panel side-panel--empty">
                    <h3 className="side-panel-label">their listings</h3>
                    <div className="side-bookcase">
                        <div className="side-crown" />
                        {Array.from({ length: MIN_SHELVES }).map((_, i) => (
                            <div className="side-row" key={i}>
                                <div className="side-interior">
                                    {i === 0 && (
                                        <p className="side-empty-msg">Select a trade partner</p>
                                    )}
                                </div>
                                <div className="side-plank" />
                            </div>
                        ))}
                        <div className="side-base" />
                    </div>
                </div>

            </div>
        </div>
    )
}
