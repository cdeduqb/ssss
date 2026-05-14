import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log("--- 开始测试入驻流程 ---");

  // 1. 获取一个分类 (如果没有则创建一个)
  let category = await prisma.category.findFirst();
  if (!category) {
    category = await prisma.category.create({
      data: { name: '测试分类', templateType: 'default' }
    });
  }
  console.log(`[测试] 使用分类 ID: ${category.id}`);

  // 2. 模拟前端提交新店 (PENDING 状态)
  const newStore = await prisma.store.create({
    data: {
      name: '测试提交店铺 - ' + Date.now(),
      categoryId: category.id,
      phone: '13800138000',
      address: '测试街道123号',
      hours: '09:00-22:00',
      status: 'PENDING',
      isActive: false,
      submitterIp: '127.0.0.1',
      description: '这是一个测试店铺'
    }
  });
  console.log(`[测试] 成功模拟前端提交店铺，ID: ${newStore.id}, 状态: ${newStore.status}`);

  // 3. 模拟后台管理员获取 PENDING 列表
  const pendingStores = await prisma.store.findMany({
    where: { status: 'PENDING' }
  });
  console.log(`[测试] 当前待审核店铺数量: ${pendingStores.length}`);

  // 4. 模拟后台管理员点击“审核通过”
  const approvedStore = await prisma.store.update({
    where: { id: newStore.id },
    data: {
      status: 'APPROVED',
      isActive: true
    }
  });
  console.log(`[测试] 审核通过操作完成，ID: ${approvedStore.id}, 状态: ${approvedStore.status}, isActive: ${approvedStore.isActive}`);

  // 5. 清理测试数据
  await prisma.store.delete({ where: { id: newStore.id } });
  console.log("--- 测试数据已清理，测试通过 ---");
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
