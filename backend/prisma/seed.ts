import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create sample user
  const hashedPassword = await bcrypt.hash('changeme', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'prasham@example.com' },
    update: {},
    create: {
      email: 'prasham@example.com',
      password: hashedPassword,
      name: 'Prasham',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create fitness template
  const fitnessTemplate = await prisma.template.upsert({
    where: { name: 'Fitness 4-Month Plan' },
    update: {},
    create: {
      name: 'Fitness 4-Month Plan',
      description: 'A comprehensive 4-month fitness program',
      category: 'Fitness',
      defaultTasks: JSON.stringify([
        { title: 'Morning cardio 30min', isRecurring: true, recurrence: 'daily' },
        { title: 'Protein intake - log meal', isRecurring: true, recurrence: 'daily' },
        { title: 'DSA practice 45min', isRecurring: true, recurrence: 'daily' },
        { title: 'Sleep by 11pm', isRecurring: true, recurrence: 'daily' },
      ]),
    },
  });

  console.log('✅ Created template:', fitnessTemplate.name);

  // Create 4-month fitness goal
  const startDate = new Date('2025-06-01T00:00:00Z');
  const deadline = new Date('2025-09-30T00:00:00Z');

  const goal = await prisma.goal.upsert({
    where: { id: 'sample-fitness-goal' },
    update: {},
    create: {
      id: 'sample-fitness-goal',
      userId: user.id,
      title: '4-Month Fitness Transformation',
      description: 'Complete fitness program with daily cardio, nutrition tracking, and skill development',
      startDate,
      deadline,
      template: 'Fitness 4-Month Plan',
      defaultTasks: JSON.stringify([
        { title: 'Morning cardio 30min', isRecurring: true, recurrence: 'daily' },
        { title: 'Protein intake - log meal', isRecurring: true, recurrence: 'daily' },
        { title: 'DSA practice 45min', isRecurring: true, recurrence: 'daily' },
        { title: 'Sleep by 11pm', isRecurring: true, recurrence: 'daily' },
      ]),
    },
  });

  console.log('✅ Created goal:', goal.title);

  // Create some one-off tasks
  await prisma.task.create({
    data: {
      goalId: goal.id,
      userId: user.id,
      date: new Date('2025-06-10T00:00:00Z'),
      title: 'Gym: Leg day',
      notes: 'Focus on squats and lunges',
      isRecurring: false,
      completed: false,
    },
  });

  await prisma.task.create({
    data: {
      goalId: goal.id,
      userId: user.id,
      date: new Date('2025-06-15T00:00:00Z'),
      title: 'Fitness assessment with trainer',
      notes: 'Measure progress and adjust plan',
      isRecurring: false,
      completed: false,
    },
  });

  await prisma.task.create({
    data: {
      goalId: goal.id,
      userId: user.id,
      date: new Date('2025-07-01T00:00:00Z'),
      title: 'Monthly progress photos',
      notes: 'Track physical transformation',
      isRecurring: false,
      completed: false,
    },
  });

  console.log('✅ Created one-off tasks');

  // Create language learning template
  await prisma.template.upsert({
    where: { name: 'Language Learning 90 Days' },
    update: {},
    create: {
      name: 'Language Learning 90 Days',
      description: 'Intensive 90-day language learning program',
      category: 'Education',
      defaultTasks: JSON.stringify([
        { title: 'Duolingo 30min', isRecurring: true, recurrence: 'daily' },
        { title: 'Watch content in target language', isRecurring: true, recurrence: 'daily' },
        { title: 'Practice speaking 15min', isRecurring: true, recurrence: 'daily' },
        { title: 'Vocabulary review', isRecurring: true, recurrence: 'daily' },
      ]),
    },
  });

  console.log('✅ Created language learning template');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
