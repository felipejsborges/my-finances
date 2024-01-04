import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
	const transactions = await prisma.transaction.findMany()
	return NextResponse.json(transactions)
}