# Tantine

Mobile instant messaging application developed in React Native for a customer, with a backend based on tRPC and Prisma

## How to install the app

Install Bun and setup a MySQL server

### backend setup

```
cd server
bun install
bun prisma db push
cp .env.example .env
# modify the mysql url in the .env file
bun dev:server
```

### app setup

```
cd app
bun install
bun start
# or
bun ios
# or (not fully implemented)
bun android
```
