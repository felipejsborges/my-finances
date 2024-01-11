import { Prisma, PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function PUT(request: NextRequest) {
	const { transactions } = await request.json()

	const updatePromises = transactions.map(async (transaction: any) => {
		const id = transaction.id
		delete transaction.id

		if (transaction.tags) {
			const parsedTags: Prisma.TagUpdateManyWithoutTransactionsNestedInput = {
				connect: transaction.tags.map((tag: any) => ({ id: Number(tag.id) }))
			}
			transaction.tags = parsedTags
		}
		return prisma.transaction.update({
			where: { id },
			data: transaction,
		})
	})

	await Promise.all(updatePromises)

	return NextResponse.json({ success: true })
}