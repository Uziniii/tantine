# Tantine

Mobile instant messaging application developed in React Native for a customer, with a backend based on tRPC and Prisma

<img src="https://github.com/user-attachments/assets/0993aabd-fdff-4718-aa95-22430df7cbc4" width="45%"></img>
<img src="https://github.com/user-attachments/assets/621753d8-62cc-4e67-95fa-367216f881df" width="45%"></img> 

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
