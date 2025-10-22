import { Prisma } from '@prisma/client';
import { CreateTransactionDTO } from './transactions.validator';
import { prisma } from '../../lib/db';

export async function createTransaction(userId: string, dto: CreateTransactionDTO) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const bookIds = dto.items.map(i => i.bookId);

    const books = await tx.book.findMany({
      where: { id: { in: bookIds }, deletedAt: null },
      select: { id: true, title: true, stockQuantity: true, price: true }
    });

    if (books.length !== bookIds.length) {
      throw Object.assign(new Error('One or more books not found'), { code: 'BOOK_NOT_FOUND' });
    }

    // Check stock + build items
    const itemsPayload = dto.items.map(it => {
      const b = books.find(x => x.id === it.bookId)!;
      if (b.stockQuantity < it.quantity) {
        throw Object.assign(new Error(`Insufficient stock for "${b.title}"`), { code: 'INSUFFICIENT_STOCK' });
      }
      const unitPrice = b.price;
      const subtotal = new Prisma.Decimal(b.price).times(it.quantity);
      return { bookId: it.bookId, quantity: it.quantity, unitPrice, subtotal };
    });

    const order = await tx.order.create({ data: { userId }, select: { id: true } });

    for (const ip of itemsPayload) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          bookId: ip.bookId,
          quantity: ip.quantity,
          unitPrice: ip.unitPrice,
          subtotal: ip.subtotal
        }
      });
      await tx.book.update({
        where: { id: ip.bookId },
        data: { stockQuantity: { decrement: ip.quantity } }
      });
    }

    const sum = await tx.orderItem.aggregate({
      _sum: { subtotal: true },
      where: { orderId: order.id }
    });

    const totalAmount = sum._sum.subtotal ?? new Prisma.Decimal(0);

    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        user: { select: { id: true, email: true, username: true } },
        orderItems: { include: { book: { select: { id: true, title: true, genreId: true } } } }
      }
    }).then(o => ({ ...o!, totalAmount }));
  });
}

export async function listTransactions(page = 1, limit = 10) {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, username: true } },
        orderItems: { include: { book: { select: { id: true, title: true, genreId: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    }),
    prisma.order.count()
  ]);
  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function getTransactionById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, username: true } },
      orderItems: { include: { book: { select: { id: true, title: true, genreId: true } } } }
    }
  });
}

export async function getStatistics() {
  const totalTransactions = await prisma.order.count();

  const avg = await prisma.$queryRaw<{ avg_nominal: Prisma.Decimal | null }[]>`
    SELECT AVG(t.sum_subtotal) AS avg_nominal
    FROM (
      SELECT order_id, SUM(subtotal) AS sum_subtotal
      FROM order_items
      GROUP BY order_id
    ) t
  `;
  const averageNominal = avg[0]?.avg_nominal ?? new Prisma.Decimal(0);

  const genreAgg = await prisma.$queryRaw<{ genre_id: string; name: string; trx_count: number }[]>`
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
    leastPopularGenre: least ? { id: least.genre_id, name: least.name, count: least.trx_count } : null
  };
}
