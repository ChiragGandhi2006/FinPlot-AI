import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Bot, User as UserIcon, MessageCircle, Wand2, Paperclip, FileText } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { aiApi } from '../api/ai'
import { getAIResponse } from '../utils/chatbot'
import { generateWelcomeMessages } from '../utils/insights'
import { QUICK_QUESTIONS, LS_KEYS } from '../constants'
import { getItem } from '../utils/storage'
import { formatMoney } from '../utils/format'

const ALLOWED = 'text/csv,text/plain,application/pdf,text/comma-separated-values,application/vnd.ms-excel,.csv,.txt,.pdf'

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-500"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}

function statementMessage(filename, res) {
  const s = res?.summary || {}
  const lines = [
    `I analyzed your statement: ${filename} 📄\n\n`,
    `• Transactions read: ${s.transaction_count ?? 0}\n`,
    `• Total debits: ${formatMoney(s.debit_total)}\n`,
    `• Total credits: ${formatMoney(s.credit_total)}\n`,
    `• Net: ${formatMoney(s.net)}\n\n`,
    'Here are my suggestions 💡\n',
  ]
  ;(res?.suggestions || []).forEach((tip) => lines.push(`• ${tip}\n`))
  if (res?.recurring?.length) {
    lines.push('\nRepeated charges to audit:\n')
    res.recurring.slice(0, 4).forEach(([m, n]) => lines.push(`• ${m} (${n}x)\n`))
  }
  return lines.join('')
}

export default function AIChat() {
  const { user } = useAuth()
  const data = useData()
  const [messages, setMessages] = useState(() => [
    { id: 'welcome-1', role: 'ai', text: generateWelcomeMessages(user)[0] },
    { id: 'welcome-2', role: 'ai', text: generateWelcomeMessages(user)[1] },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [engine, setEngine] = useState('live')
  const scrollRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const pushAi = (text) => {
    setMessages((m) => [...m, { id: `ai-${Date.now()}`, role: 'ai', text }])
  }

  const send = async (raw) => {
    const text = raw?.trim()
    if (!text || typing) return
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text }])
    setInput('')
    setTyping(true)
    try {
      const history = messages
        .filter((m) => m.role !== 'system')
        .slice(-6)
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
      const res = await aiApi.chat(text, history)
      const reply = typeof res === 'object' && res.reply ? res.reply : String(res || '')
      if (reply) {
        setEngine('live')
        pushAi(reply)
        return
      }
      throw new Error('empty reply')
    } catch {
      setEngine('local')
      const response = getAIResponse(text, {
        incomes: data.incomes,
        expenses: data.expenses,
        incomeCategories: data.incomeCategories,
        expenseCategories: data.expenseCategories,
        goals: data.goals,
        budgets: getItem(LS_KEYS.budgets, []),
      })
      pushAi(response.text)
    } finally {
      setTyping(false)
    }
  }

  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    analyzeFile(file)
  }

  const analyzeFile = async (file) => {
    if (typing) return
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: `📎 Uploaded statement: ${file.name}` }])
    setTyping(true)
    try {
      const res = await aiApi.analyzeStatement(file)
      pushAi(statementMessage(file.name, res))
      setEngine('live')
    } catch (err) {
      pushAi(`I couldn't parse that statement. ${err?.message || ''}\n\nTry a CSV exported from your bank, or ask me a question about your existing data.`)
    } finally {
      setTyping(false)
    }
  }

  const forecastNow = async () => {
    if (typing) return
    setMessages((m) => [...m, { id: `u-${Date.now()}`, role: 'user', text: 'Forecast my next 3 months' }])
    setTyping(true)
    try {
      const res = await aiApi.forecast(3)
      const rows = (res?.savings || []).map(
        (r) => `• ${r.month}: income ${formatMoney(res.income.find((x) => x.month === r.month)?.value)}, expense ${formatMoney(res.expense.find((x) => x.month === r.month)?.value)}, savings ${formatMoney(r.value)}`
      )
      pushAi(`📈 Next 3 months (trend estimate)\n\n${rows.join('\n')}\n\nThese are trend estimates, not guarantees.`)
      setEngine('live')
    } catch {
      pushAi(getAIResponse('forecast next 3 months', { incomes: data.incomes, expenses: data.expenses, incomeCategories: data.incomeCategories, expenseCategories: data.expenseCategories, goals: data.goals }).text)
      setEngine('local')
    } finally {
      setTyping(false)
    }
  }

  const quickQuestions = [...QUICK_QUESTIONS.slice(0, 4), 'Forecast my next 3 months', QUICK_QUESTIONS[4]]

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col">
      <div className="glass-card mb-4 flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 text-white shadow-glow">
            <Sparkles size={22} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">FinPilot AI</h2>
            <p className="text-xs font-medium text-green-600 dark:text-green-400">
              ● Online · Analyzes your live data
              {engine === 'local' && <span className="text-amber-500"> · offline fallback</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25 sm:flex"
          >
            <Paperclip size={13} /> Upload statement
          </button>
          <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300 md:flex">
            <Wand2 size={13} /> AI Co-pilot
          </span>
        </div>
        <input ref={fileRef} type="file" accept={ALLOWED} onChange={onPickFile} className="hidden" aria-label="Upload bank statement" />
      </div>

      <div className="glass-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((m) =>
            m.role === 'user' ? (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex justify-end"
              >
                <div className="flex max-w-[80%] items-end gap-2.5 sm:max-w-[70%]">
                  <div className="rounded-3xl rounded-br-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-medium leading-relaxed text-white shadow-glow">
                    {m.text}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                    <UserIcon size={15} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex justify-start"
              >
                <div className="flex max-w-[85%] items-end gap-2.5 sm:max-w-[75%]">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                    <Bot size={15} />
                  </div>
                  <div className="rounded-3xl rounded-bl-lg border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-soft dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                    {m.text.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('•') ? 'mt-0.5' : 'mt-1.5 first:mt-0'}>{line || ' '}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          )}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-end gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  <Bot size={15} />
                </div>
                <div className="rounded-3xl rounded-bl-lg border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800 sm:p-4">
          <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => (q === 'Forecast my next 3 months' ? forecastNow() : send(q))}
                className="shrink-0 rounded-full border border-indigo-200/70 bg-indigo-50/70 px-3.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 p-1.5 pl-4 shadow-soft transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/70"
          >
            <MessageCircle size={18} className="shrink-0 text-slate-400" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your money, or upload a bank statement…"
              className="w-full bg-transparent py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              aria-label="Ask AI"
            />
            <button
              onClick={() => fileRef.current?.click()}
              type="button"
              aria-label="Attach statement"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700"
            >
              <Paperclip size={17} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-glow transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send size={17} />
            </button>
          </form>
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] font-medium text-slate-400">
            <FileText size={11} /> Upload a CSV bank statement to get personalized suggestions, or ask any finance question.
          </p>
        </div>
      </div>
    </div>
  )
}