import { prisma } from '../../lib/db';
import { Prisma } from '@prisma/client';
import { CreateTransactionDTO } from './transactions.validator';

/**
 * Create an order with multiple items, decrement stock atomically,
 * capture unitPrice at purchase time, and compute totals.
 */
export async function createTransaction(userId: string, dto: CreateTransactionDTO) {
  return prisma.$transaction(async (tx) => {
    // Read all books upfront and ensure enough stock
    const bookIds = dto.items.map(i => i.bookId);
    const books = await tx.book.findMany({
      where: { id: { in: bookIds }, deletedAt: null },
      select: { id: true, price: true, stockQuantity: true, title: true },
    });

    if (books.length !== bookIds.length) {
      throw Object.assign(new Error('One or more books not found or deleted'), { code: 'BOOK_NOT_FOUND' });
    }

    // Validate stock and prepare order items payload
    const itemsPayload = dto.items.map(it => {
      const b = books.find(x => x.id === it.bookId)!;
      if (b.stockQuantity < it.quantity) {
        throw Object.assign(new Error(`Insufficient stock for "${b.title}"`), { code: 'INSUFFICIENT_STOCK', bookId: b.id });
      }
      const unitPrice = b.price;
      const subtotal = unitPrice.mul(it.quantity); // Decimal.js-like in Prisma; but better compute after create using tx
      return { bookId: it.bookId, quantity: it.quantity, unitPrice, subtotal };
    });

    // Create order first
    const order = await tx.order.create({
      data: {
        userId,
      },
      select: { id: true },
    });

    // Create order_items and decrement stock
    for (const ip of itemsPayload) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          bookId: ip.bookId,
          quantity: ip.quantity,
          unitPrice: ip.unitPrice,
          subtotal: ip.subtotal,
        } as any, // unitPrice/subtotal are Decimal
      });
      await tx.book.update({
        where: { id: ip.bookId },
        data: { stockQuantity: { decrement: ip.quantity } },
      });
    }

    // Compute totalAmount
    const agg = await tx.orderItem.aggregate({
      _sum: { subtotal: true },
      where: { orderId: order.id },
    });
    const totalAmount = agg._sum.subtotal ?? new Prisma.Decimal(0);

    // Optionally persist a total on Order (if you added a column). If not in schema, skip this.
    // await tx.order.update({ where: { id: order.id }, data: { totalAmount } });

    // Return full order
    const created = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: { book: { select: { id: true, title: true, genreId: true } } },
        },
        user: { select: { id: true, email: true, username: true } },
      },
    });
    return { ...created, totalAmount };
  });
}

export async function listTransactions(page = 1, limit = 10) {
  const take = limit;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, username: true } },
        orderItems: {
          include: { book: { select: { id: true, title: true, genreId: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take, skip,
    }),
    prisma.order.count(),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function getTransactionById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, username: true } },
      orderItems: {
        include: { book: { select: { id: true, title: true, genreId: true } } },
      },
    },
  });
}

/** Sales statistics:
 * - total transactions
 * - average nominal per transaction
 * - genre with most transactions
 * - genre with least transactions
 *
 * We use a raw SQL because Prisma groupBy can't join across relations.
 */
export async function getStatistics() {
  const totalTransactions = await prisma.order.count();

  // Average nominal: average sum of subtotals per order
  const avg = await prisma.$queryRaw<
    { avg_nominal: Prisma.Decimal | null }[]
  >`
    SELECT AVG(t.sum_subtotal) AS avg_nominal
    FROM (
      SELECT order_id, SUM(subtotal) AS sum_subtotal
      FROM order_items
      GROUP BY order_id
    ) t
  `;
  const averageNominal = avg[0]?.avg_nominal ?? new Prisma.Decimal(0);

  // Genre popularity by transaction count (count of order_items rows per genre)
  const genreAgg = await prisma.$queryRaw<
    { genre_id: string; name: string; trx_count: number }[]
  >`
    SELECT g.id AS genre_id, g.name, COUNT(oi.id)::int AS trx_count
    FROM order_items oi
    JOIN books b ON b.id = oi.book_id
    JOIN genres g ON g.id = b.genre_id
    GROUP BY g.id, g.name
    ORDER BY trx_count DESC
  `;

  const most = genreAgg[0] ?? null;
  const least = genreAgg.length ? genreAgg[genreAgg.length - 1] : null;

  return {
    totalTransactions,
    averageNominal,
    mostPopularGenre: most ? { id: most.genre_id, name: most.name, count: most.trx_count } : null,
    leastPopularGenre: least ? { id: least.genre_id, name: least.name, count: least.trx_count } : null,
  };
}
