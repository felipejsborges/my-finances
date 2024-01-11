import { Prisma, PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

function transformNextUrlSearchParamsInObject(
	nextUrlSearchParams: URLSearchParams
) {
	const result: any = {}
	for (const [key, value] of nextUrlSearchParams.entries()) {
		result[key] = value
	}
	return result
}

export async function GET(request: NextRequest) {

	const { search, sort, ...filters } = transformNextUrlSearchParamsInObject(request.nextUrl.searchParams)

	let where: Prisma.TransactionWhereInput = {}
	if (search) {
		filters.description = { contains: search, mode: 'insensitive' }
	}
	if (filters.tags) {
		filters.tags = { some: { name: filters.tags as string } }
	}
	if (filters.date) {
		const [year, month, day] = (filters.date as string).split('-')
		const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
		date.setHours(0, 0, 0, 0)
		filters.date = {
			gte: date,
			lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
		}
	}
	where = {
		...where,
		...filters,
	}

	const orderBy: Prisma.TransactionOrderByWithAggregationInput[] = [{
		date: 'desc',
	}]
	if (sort) {
		const sortItems = sort.split(',')
		sortItems.forEach((sortItem: any) => {
			let order: Prisma.SortOrder = 'asc'
			if (sortItem.startsWith('-')) {
				order = 'desc'
				sortItem = sortItem.substring(1) // Remove the leading "-"
			}
			orderBy.push({ [sortItem]: order })
		})
	}

	const transactions = await prisma.transaction.findMany({
		where,
		orderBy,
	})

	return NextResponse.json(transactions)
}
