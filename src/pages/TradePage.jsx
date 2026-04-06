import { useState } from 'react'
import './TradePage.css'
import topArrow from '../assets/top_arrow.png'
import bottomArrow from '../assets/bottom_arrow.png'
import removeIcon from '../assets/remove.png'

const PLACEHOLDER = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTMI5yf9vYw85Q9Qr4kI3HH-qHdza7Gzp5HQ&s'

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
                    <span className="empty-hint">no books added</span>
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

export default function TradePage() {
    const [myBooks, setMyBooks] = useState([])
    const [theirBooks, setTheirBooks] = useState([])
    const [confirmed, setConfirmed] = useState(false)

    return (
        <div className="trade-page">
            <div className="trade-header">
                <span className="trade-title">book trade</span>
            </div>

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
    )
}
