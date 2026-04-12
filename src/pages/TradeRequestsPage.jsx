import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { spineColor } from '../utils/bookSpine'
import { secureImageUrl } from '../utils/image'
import { useAuthSession } from '../hooks/useAuthSession'
import './TradeRequestsPage.css'

function BookCover({ book }) {
  if (book?.thumbnail) {
    return (
      <img
        src={secureImageUrl(book.thumbnail)}
        alt={book.title}
        className="tr-book-cover"
      />
    )
  }
  return (
    <div
      className="tr-book-cover tr-book-cover--placeholder"
      style={{ background: spineColor(book?.title || 'x') }}
    >
      <span className="tr-book-cover-title">{book?.title}</span>
    </div>
  )
}

export default function TradeRequestsPage() {
  const { session } = useAuthSession()
  const [trades, setTrades]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [declining, setDeclining] = useState(null)

  useEffect(() => {
    if (session) fetchTrades()
    else setLoading(false)
  }, [session])

  async function fetchTrades() {
    setLoading(true)
    const userId = session.user.id

    const { data, error } = await supabase
      .from('pending_trades')
      .select('id, trade_id, proposer_id, old_user, new_user, book_id, location, date_time, book:books(id, title, authors, thumbnail, genre)')
      .or(`old_user.eq.${userId},new_user.eq.${userId}`)

    if (error) { console.error('fetchTrades error:', error); setLoading(false); return }

    // Group rows by trade_id
    const byTradeId = {}
    for (const row of data || []) {
      if (!byTradeId[row.trade_id]) byTradeId[row.trade_id] = []
      byTradeId[row.trade_id].push(row)
    }

    // Collect other user IDs
    const otherUserIds = []
    for (const rows of Object.values(byTradeId)) {
      const otherId = rows.find(r => r.old_user !== userId)?.old_user
      if (otherId && !otherUserIds.includes(otherId)) otherUserIds.push(otherId)
    }

    const { data: usersData } = otherUserIds.length
      ? await supabase.from('users').select('user_id, username').in('user_id', otherUserIds)
      : { data: [] }

    const nameById = Object.fromEntries((usersData || []).map(u => [u.user_id, u.username]))

    const tradeList = Object.entries(byTradeId).map(([tradeId, rows]) => {
      const myBooks     = rows.filter(r => r.old_user === userId)   // books I give
      const theirBooks  = rows.filter(r => r.old_user !== userId)   // books I receive
      const otherUserId = theirBooks[0]?.old_user ?? null
      const iProposed   = rows[0]?.proposer_id === userId
      const location    = rows[0]?.location ?? null
      const dateTime    = rows[0]?.date_time ?? null
      return {
        tradeId,
        otherUserId,
        otherUserName: nameById[otherUserId] ?? 'Unknown User',
        myBooks,
        theirBooks,
        iProposed,
        location,
        dateTime,
        rows,
      }
    })

    setTrades(tradeList)
    setLoading(false)
  }

  async function acceptTrade(trade) {
    setAccepting(trade.tradeId)
    const userId = session.user.id

    // 1. Insert received books for both parties
    for (const row of trade.theirBooks) {
      // Accepting user receives the other person's books
      const { error } = await supabase.from('user_books').insert({
        user_id: userId,
        book_id: row.book.id,
      })
      if (error) console.error('user_books insert failed (acceptor):', error, row.book)
    }
    for (const row of trade.myBooks) {
      // Proposer receives the accepting user's books
      const { error } = await supabase.from('user_books').insert({
        user_id: trade.otherUserId,
        book_id: row.book.id,
      })
      if (error) console.error('user_books insert failed (proposer):', error, row.book)
    }

    // 2. Delete trade_listings for all books in this trade (both sides)
    for (const row of trade.rows) {
      const { error } = await supabase
        .from('trade_listings')
        .delete()
        .eq('user_id', row.old_user)
        .eq('book_id', row.book.id)
      if (error) console.error('trade_listings delete failed:', error, row)
    }

    // 3. Delete pending_trades for this trade_id
    const { error: ptError } = await supabase
      .from('pending_trades')
      .delete()
      .eq('trade_id', trade.tradeId)
    if (ptError) console.error('pending_trades delete failed:', ptError)

    setTrades(prev => prev.filter(t => t.tradeId !== trade.tradeId))
    setAccepting(null)
  }

  async function declineTrade(trade) {
    setDeclining(trade.tradeId)

    // Revert trade_listings back to active
    for (const row of trade.rows) {
      await supabase
        .from('trade_listings')
        .update({ status: 'active' })
        .eq('user_id', row.old_user)
        .eq('book_id', row.book.id)
    }

    await supabase.from('pending_trades').delete().eq('trade_id', trade.tradeId)
    setTrades(prev => prev.filter(t => t.tradeId !== trade.tradeId))
    setDeclining(null)
  }

  return (
    <div className="tr-page">
      <div className="tr-inner">

        <div className="tr-header">
          <h1 className="tr-title">Trade Requests</h1>
          {!loading && trades.length > 0 && (
            <span className="tr-count">{trades.length} pending</span>
          )}
        </div>

        {!session && (
          <p className="tr-empty">Sign in to see your trade requests.</p>
        )}
        {session && loading && (
          <p className="tr-empty">Loading...</p>
        )}
        {session && !loading && trades.length === 0 && (
          <div className="tr-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c4bdb5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p className="tr-empty">No pending trade requests.</p>
          </div>
        )}

        <div className="tr-list">
          {trades.map((trade) => (
            <div key={trade.tradeId} className="tr-card">

              <div className="tr-card-header">
                <span className="tr-card-with">Trade with</span>
                <span className="tr-card-username">{trade.otherUserName}</span>
                <span className="tr-card-id">#{trade.tradeId.slice(0, 8)}</span>
              </div>

              <div className="tr-card-body">
                <div className="tr-side">
                  <p className="tr-side-label">They offer</p>
                  <div className="tr-books">
                    {trade.theirBooks.map((row) => (
                      <BookCover key={row.id} book={row.book} />
                    ))}
                    {trade.theirBooks.length === 0 && <span className="tr-no-books">—</span>}
                  </div>
                </div>

                <div className="tr-divider">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c4bdb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>

                <div className="tr-side">
                  <p className="tr-side-label">You give</p>
                  <div className="tr-books">
                    {trade.myBooks.map((row) => (
                      <BookCover key={row.id} book={row.book} />
                    ))}
                    {trade.myBooks.length === 0 && <span className="tr-no-books">—</span>}
                  </div>
                </div>
              </div>

              {(trade.location || trade.dateTime) && (
                <div className="tr-meetup">
                  {trade.location && (
                    <span className="tr-meetup-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {trade.location}
                    </span>
                  )}
                  {trade.dateTime && (
                    <span className="tr-meetup-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {new Date(trade.dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
              )}

              <div className="tr-card-actions">
                {trade.iProposed ? (
                  <span className="tr-waiting-label">
                    <span className="tr-waiting-dot" />
                    Waiting for {trade.otherUserName} to respond
                  </span>
                ) : (
                  <>
                    <button
                      className="tr-btn tr-btn--decline"
                      onClick={() => declineTrade(trade)}
                      disabled={declining === trade.tradeId || accepting === trade.tradeId}
                    >
                      {declining === trade.tradeId ? 'Declining...' : 'Decline'}
                    </button>
                    <button
                      className="tr-btn tr-btn--accept"
                      onClick={() => acceptTrade(trade)}
                      disabled={accepting === trade.tradeId || declining === trade.tradeId}
                    >
                      {accepting === trade.tradeId ? 'Accepting...' : 'Accept Trade'}
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
