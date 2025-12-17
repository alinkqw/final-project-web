import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

// временные тесты в памяти
const tests = [
  {
    id: 'conditions_if_else',
    title: 'Условные операторы',
    subtitle: 'if, else, логические выражения',
    level: 'easy',
    timeLimit: 20,
    questions: [
      {
        id: 'q1',
        text: 'Что делает оператор if?',
        type: 'single',
        options: [
          'Повторяет код',
          'Проверяет условие',
          'Завершает программу',
          'Объявляет переменную'
        ],
        correctIndices: [1]
      },
      {
        id: 'q2',
        text: 'Какие это логические выражения?',
        type: 'multiple',
        options: [
          'x > 0',
          'a + b',
          'isValid && isAdmin',
          '"hello"'
        ],
        correctIndices: [0, 2]
      }
    ]
  }
]

// список тестов
app.get('/api/tests', (req, res) => {
  const short = tests.map(t => ({
    id: t.id,
    title: t.title,
    subtitle: t.subtitle,
    level: t.level,
    timeLimit: t.timeLimit,
    questionCount: t.questions.length
  }))
  res.json(short)
})

// один тест
app.get('/api/tests/:id', (req, res) => {
  const test = tests.find(t => t.id === req.params.id)
  if (!test) return res.status(404).json({ error: 'Test not found' })
  res.json(test)
})

// приём ответов и подсчёт результата
app.post('/api/tests/:id/submit', (req, res) => {
  const test = tests.find(t => t.id === req.params.id)
  if (!test) return res.status(404).json({ error: 'Test not found' })

  const answers = req.body.answers || {}
  let correct = 0

  const details = test.questions.map(q => {
    const user = answers[q.id] || []
    const correctIndices = q.correctIndices || []
    const isCorrect =
      user.length === correctIndices.length &&
      user.every(i => correctIndices.includes(i))

    if (isCorrect) correct++

    return {
      questionId: q.id,
      text: q.text,
      options: q.options,
      correctIndices,
      userIndices: user,
      isCorrect
    }
  })

  const total = test.questions.length
  const score = Math.round((correct / total) * 100)

  res.json({ score, correct, total, details })
})

app.listen(PORT, () => {
  console.log(`Quiz backend running on http://localhost:${PORT}`)
})
