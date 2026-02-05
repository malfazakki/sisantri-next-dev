import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create Organization
    const org = await prisma.organization.upsert({
        where: { slug: 'sisantri-dev' },
        update: {},
        create: {
            name: 'SisAntri Dev Organization',
            slug: 'sisantri-dev',
            address: 'Jl. Contoh No. 123, Jakarta',
            phone: '08123456789',
            email: 'admin@sisantri.com',
        },
    })
    console.log(`✅ Created Organization: ${org.name}`)

    // 2. Create Admin Role
    const adminRole = await prisma.role.upsert({
        where: {
            name_organizationId: {
                name: 'ADMIN',
                organizationId: org.id,
            },
        },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'System Administrator with full access',
            organizationId: org.id,
        },
    })
    console.log(`✅ Created Role: ${adminRole.name}`)

    // 3. Create IT Division
    const itDivision = await prisma.division.upsert({
        where: {
            name_organizationId: {
                name: 'IT Division',
                organizationId: org.id,
            },
        },
        update: {},
        create: {
            name: 'IT Division',
            organizationId: org.id,
        },
    })
    console.log(`✅ Created Division: ${itDivision.name}`)

    // 4. Create Software Development Department
    const softwareDept = await prisma.department.upsert({
        where: {
            name_divisionId: {
                name: 'Software Development',
                divisionId: itDivision.id,
            },
        },
        update: {},
        create: {
            name: 'Software Development',
            divisionId: itDivision.id,
        },
    })
    console.log(`✅ Created Department: ${softwareDept.name}`)

    // 5. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@sisantri.com' },
        update: {
            password: hashedPassword,
            organizationId: org.id,
        },
        create: {
            email: 'admin@sisantri.com',
            password: hashedPassword,
            organizationId: org.id,
        },
    })
    console.log(`✅ Created User: ${adminUser.email}`)

    // 6. Create User Role Relationship
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    })
    console.log('✅ Linked User to Admin Role')

    // 7. Create Profile with Division and Department
    await prisma.profile.upsert({
        where: { userId: adminUser.id },
        update: {
            fullName: 'Administrator',
            empId: 'ADM-001',
            organizationId: org.id,
            divisionId: itDivision.id,
            departmentId: softwareDept.id,
        },
        create: {
            userId: adminUser.id,
            fullName: 'Administrator',
            empId: 'ADM-001',
            organizationId: org.id,
            divisionId: itDivision.id,
            departmentId: softwareDept.id,
        },
    })
    console.log('✅ Created User Profile')

    console.log('🏁 Seeding finished successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
