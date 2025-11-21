import prisma from '../config/database';

export const categoryService = {
  async getAll() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  },

  async create(name: string) {
    return await prisma.category.create({
      data: { name: name.toLowerCase().trim() }
    });
  },

  async update(id: string, name: string) {
    return await prisma.category.update({
      where: { id },
      data: { name: name.toLowerCase().trim() }
    });
  },

  async delete(id: string) {
    return await prisma.category.delete({
      where: { id }
    });
  },

  async findByName(name: string) {
    return await prisma.category.findUnique({
      where: { name: name.toLowerCase().trim() }
    });
  }
};

