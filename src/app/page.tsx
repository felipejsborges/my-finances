'use client'

import { Transaction } from '@prisma/client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [file, setFile] = useState<File>()

  function fetchTransactions() {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((json) => {
        setTransactions(json)
      })
      .catch((e) => {
        // Handle errors here
        console.error(e)
      })
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    try {
      const data = new FormData()
      data.set('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })
      // handle the error
      if (!res.ok) throw new Error(await res.text())

      fetchTransactions()
    } catch (e: any) {
      // Handle errors here
      console.error(e)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <main>
      <form onSubmit={onSubmit}>
        <input
          type="file"
          name="file"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <input type="submit" value="Upload" />
      </form>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.date.toString()}</td>
              <td>{transaction.amount.toString()}</td>
              <td>{transaction.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}