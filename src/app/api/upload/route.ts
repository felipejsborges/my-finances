import { PrismaClient, Transaction } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

type TransactionInput = Omit<Transaction, 'id'>

function convertToDbColumnName(name: string): keyof TransactionInput | null {
	switch (name) {
		case 'Data':
			return 'date'
		case 'Valor':
			return 'amount'
		case 'Descrição':
			return 'description'
		default:
			return null
	}
}

export async function POST(request: NextRequest) {
	const data = await request.formData()
	const file: File | null = data.get('file') as unknown as File

	if (!file) {
		return NextResponse.json({ success: false })
	}

	const bytes = await file.arrayBuffer()
	const buffer = Buffer.from(bytes)

	// Convert the buffer to a string
	const csvString = buffer.toString()

	// Split the string into lines
	const lines = csvString.split('\n')

	// Remove the header line if present
	const headerAsStr = lines[0]
	const headerAsList = headerAsStr.split(',')
	const csvDataStrPerLine = lines.slice(1)

	// Split each line into an array of values
	const csvDataListPerLine = csvDataStrPerLine.map((line) => line.split(','))

	const bulkData: TransactionInput[] = []

	csvDataListPerLine.forEach((line) => {
		if (!line || line.length === 0) {
			return
		}
		const obj: TransactionInput = {} as TransactionInput
		line.forEach((value, index) => {
			if (value === '') {
				return
			}
			const columnName = convertToDbColumnName(headerAsList[index])
			if (columnName === null) {
				return
			}
			if (columnName === 'date') {
				const [day, month, year] = value.split('/')
				const date = new Date(Number(year), Number(month) - 1, Number(day))
				value = date.toISOString()
			}
			obj[String(columnName)] = value
		})
		if (Object.keys(obj).length === 0) {
			return
		}
		obj.uniqueIdentifier = String(new Date().getTime()) + String(bulkData.length)
		bulkData.push(obj)
	})

	await prisma.transaction.createMany({
		data: bulkData,
	})

	return NextResponse.json({ success: true })
}

export async function GET() {
	const transactions = await prisma.transaction.findMany()
	return NextResponse.json(transactions)
}