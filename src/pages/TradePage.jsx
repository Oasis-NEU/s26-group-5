import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './TradePage.css'
import './TradeDatePicker.css'
import topArrow from '../assets/top_arrow.png'
import bottomArrow from '../assets/bottom_arrow.png'
import removeIcon from '../assets/remove.png'
import { supabase } from '../lib/supabaseClient'
import { spineColor, spineDimensions } from '../utils/bookSpine'
import { secureImageUrl } from '../utils/image'
import { useAuthSession } from '../hooks/useAuthSession'

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

// ── Flying book clone ─────────────────────────────────────────────────────────

function FlyingBook({ src, title, startX, startY, endX, endY, delay, onLanded }) {
    const outerRef = useRef(null)
    const innerRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        const outer = outerRef.current
        const inner = innerRef.current
        if (!outer || !inner) return

        const dx = endX - startX
        const dy = endY - startY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const arcPeak = -Math.max(90, dist * 0.28)

        // Outer: smooth horizontal travel
        const xAnim = outer.animate(
            [{ transform: 'translateX(0px)' }, { transform: `translateX(${dx}px)` }],
            { duration: 760, delay: delay * 1000, easing: 'ease-in-out', fill: 'forwards' }
        )

        // Inner: arc up then land, fading out at the end
        inner.animate(
            [
                { transform: 'translateY(0px) scale(1)',   opacity: 1 },
                { transform: `translateY(${arcPeak}px) scale(1.05)`, opacity: 1, offset: 0.38 },
                { transform: `translateY(${dy}px) scale(0.7)`, opacity: 0 },
            ],
            { duration: 760, delay: delay * 1000, easing: 'ease-in', fill: 'forwards' }
        )

        xAnim.onfinish = () => { if (!cancelled) onLanded() }

        return () => {
            cancelled = true
            xAnim.cancel()
        }
    }, [])

    return (
        <div
            ref={outerRef}
            style={{
                position: 'fixed',
                left: startX,
                top: startY,
                width: 54,
                height: 76,
                zIndex: 1000,
                pointerEvents: 'none',
            }}
        >
            <div ref={innerRef} style={{ width: 54, height: 76 }}>
                {src ? (
                    <img
                        src={secureImageUrl(src)}
                        alt={title}
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', borderRadius: 4,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                            display: 'block',
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        background: spineColor(title || 'x'),
                        borderRadius: 4,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                    }} />
                )}
            </div>
        </div>
    )
}

// ── Side bookcase ─────────────────────────────────────────────────────────────

function SideBookcase({
    entries, label, emptyMsg,
    onBookEnter, onBookLeave, onBookClick, isSelected,
    bookcaseRef, receivedEntries = [],
}) {
    const allEntries = entries
    const shelves = []
    for (let i = 0; i < allEntries.length; i += BOOKS_PER_SHELF)
        shelves.push(allEntries.slice(i, i + BOOKS_PER_SHELF))
    while (shelves.length < MIN_SHELVES) shelves.push([])

    // Place received entries on the last shelf
    const lastShelf = shelves[shelves.length - 1]
    const receivedForLastShelf = receivedEntries.slice(0, BOOKS_PER_SHELF - lastShelf.length)

    return (
        <div className="side-panel">
            <h3 className="side-panel-label">{label}</h3>
            <div className="side-bookcase" ref={bookcaseRef}>
                <div className="side-crown" />
                {shelves.map((shelfBooks, shelfIdx) => {
                    const isLast = shelfIdx === shelves.length - 1
                    return (
                        <div className="side-row" key={shelfIdx}>
                            <div className="side-interior">
                                {shelfIdx === 0 && allEntries.length === 0 && receivedEntries.length === 0 && (
                                    <p className="side-empty-msg">{emptyMsg}</p>
                                )}
                                {shelfBooks.map((entry) => {
                                    const book = entry.book
                                    const { height, width } = spineDimensions(book.title, 'small')
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
                                            <div className="side-spine" style={{ background: color, height, width }}>
                                                <span className="side-spine-title">{book.title}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {isLast && receivedForLastShelf.map((entry) => {
                                    const book = entry.book
                                    const { height, width } = spineDimensions(book.title, 'small')
                                    const color = spineColor(book.title)
                                    return (
                                        <div key={`recv-${entry.id}`} className="side-book side-book--received">
                                            <div className="side-spine" style={{ background: color, height, width }}>
                                                <span className="side-spine-title">{book.title}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="side-plank" />
                        </div>
                    )
                })}
                <div className="side-base" />
            </div>
        </div>
    )
}

// ── Center offer shelf ────────────────────────────────────────────────────────

function BookShelf({ offer, onRemove, onRemoveAll, label, flying, shelfRef }) {
    const [hovered, setHovered] = useState(null)

    return (
        <div className="shelf-wrapper">
            <div className="shelf-header">
                <h3 className="shelf-label">{label}</h3>
                {offer.length > 0 && !flying && (
                    <button className="shelf-remove-all" onClick={onRemoveAll}>remove all</button>
                )}
            </div>
            <div className="shelf" ref={shelfRef} style={flying ? { visibility: 'hidden' } : {}}>
                {offer.map((entry, i) => (
                    <div
                        key={entry.id}
                        className="book-slot"
                        style={{ '--i': i, '--total': offer.length }}
                        onMouseEnter={() => !flying && setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        data-hovered={!flying && hovered === i ? 'true' : 'false'}
                        data-dimmed={!flying && hovered !== null && hovered !== i ? 'true' : 'false'}
                    >
                        {entry.book.thumbnail ? (
                            <img
                                src={secureImageUrl(entry.book.thumbnail)}
                                alt={entry.book.title}
                                className="book-cover"
                            />
                        ) : (
                            <div className="book-cover trade-cover-placeholder" style={{ background: spineColor(entry.book.title) }}>
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

    const { session } = useAuthSession()
    const [myListings, setMyListings]       = useState([])
    const [theirListings, setTheirListings] = useState([])
    const [theirName]                       = useState(initTheirName || '')
    const [myOffer, setMyOffer]             = useState([])
    const [theirOffer, setTheirOffer]       = useState([])
    const [confirmed, setConfirmed]         = useState(false)
    const [flying, setFlying]               = useState(false)
    const [flyingBooks, setFlyingBooks]     = useState([])
    const [receivedByMe, setReceivedByMe]   = useState([])
    const [receivedByThem, setReceivedByThem] = useState([])
    const [meetupLocation, setMeetupLocation] = useState('')
    const [meetupDateTime, setMeetupDateTime] = useState(null)

    // Refs for position tracking
    const myShelfRef    = useRef(null)
    const theirShelfRef = useRef(null)
    const myBookcaseRef    = useRef(null)
    const theirBookcaseRef = useRef(null)
    const landedRef = useRef(0)

    // Popup
    const [hoveredEntry, setHoveredEntry] = useState(null)
    const [popupRect, setPopupRect]       = useState(null)
    const [popupSide, setPopupSide]       = useState(null)
    const leaveTimer = useRef(null)
    const hoveredEl  = useRef(null)

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
            .eq('status', 'active')
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
            .eq('status', 'active')
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

    // ── Propose trade: capture positions and launch flying books ──────────────

    function handlePropose() {
        if (flying) return

        const capturedMyOffer    = [...myOffer]
        const capturedTheirOffer = [...theirOffer]
        const total = capturedMyOffer.length + capturedTheirOffer.length
        if (total === 0) return
        if (!meetupLocation.trim() || !meetupDateTime) return

        // Get slot rects before hiding
        const mySlots    = myShelfRef.current    ? Array.from(myShelfRef.current.querySelectorAll('.book-slot'))    : []
        const theirSlots = theirShelfRef.current ? Array.from(theirShelfRef.current.querySelectorAll('.book-slot')) : []

        // Get destination: center of last shelf interior in each bookcase
        function lastShelfCenter(bookcaseEl) {
            if (!bookcaseEl) return { x: 0, y: 0 }
            const interiors = Array.from(bookcaseEl.querySelectorAll('.side-interior'))
            const last = interiors[interiors.length - 1]
            if (!last) return { x: 0, y: 0 }
            const r = last.getBoundingClientRect()
            return { x: r.left + r.width / 2 - 27, y: r.top + r.height * 0.55 - 38 }
        }

        const myDest    = lastShelfCenter(myBookcaseRef.current)
        const theirDest = lastShelfCenter(theirBookcaseRef.current)

        landedRef.current = 0

        function onOneLanded() {
            landedRef.current++
            if (landedRef.current >= total) {
                setReceivedByMe(prev    => [...prev, ...capturedTheirOffer])
                setReceivedByThem(prev  => [...prev, ...capturedMyOffer])
                setFlyingBooks([])
                setFlying(false)
                setMyOffer([])
                setTheirOffer([])

                const tradedIds = [
                    ...capturedMyOffer.map(e => e.id),
                    ...capturedTheirOffer.map(e => e.id),
                ]
                supabase
                    .from('trade_listings')
                    .update({ status: 'pending' })
                    .in('id', tradedIds)
                    .then(({ error }) => { if (error) console.error('status update failed:', error) })

                const tradeId = crypto.randomUUID()

                const pendingRows = [
                    ...capturedMyOffer.map(e => ({
                        trade_id:    tradeId,
                        proposer_id: session.user.id,
                        old_user:    session.user.id,
                        new_user:    theirUserId,
                        book_id:     e.book.id,
                        location:    meetupLocation.trim(),
                        date_time:   meetupDateTime.toISOString(),
                    })),
                    ...capturedTheirOffer.map(e => ({
                        trade_id:    tradeId,
                        proposer_id: session.user.id,
                        old_user:    theirUserId,
                        new_user:    session.user.id,
                        book_id:     e.book.id,
                        location:    meetupLocation.trim(),
                        date_time:   meetupDateTime.toISOString(),
                    })),
                ]
                supabase
                    .from('pending_trades')
                    .insert(pendingRows)
                    .then(({ error }) => { if (error) console.error('pending_trades insert failed:', error) })
            }
        }

        const books = []

        mySlots.forEach((slot, i) => {
            const r = slot.getBoundingClientRect()
            books.push({
                key: `my-${i}-${Date.now()}`,
                src: capturedMyOffer[i]?.book?.thumbnail || null,
                title: capturedMyOffer[i]?.book?.title || '',
                startX: r.left, startY: r.top,
                endX: theirDest.x, endY: theirDest.y,
                delay: i * 0.08,
                onLanded: onOneLanded,
            })
        })

        theirSlots.forEach((slot, i) => {
            const r = slot.getBoundingClientRect()
            books.push({
                key: `their-${i}-${Date.now()}`,
                src: capturedTheirOffer[i]?.book?.thumbnail || null,
                title: capturedTheirOffer[i]?.book?.title || '',
                startX: r.left, startY: r.top,
                endX: myDest.x, endY: myDest.y,
                delay: (capturedTheirOffer.length - 1 - i) * 0.08,
                onLanded: onOneLanded,
            })
        })

        setFlying(true)
        setConfirmed(true)
        setFlyingBooks(books)
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
                    bookcaseRef={myBookcaseRef}
                    receivedEntries={receivedByMe}
                />

                <div className="trade-center">
                    <div className="container">
                        <BookShelf
                            offer={myOffer}
                            onRemove={entry => setMyOffer(prev => prev.filter(e => e.id !== entry.id))}
                            onRemoveAll={() => setMyOffer([])}
                            label="my books"
                            flying={flying}
                            shelfRef={myShelfRef}
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
                            flying={flying}
                            shelfRef={theirShelfRef}
                        />
                    </div>

                    <div className="trade-meetup-fields">
                        <input
                            className="trade-meetup-input"
                            type="text"
                            placeholder="Meetup location"
                            value={meetupLocation}
                            onChange={e => setMeetupLocation(e.target.value)}
                            disabled={flying}
                        />
                        <DatePicker
                            selected={meetupDateTime}
                            onChange={date => setMeetupDateTime(date)}
                            showTimeSelect
                            timeFormat="h:mm aa"
                            timeIntervals={15}
                            dateFormat="MMM d, yyyy  h:mm aa"
                            placeholderText="Select date & time"
                            minDate={new Date()}
                            className="trade-meetup-input"
                            popperClassName="trade-datepicker-popper"
                            disabled={flying}
                        />
                    </div>

                    <div className="button">
                        <button
                            className="confirm"
                            onClick={handlePropose}
                            disabled={flying || !meetupLocation.trim() || !meetupDateTime}
                        >
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
                    bookcaseRef={theirBookcaseRef}
                    receivedEntries={receivedByThem}
                />

            </div>

            {/* Flying book clones */}
            {flyingBooks.map(b => (
                <FlyingBook key={b.key} {...b} />
            ))}

            {hoveredEntry && (
                <div
                    className="trade-popup"
                    style={popupStyle}
                    onMouseEnter={onPopupEnter}
                    onMouseLeave={onPopupLeave}
                >
                    {hoveredEntry.book.thumbnail ? (
                        <img
                            src={secureImageUrl(hoveredEntry.book.thumbnail)}
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
