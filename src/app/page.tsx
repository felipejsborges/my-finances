'use client'

import { PaymentMethod, Tag, Transaction } from '@prisma/client';
import { useEffect, useState } from 'react';

interface Filter {
  [key: keyof Transaction]: string
}

interface Sort {
  [key: keyof Transaction]: 'asc' | 'desc'
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [file, setFile] = useState<File>()
  const [search, setSearch] = useState<string>('')
  const [filters, setFilters] = useState<Filter>({})
  const [sort, setSort] = useState<Sort>({})
  const [modifiedTransactionsIds, setModifiedTransactionsIds] = useState<Number[]>([])

  const fieldsOfATransaction = transactions.length ? Object.keys(transactions[0]) : []

  function convertFiltersToQueryParams(obj: Filter) {
    return Object.keys(obj).map(key => `${key}=${obj[key]}`).join('&')
  }

  function convertSortsObjectToQueryParams(obj: Sort) {
    return Object.keys(obj).map(key => `${obj[key] === 'desc' ? '-' : ''}${key}`).join(',')
  }

  function fetchTransactions() {
    let queryParams = '?'
    if (search) queryParams += `search=${search}&`
    if (Object.keys(filters).length) queryParams += `${convertFiltersToQueryParams(filters)}&`
    if (Object.keys(sort).length) queryParams += `sort=${convertSortsObjectToQueryParams(sort)}&`

    fetch(`/api/transactions${queryParams}`)
      .then((res) => res.json())
      .then((json) => {
        setTransactions(json)
      })
      .catch((e) => {
        // Handle errors here
        console.error(e)
      })
  }

  function fetchTags() {
    fetch(`/api/tags`)
      .then((res) => res.json())
      .then((json) => {
        setTags(json)
      })
      .catch((e) => {
        // Handle errors here
        console.error(e)
      })
  }

  function onChangeFilterKey(oldKey: keyof Transaction, newKey: keyof Transaction) {
    delete filters[oldKey]
    filters[newKey] = ''
    setFilters({ ...filters })
  }

  function onChangeFilterValue(key: keyof Transaction, value: string) {
    filters[key] = value
    setFilters({ ...filters })
  }

  function onClickToRemoveFilter(key: keyof Transaction) {
    delete filters[key]
    setFilters({ ...filters })
  }

  function onChangeSortKey(oldKey: keyof Transaction, newKey: keyof Transaction) {
    delete sort[oldKey]
    sort[newKey] = 'asc'
    setSort({ ...sort })
  }

  function onChangeSortOrder(key: keyof Transaction, order: 'asc' | 'desc') {
    sort[key] = order
    setSort({ ...sort })
  }

  function onClickToRemoveSort(key: keyof Transaction) {
    delete sort[key]
    setSort({ ...sort })
  }

  function onChangeTableItemValue(index: number, key: keyof Transaction, value: string) {
    setModifiedTransactionsIds([...modifiedTransactionsIds, transactions[index].id])
    transactions[index][key] = value
    setTransactions([...transactions])
  }

  const onSubmitUpload = async (e: React.FormEvent<HTMLFormElement>) => {
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

  function onSaveTransactions() {
    const transactionsToSave = transactions.filter(transaction => modifiedTransactionsIds.includes(transaction.id))
    fetch('/api/transactions/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactions: transactionsToSave })
    })
      .then((res) => res.json())
      .then(() => {
        fetchTransactions()
      })
      .catch((e) => {
        // Handle errors here
        console.error(e)
      })
  }

  useEffect(() => {
    fetchTransactions()
    fetchTags()
  }, [])

  return (
    <main>
      <form onSubmit={onSubmitUpload}>
        <input
          type="file"
          name="file"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <input type="submit" value="Upload" />
      </form>
      <div>
        <h3>Search</h3>
        <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div>
          <h3>Filters</h3>
          {Object.entries(filters).map(([key, value], index) => (
            <div key={key + index}>
              <select
                value={key}
                onChange={e => onChangeFilterKey(key, e.target.value as keyof Transaction)}
              >
                {fieldsOfATransaction.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
              <input
                value={value}
                onChange={e => onChangeFilterValue(key as keyof Transaction, e.target.value)}
              />
              <button
                onClick={() => onClickToRemoveFilter(key as keyof Transaction)}
              >X</button>
            </div>
          ))}
          <button
            onClick={() => setFilters({ ...filters, [fieldsOfATransaction[0]]: '' })}
          >+</button>
        </div>
        <div>
          <h3>Sort</h3>
          {Object.entries(sort).map(([key, value], index) => (
            <div key={key + index}>
              <select
                value={key}
                onChange={e => onChangeSortKey(key, e.target.value as keyof Transaction)}
              >
                {fieldsOfATransaction.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
              <select
                value={sort[key].order}
                onChange={e => onChangeSortOrder(key, e.target.value)}
              >
                {['asc', 'desc'].map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
              <button
                onClick={() => onClickToRemoveSort(key as keyof Transaction)}
              >X</button>
            </div>
          ))}
          <button
            onClick={() => setSort({ ...sort, [fieldsOfATransaction[0]]: { value: '', order: 'asc' } })}
          >+</button>
        </div>
        <button onClick={fetchTransactions}>
          OK
        </button>
      </div>
      <div>
        <button onClick={onSaveTransactions}>
          Save
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Description</th>
            <th>PaymentMethod</th>
            <th>SourceDestination</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={transaction.id}>
              <td>
                <input
                  value={transaction.date.toString()}
                  onChange={e => onChangeTableItemValue(
                    index,
                    'date',
                    e.target.value
                  )}
                />
              </td>
              <td>
                <input
                  value={transaction.amount.toString()}
                  onChange={e => onChangeTableItemValue(
                    index,
                    'amount',
                    e.target.value
                  )}
                />
              </td>
              <td>
                <input
                  value={transaction.description}
                  onChange={e => onChangeTableItemValue(
                    index,
                    'description',
                    e.target.value
                  )}
                />
              </td>
              <td>
                <select
                  value={transaction.paymentMethod}
                  onChange={e => onChangeTableItemValue(
                    index,
                    'paymentMethod',
                    e.target.value
                  )}
                >
                  {[...[""], ...Object.values(PaymentMethod || [])].map(paymentMethod => (
                    <option key={paymentMethod} value={paymentMethod}>{paymentMethod}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  value={transaction.sourceDestination}
                  onChange={e => onChangeTableItemValue(
                    index,
                    'sourceDestination',
                    e.target.value
                  )}
                />
              </td>
              <td>
                <select
                  value={transaction.tags?.length ? transaction.tags[0].id : ""}
                  onChange={e => onChangeTableItemValue(
                    index,
                    'tags',
                    [{ id: e.target.value }]
                  )}
                >
                  {[[{ id: "", name: "" }], ...tags].map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}