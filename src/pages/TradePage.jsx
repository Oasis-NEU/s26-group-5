import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import './TradePage.css'
import topArrow from '../assets/top_arrow.png'
import bottomArrow from '../assets/bottom_arrow.png'
import removeIcon from '../assets/remove.png'
import { supabase } from '../lib/supabaseClient'

// ── Spine helpers ─────────────────────────────────────────────────────────────

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

const POPUP_W = 200
const POPUP_H = 340
const POPUP_GAP = 12

function computePopupStyle(rect) {
    if (!rect) return {}
    let left = rect.left + rect.width / 2 - POPUP_W / 2
    left = Math.max(8, Math.min(left, window.innerWidth - POPUP_W - 8))
    let top = rect.top - POPUP_H - POPUP_GAP
    if (top < 8) top = rect.bottom + POPUP_GAP
    return { top, left }
}

// ── Side bookcase ─────────────────────────────────────────────────────────────

function SideBookcase({ entries, label, emptyMsg, onBookEnter, onBookLeave, onBookClick, isSelected }) {
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
                                        onMouseEnter={(e) => onBookEnter(entry, e)}
                                        onMouseLeave={onBookLeave}
                                        onClick={() => onBookClick(entry)}
                                        title={book.title}
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

// ── Center offer shelf ────────────────────────────────────────────────────────

function BookShelf({ offer, onRemove, onRemoveAll, label }) {
    const [hovered, setHovered] = useState(null)

    return (
        <div className="shelf-wrapper">
            <div className="shelf-header">
                <h3 className="shelf-label">{label}</h3>
                {offer.length > 0 && (
                    <button className="shelf-remove-all" onClick={onRemoveAll}>remove all</button>
                )}
            </div>
            <div className="shelf">
                {offer.map((entry, i) => (
                    <div
                        key={entry.id}
                        className="book-slot"
                        style={{ '--i': i, '--total': offer.length }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        data-hovered={hovered === i ? 'true' : 'false'}
                        data-dimmed={hovered !== null && hovered !== i ? 'true' : 'false'}
                    >
                        {entry.book.thumbnail ? (
                            <img
                                src={entry.book.thumbnail.replace('http://', 'https://')}
                                alt={entry.book.title}
                                className="book-cover"
                            />
                        ) : (
                            <div
                                className="book-cover trade-cover-placeholder"
                                style={{ background: spineColor(entry.book.title) }}
                            >
                                <span className="trade-cover-title">{entry.book.title}</span>
                            </div>
                        )}
                        <button className="remove-btn" onClick={() => onRemove(entry)}>
                            <img src={removeIcon} alt="remove" />
                        </button>
                    </div>
                ))}
                {offer.length === 0 && (
                    <span className="empty-hint">NO BOOKS SELECTED</span>
                )}
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TradePage() {
    const location = useLocation()
    const {
        theirUserId,
        theirName: initTheirName,
        prefilledGoogleId,
        prefillAll,
    } = location.state || {}

    const [session, setSession]             = useState(null)
    const [myListings, setMyListings]       = useState([])
    const [theirListings, setTheirListings] = useState([])
    const [theirName]                       = useState(initTheirName || '')
    const [myOffer, setMyOffer]             = useState([])
    const [theirOffer, setTheirOffer]       = useState([])
    const [confirmed, setConfirmed]         = useState(false)

    // Popup
    const [hoveredEntry, setHoveredEntry] = useState(null)
    const [popupRect, setPopupRect]       = useState(null)
    const [popupSide, setPopupSide]       = useState(null)
    const leaveTimer = useRef(null)
    const hoveredEl  = useRef(null)

    // Auth
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
        return () => subscription.unsubscribe()
    }, [])

    // My listings
    useEffect(() => {
        if (session) fetchMyListings()
        else setMyListings([])
    }, [session])

    async function fetchMyListings() {
        const { data } = await supabase
            .from('trade_listings')
            .select('id, condition, book:books(id, title, authors, thumbnail, genre)')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
        if (data) setMyListings(data)
    }

    // Their listings
    useEffect(() => {
        if (theirUserId) fetchTheirListings()
    }, [theirUserId])

    async function fetchTheirListings() {
        const { data } = await supabase
            .from('trade_listings')
            .select('id, condition, book:books(id, google_books_id, title, authors, thumbnail, genre)')
            .eq('user_id', theirUserId)
            .order('created_at', { ascending: false })
        if (!data) return
        setTheirListings(data)
        if (prefillAll) {
            setTheirOffer(data)
        } else if (prefilledGoogleId) {
            const match = data.find(l => l.book?.google_books_id === prefilledGoogleId)
            if (match) setTheirOffer([match])
        }
    }

    // Keep popup anchored while scrolling
    useEffect(() => {
        if (!hoveredEntry) return
        function onScroll() {
            if (hoveredEl.current)
                setPopupRect(hoveredEl.current.getBoundingClientRect())
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [hoveredEntry])

    function toggleOffer(entry, side) {
        const setter = side === 'mine' ? setMyOffer : setTheirOffer
        setter(prev =>
            prev.find(e => e.id === entry.id)
                ? prev.filter(e => e.id !== entry.id)
                : [...prev, entry]
        )
    }

    function onBookEnter(entry, side, e) {
        clearTimeout(leaveTimer.current)
        hoveredEl.current = e.currentTarget
        setHoveredEntry(entry)
        setPopupSide(side)
        setPopupRect(e.currentTarget.getBoundingClientRect())
    }

    function onBookLeave() {
        leaveTimer.current = setTimeout(() => setHoveredEntry(null), 120)
    }

    function onPopupEnter() { clearTimeout(leaveTimer.current) }
    function onPopupLeave() {
        leaveTimer.current = setTimeout(() => setHoveredEntry(null), 120)
    }

    const popupStyle = computePopupStyle(popupRect)

    return (
        <div className="trade-page">
            <div className="trade-main-row">

                <SideBookcase
                    entries={myListings}
                    isSelected={entry => myOffer.some(e => e.id === entry.id)}
                    onBookEnter={(entry, e) => onBookEnter(entry, 'mine', e)}
                    onBookLeave={onBookLeave}
                    onBookClick={entry => toggleOffer(entry, 'mine')}
                    label="my listings"
                    emptyMsg={session ? 'No listings yet' : 'Sign in to see your books'}
                />

                <div className="trade-center">
                    <div className="container">
                        <BookShelf
                            offer={myOffer}
                            onRemove={entry => setMyOffer(prev => prev.filter(e => e.id !== entry.id))}
                            onRemoveAll={() => setMyOffer([])}
                            label="my books"
                        />

                        <div className="arrows-col">
                            <img src={topArrow} className={`arrow-top${confirmed ? ' arrow-top--fly' : ''}`} alt="top arrow" />
                            <img src={bottomArrow} className={`arrow-bottom${confirmed ? ' arrow-bottom--fly' : ''}`} alt="bottom arrow" />
                        </div>

                        <BookShelf
                            offer={theirOffer}
                            onRemove={entry => setTheirOffer(prev => prev.filter(e => e.id !== entry.id))}
                            onRemoveAll={() => setTheirOffer([])}
                            label={theirName ? `${theirName}'s books` : 'their books'}
                        />
                    </div>

                    <div className="button">
                        <button className="confirm" onClick={() => setConfirmed(true)}>
                            propose trade
                        </button>
                    </div>
                </div>

                <SideBookcase
                    entries={theirListings}
                    isSelected={entry => theirOffer.some(e => e.id === entry.id)}
                    onBookEnter={(entry, e) => onBookEnter(entry, 'theirs', e)}
                    onBookLeave={onBookLeave}
                    onBookClick={entry => toggleOffer(entry, 'theirs')}
                    label={theirName ? `${theirName}'s listings` : 'their listings'}
                    emptyMsg={theirUserId ? 'No listings found' : 'Select a trade partner'}
                />

            </div>

            {hoveredEntry && (
                <div
                    className="trade-popup"
                    style={popupStyle}
                    onMouseEnter={onPopupEnter}
                    onMouseLeave={onPopupLeave}
                >
                    {hoveredEntry.book.thumbnail ? (
                        <img
                            src={hoveredEntry.book.thumbnail.replace('http://', 'https://')}
                            alt="cover"
                            className="trade-popup-cover"
                        />
                    ) : (
                        <div className="trade-popup-no-cover">No Cover</div>
                    )}
                    <div className="trade-popup-title">{hoveredEntry.book.title}</div>
                    <div className="trade-popup-author">{hoveredEntry.book.authors?.join(', ')}</div>
                    {(() => {
                        const offer = popupSide === 'mine' ? myOffer : theirOffer
                        const isIn = offer.some(e => e.id === hoveredEntry.id)
                        return (
                            <button
                                className={`trade-popup-btn${isIn ? ' trade-popup-btn--remove' : ''}`}
                                onClick={() => toggleOffer(hoveredEntry, popupSide)}
                            >
                                {isIn ? 'Remove from offer' : 'Add to offer'}
                            </button>
                        )
                    })()}
                </div>
            )}
        </div>
    )
}
